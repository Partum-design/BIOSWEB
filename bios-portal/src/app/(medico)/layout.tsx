import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { getDemoSession } from "@/lib/demo-server";
import { createClient } from "@/lib/supabase/server";
import { MedicoSidebar } from "@/components/layout/MedicoSidebar";

export default async function MedicoLayout({ children }: { children: React.ReactNode }) {
  if (isDemoMode) {
    const session = getDemoSession();

    if (!session) redirect("/login");
    if (!["doctor", "admin"].includes(session.role)) redirect("/dashboard");

    return (
      <div className="flex min-h-screen bg-bios-bg">
        <MedicoSidebar profile={session.profile} />
        <main className="flex-1 min-w-0 pt-16 lg:pt-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  if (!["doctor", "admin"].includes(profile.role)) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-bios-bg">
      <MedicoSidebar profile={profile} />
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
