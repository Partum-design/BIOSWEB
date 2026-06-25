import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { getDemoSession } from "@/lib/demo-server";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (isDemoMode) {
    const session = getDemoSession();

    if (!session) redirect("/login");
    if (session.role === "doctor") redirect("/medico");
    if (session.role === "admin") redirect("/admin");

    return (
      <div className="flex min-h-screen bg-bios-bg">
        <DashboardSidebar profile={session.profile} />
        <main className="flex-1 min-w-0 pl-0 lg:pl-0 pt-16 lg:pt-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Doctor o admin no tienen acceso al dashboard de paciente
  if (profile.role === "doctor") redirect("/medico");
  if (profile.role === "admin")  redirect("/admin");

  return (
    <div className="flex min-h-screen bg-bios-bg">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 min-w-0 pl-0 lg:pl-0 pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
