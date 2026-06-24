import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Raíz del portal: redirige según estado de sesión y rol
export default async function RootPage() {
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
