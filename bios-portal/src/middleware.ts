import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refrescar la sesión si expiró
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas públicas que nunca requieren auth
  const publicPaths = ["/consulta/", "/auth/", "/api/consulta/"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return supabaseResponse;
  }

  // Grupos de rutas protegidas
  const authOnlyPaths   = ["/login", "/registro", "/recuperar-password"];
  const patientPaths    = ["/dashboard"];
  const doctorPaths     = ["/medico"];
  const adminPaths      = ["/admin"];

  const isAuthRoute    = authOnlyPaths.some((r) => pathname.startsWith(r));
  const isPatientRoute = patientPaths.some((r) => pathname.startsWith(r));
  const isDoctorRoute  = doctorPaths.some((r) => pathname.startsWith(r));
  const isAdminRoute   = adminPaths.some((r) => pathname.startsWith(r));
  const isProtected    = isPatientRoute || isDoctorRoute || isAdminRoute;

  // Sin sesión → redirigir al login
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Con sesión en ruta de auth → redirigir según rol
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    if (profile?.role === "doctor") {
      url.pathname = "/medico";
    } else if (profile?.role === "admin") {
      url.pathname = "/admin";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  // Control de acceso por rol para rutas protegidas
  if (user && (isDoctorRoute || isAdminRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (isDoctorRoute && !["doctor", "admin"].includes(profile?.role ?? "")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isAdminRoute && profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Proteger todas las rutas excepto archivos estáticos y _next
    "/((?!_next/static|_next/image|favicon.ico|logos|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
