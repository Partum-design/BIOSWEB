"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import type { ActionResult } from "@/types";

// ─── Registro con email y contraseña ─────────────────────────────────────────
export async function signUp(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const email    = (formData.get("email")    as string)?.toLowerCase().trim();
  const password = formData.get("password")  as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const captchaToken = formData.get("captchaToken") as string | null;

  if (!email || !password || !fullName) {
    return { success: false, error: "Por favor llena todos los campos." };
  }
  if (password.length < 8) {
    return { success: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: "patient" },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      ...(captchaToken ? { captchaToken } : {}),
    },
  });

  if (error) {
    // Mensajes genéricos para evitar enumeración de usuarios
    if (error.message.includes("already registered")) {
      return { success: false, error: "Si el correo no está registrado, recibirás un enlace de confirmación." };
    }
    return { success: false, error: "No fue posible crear la cuenta. Intenta de nuevo." };
  }

  await logAudit({ action: "auth.register", entityType: "auth", metadata: { email } });

  return { success: true, data: undefined, message: "Revisa tu correo para confirmar tu cuenta." };
}

// ─── Inicio de sesión con email y contraseña ──────────────────────────────────
export async function signIn(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const email    = (formData.get("email")    as string)?.toLowerCase().trim();
  const password = formData.get("password")  as string;
  const captchaToken = formData.get("captchaToken") as string | null;

  if (!email || !password) {
    return { success: false, error: "Correo y contraseña son requeridos." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    ...(captchaToken ? { options: { captchaToken } } : {}),
  });

  if (error || !data.user) {
    // Mensaje genérico — no indicar si el correo existe o no
    return { success: false, error: "Correo o contraseña incorrectos." };
  }

  await logAudit({
    actorProfileId: data.user.id,
    action: "auth.login",
    entityType: "auth",
    entityId: data.user.id,
  });

  // La redirección por rol la maneja el middleware
  redirect("/");
}

// ─── Login con Google OAuth ───────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<ActionResult<{ url: string }>> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error || !data.url) {
    return { success: false, error: "No fue posible iniciar sesión con Google." };
  }

  return { success: true, data: { url: data.url } };
}

// ─── Recuperar contraseña ─────────────────────────────────────────────────────
export async function resetPassword(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const email = (formData.get("email") as string)?.toLowerCase().trim();

  if (!email) {
    return { success: false, error: "Ingresa tu correo electrónico." };
  }

  // Siempre devuelve éxito (nunca revelar si el correo está registrado)
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/nueva-password`,
  });

  return {
    success: true,
    data: undefined,
    message: "Si hay una cuenta con ese correo, recibirás las instrucciones en tu bandeja.",
  };
}

// ─── Actualizar contraseña (después de reset) ────────────────────────────────
export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const password = formData.get("password") as string;
  const confirm  = formData.get("confirmPassword") as string;

  if (!password || password !== confirm) {
    return { success: false, error: "Las contraseñas no coinciden." };
  }
  if (password.length < 8) {
    return { success: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, error: "No fue posible actualizar la contraseña." };
  }

  redirect("/dashboard");
}

// ─── Cerrar sesión ────────────────────────────────────────────────────────────
export async function signOut(): Promise<never> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user) {
    await logAudit({
      actorProfileId: user.id,
      action: "auth.logout",
      entityType: "auth",
      entityId: user.id,
    });
  }

  redirect("/login");
}
