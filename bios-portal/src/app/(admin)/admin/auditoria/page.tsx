import { demoAuditLogs, isDemoMode } from "@/lib/demo";
import { formatRelativeTime } from "@/lib/utils";
import { Activity } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Auditoría" };

const actionLabels: Record<string, string> = {
  "result.upload": "Resultado subido",
  "result.publish": "Resultado publicado",
  "result.view": "Resultado visto",
  "result.download": "Descarga",
  "link.create": "Link creado",
  "link.access": "Link accedido",
  "link.revoke": "Link revocado",
  "auth.login": "Inicio de sesión",
  "auth.logout": "Cierre de sesión",
};

export default function AdminAuditoriaPage() {
  const events = isDemoMode ? demoAuditLogs : [];

  return (
    <div className="animate-page-enter space-y-6">
      <div>
        <h1 className="font-outfit text-2xl font-black text-bios-navy">Auditoría</h1>
        <p className="text-sm text-gray-500">Eventos recientes de seguridad y acceso</p>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="bios-panel p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-bios-navy text-sm">
                {actionLabels[event.action] ?? event.action}
              </p>
              <p className="text-xs text-gray-400">
                {event.actor_profile_id ? `Usuario ${event.actor_profile_id}` : "Acceso público"} · {event.entity_type}
              </p>
            </div>
            <span className="text-xs text-gray-400">{formatRelativeTime(event.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
