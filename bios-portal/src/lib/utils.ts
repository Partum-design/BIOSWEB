import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createHash, randomBytes } from "crypto";

// ─── Clases CSS ──────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Tokens seguros para links de consulta ───────────────────────────────────
export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// ─── Fechas ──────────────────────────────────────────────────────────────────
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return formatDate(dateString);
}

// ─── Rutas de storage ────────────────────────────────────────────────────────
export function getResultStoragePath(patientId: string, resultId: string, filename: string): string {
  return `${patientId}/${resultId}/${filename}`;
}

// ─── Truncar texto ───────────────────────────────────────────────────────────
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "…";
}

// ─── Iniciales ───────────────────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Calcular expiración de link ─────────────────────────────────────────────
export function getLinkExpiryDate(seconds: number = 2592000): Date {
  return new Date(Date.now() + seconds * 1000);
}

export function isLinkValid(link: {
  expires_at: string | null;
  revoked_at: string | null;
}): boolean {
  if (link.revoked_at) return false;
  if (link.expires_at && new Date(link.expires_at) < new Date()) return false;
  return true;
}
