import { createAdminClient } from "@/lib/supabase/server";
import { hashToken } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

// Este endpoint solo verifica si un token es válido, sin devolver el resultado
// Usado por el frontend para validación rápida sin cargar toda la página
export async function POST(req: NextRequest) {
  let token: string;
  try {
    const body = await req.json();
    token = body.token;
  } catch {
    return NextResponse.json({ valid: false, reason: "invalid_request" }, { status: 400 });
  }

  if (!token || typeof token !== "string" || token.length < 32) {
    return NextResponse.json({ valid: false, reason: "invalid_token" });
  }

  const adminClient = createAdminClient();
  const tokenHash = hashToken(token);

  const { data: link } = await adminClient
    .from("result_access_links")
    .select("id, revoked_at, expires_at")
    .eq("token_hash", tokenHash)
    .single();

  if (!link) {
    return NextResponse.json({ valid: false, reason: "not_found" });
  }

  if (link.revoked_at) {
    return NextResponse.json({ valid: false, reason: "revoked" });
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, reason: "expired" });
  }

  await logAudit({
    actorProfileId: null,
    action: "link.access",
    entityType: "result_access_link",
    entityId: link.id,
    metadata: { source: "verify_api" },
  });

  return NextResponse.json({ valid: true });
}
