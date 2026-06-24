"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { resetPassword } from "@/lib/auth/actions";

export default function RecuperarPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result.success) {
        setSent(true);
        setMessage({ type: "success", text: result.message! });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <div>
      <div className="mb-8">
        <span className="bios-kicker mb-4">
          <KeyRound className="w-3.5 h-3.5" /> Recuperar acceso
        </span>
        <h2 className="font-outfit text-3xl font-black text-bios-navy mt-4 mb-2">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="text-gray-500 text-sm">
          Ingresa tu correo y te enviamos un enlace para restablecerla.
        </p>
      </div>

      {message && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2 ${
          message.type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          <span className="mt-0.5">{message.type === "success" ? "✓" : "⚠"}</span>
          {message.text}
        </div>
      )}

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="bios-field-label">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                className="bios-field pl-10"
                disabled={isPending}
              />
            </div>
          </div>

          <button type="submit" disabled={isPending} className="bios-btn-blue w-full py-3.5 text-base">
            {isPending ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Enviando…
              </span>
            ) : (
              "Enviar instrucciones"
            )}
          </button>
        </form>
      ) : (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-outfit text-xl font-black text-bios-navy mb-2">Correo enviado</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Si hay una cuenta con ese correo, recibirás las instrucciones en minutos.
            Revisa también tu carpeta de spam.
          </p>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 font-medium hover:text-bios-navy transition">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
