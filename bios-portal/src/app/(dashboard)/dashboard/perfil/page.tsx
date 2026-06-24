"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { data: patient } = await supabase
        .from("patients")
        .select("phone")
        .eq("profile_id", user.id)
        .single();

      if (profile?.full_name) setFullName(profile.full_name);
      if (patient?.phone) setPhone(patient.phone ?? "");
    }
    load();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    startTransition(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", userId);

      // También actualizar el teléfono en patients si existe el registro
      if (!error && phone.trim()) {
        await supabase
          .from("patients")
          .update({ phone: phone.trim() })
          .eq("profile_id", userId);
      }

      setProfileMsg(
        error
          ? { ok: false, text: "No fue posible guardar los cambios." }
          : { ok: true, text: "Perfil actualizado correctamente." }
      );
    });
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ ok: false, text: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: "Las contraseñas no coinciden." });
      return;
    }

    startPasswordTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMsg({ ok: false, text: "No fue posible actualizar la contraseña." });
      } else {
        setPasswordMsg({ ok: true, text: "Contraseña actualizada correctamente." });
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  }

  return (
    <div className="animate-page-enter max-w-2xl space-y-8">
      <div>
        <h1 className="font-outfit text-2xl font-black text-bios-navy">Mi perfil</h1>
        <p className="text-sm text-gray-500">Actualiza tu información personal</p>
      </div>

      {/* Información personal */}
      <form onSubmit={saveProfile} className="bios-panel p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-bios-blue" />
          </div>
          <div>
            <h2 className="font-outfit font-black text-bios-navy text-sm">Información personal</h2>
            <p className="text-xs text-gray-400">Tu nombre y datos de contacto</p>
          </div>
        </div>

        <div>
          <label className="bios-field-label">Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre completo"
            className="bios-field"
            required
          />
        </div>

        <div>
          <label className="bios-field-label">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="email"
              value={email}
              disabled
              className="bios-field pl-10 bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">El correo no se puede cambiar desde aquí.</p>
        </div>

        <div>
          <label className="bios-field-label">Teléfono (opcional)</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 55 1234 5678"
              className="bios-field pl-10"
            />
          </div>
        </div>

        {profileMsg && (
          <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${profileMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {profileMsg.ok
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" />
            }
            {profileMsg.text}
          </div>
        )}

        <button type="submit" disabled={isPending} className="bios-btn-blue w-full justify-center">
          {isPending ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={savePassword} className="bios-panel p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="font-outfit font-black text-bios-navy text-sm">Cambiar contraseña</h2>
            <p className="text-xs text-gray-400">Mínimo 8 caracteres</p>
          </div>
        </div>

        <div>
          <label className="bios-field-label">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="bios-field pr-10"
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="bios-field-label">Confirmar contraseña</label>
          <input
            type={showPw ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            className="bios-field"
            minLength={8}
          />
        </div>

        {passwordMsg && (
          <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${passwordMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {passwordMsg.ok
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" />
            }
            {passwordMsg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPasswordPending || !newPassword}
          className="bios-btn-secondary w-full justify-center disabled:opacity-50"
        >
          {isPasswordPending ? "Actualizando…" : "Actualizar contraseña"}
        </button>
      </form>
    </div>
  );
}
