"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, LogIn, Chrome } from "lucide-react";
import { signIn, signInWithGoogle } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signIn(formData);
      if (result && !result.success) {
        setError(result.error);
      }
    });
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    if (result.success) {
      router.push(result.data.url);
    } else {
      setError(result.error);
      setGoogleLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <span className="bios-kicker mb-4">
          <LogIn className="w-3.5 h-3.5" /> Pacientes y Médicos
        </span>
        <h2 className="font-outfit text-3xl font-black text-bios-navy mt-4 mb-2">
          Ingresa a tu cuenta
        </h2>
        <p className="text-gray-500 text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-bios-blue font-bold hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2">
          <span className="mt-0.5">⚠</span> {error}
        </div>
      )}

      {/* Google OAuth (se muestra solo cuando está configurado) */}
      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || isPending}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 mb-5
                       rounded-xl border border-bios-line bg-white font-bold text-bios-navy text-sm
                       transition hover:border-bios-blue hover:shadow-md disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-bios-blue rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <span className="flex-1 h-px bg-bios-line" />
            <span className="text-xs text-gray-400 font-medium">o con correo</span>
            <span className="flex-1 h-px bg-bios-line" />
          </div>
        </>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot — invisible para humanos, trampa para bots */}
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="bios-field-label">Contraseña</label>
            <Link href="/recuperar-password" className="text-xs text-bios-blue font-bold hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="bios-field pl-10 pr-10"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bios-btn-blue w-full mt-2 py-3.5 text-base"
        >
          {isPending ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Ingresando…
            </span>
          ) : (
            <>
              <LogIn className="w-5 h-5" /> Ingresar
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        Al ingresar aceptas nuestros{" "}
        <a href="https://laboratoriosbios.com/aviso-privacidad" className="underline">
          términos y aviso de privacidad
        </a>
        .
      </p>
    </div>
  );
}
