import { redirect } from "next/navigation";
import { getDemoHomePath, isDemoMode } from "@/lib/demo";
import { getDemoSession } from "@/lib/demo-server";
import { createClient } from "@/lib/supabase/server";

// Raíz del portal: redirige según estado de sesión y rol
export default async function RootPage() {
  if (isDemoMode) {
    const session = getDemoSession();
    redirect(session ? getDemoHomePath(session.role) : "/login");
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "doctor") redirect("/medico");
  if (profile?.role === "admin")  redirect("/admin");
  redirect("/dashboard");
}
