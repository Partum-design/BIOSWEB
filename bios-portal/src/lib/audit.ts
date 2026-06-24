import { createAdminClient } from "@/lib/supabase/server";
import type { AuditAction } from "@/types";

interface AuditEntry {
  actorProfileId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

// Registrar una acción en el log de auditoría.
// Usa service_role para garantizar escritura aunque RLS esté activo.
// Silencia errores para no bloquear el flujo principal.
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const adminClient = createAdminClient();
    await adminClient.from("audit_logs").insert({
      actor_profile_id: entry.actorProfileId ?? null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
      metadata: (entry.metadata ?? null) as import("@/types/database").Json | null,
    });
  } catch {
    // No propagamos errores de auditoría para no afectar el flujo del usuario
  }
}
