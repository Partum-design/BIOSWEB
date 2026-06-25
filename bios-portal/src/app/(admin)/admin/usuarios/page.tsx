import { demoPatients, demoProfiles, isDemoMode } from "@/lib/demo";
import { Mail, ShieldCheck, Stethoscope, User, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Usuarios" };

export default function AdminUsuariosPage() {
  const profiles = isDemoMode ? Object.values(demoProfiles) : [];
  const patients = isDemoMode ? demoPatients.filter((patient) => !patient.profile_id) : [];

  return (
    <div className="animate-page-enter space-y-6">
      <div>
        <h1 className="font-outfit text-2xl font-black text-bios-navy">Usuarios</h1>
        <p className="text-sm text-gray-500">Cuentas, roles y pacientes registrados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profiles.map((profile) => {
          const Icon = profile.role === "admin" ? ShieldCheck : profile.role === "doctor" ? Stethoscope : User;
          const label = profile.role === "admin" ? "Administrador" : profile.role === "doctor" ? "Médico" : "Paciente";

          return (
            <div key={profile.id} className="bios-panel p-5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-bios-blue" />
              </div>
              <p className="font-bold text-bios-navy">{profile.full_name}</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Mail className="w-3 h-3" /> {profile.email}
              </p>
              <span className="bios-chip bg-gray-50 text-gray-600 border-bios-line text-xs mt-4">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="font-outfit text-lg font-black text-bios-navy mb-3">Pacientes sin cuenta</h2>
        <div className="space-y-3">
          {patients.map((patient) => (
            <div key={patient.id} className="bios-panel p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-bios-navy text-sm">{patient.full_name}</p>
                <p className="text-xs text-gray-400">{patient.email}</p>
              </div>
              <span className="bios-chip bg-amber-50 text-amber-700 border-amber-200 text-xs">
                Sin cuenta
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
