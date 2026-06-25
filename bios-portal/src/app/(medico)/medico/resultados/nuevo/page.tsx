"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, User, Search, Plus, FileText, Calendar, FlaskConical,
  Building2, MessageSquare, Link2, Copy, Check, ChevronDown, ChevronUp,
  AlertCircle, X, FilePlus,
} from "lucide-react";
import { uploadResult, findOrCreatePatient } from "@/lib/results/actions";
import { STUDY_TYPES } from "@/types";

type PatientMode = "search" | "new";
type Step = "patient" | "result" | "done";

interface FoundPatient {
  id: string;
  full_name: string;
  email: string;
}

export default function NuevoResultadoPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep]               = useState<Step>("patient");
  const [patientMode, setPatientMode] = useState<PatientMode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [foundPatient, setFoundPatient] = useState<FoundPatient | null>(null);
  const [patientId, setPatientId]     = useState<string | null>(null);

  const [file, setFile]               = useState<File | null>(null);
  const [dragOver, setDragOver]       = useState(false);
  const fileRef                        = useRef<HTMLInputElement>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [resultId, setResultId]       = useState<string | null>(null);
  const [copied, setCopied]           = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  // ── Paso 1: buscar/crear paciente ─────────────────────────────────────────
  async function handlePatientSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await findOrCreatePatient(formData);
      if (result.success) {
        setPatientId(result.data.id);
        setFoundPatient({ id: result.data.id, full_name: formData.get("fullName") as string, email: formData.get("email") as string });
        setStep("result");
      } else {
        setError(result.error);
      }
    });
  }

  // ── Paso 2: subir resultado ───────────────────────────────────────────────
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!patientId) { setError("Selecciona un paciente primero."); return; }

    const formData = new FormData(e.currentTarget);
    formData.set("patientId", patientId);
    if (file) formData.set("file", file);

    startTransition(async () => {
      const result = await uploadResult(formData);
      if (result.success) {
        setResultId(result.data.resultId);
        setAccessToken(result.data.accessToken ?? null);
        setStep("done");
      } else {
        setError(result.error);
      }
    });
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  async function handleCopyLink() {
    if (!accessToken) return;
    await navigator.clipboard.writeText(`${siteUrl}/consulta/${accessToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="animate-page-enter max-w-2xl">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-black text-bios-navy mb-1">Subir resultado médico</h1>
        <p className="text-sm text-gray-500">Carga el PDF, asocia al paciente y genera el link de consulta.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {(["patient", "result", "done"] as Step[]).map((s, i) => {
          const labels = ["1. Paciente", "2. Resultado", "3. Listo"];
          const isDone = step === "done" || (step === "result" && s === "patient");
          const isActive = step === s;
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={`h-px flex-1 w-8 ${isDone ? "bg-bios-blue" : "bg-bios-line"}`} />}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                isActive ? "bg-bios-navy text-white" :
                isDone   ? "bg-bios-blue text-white" :
                "bg-gray-100 text-gray-400"
              }`}>
                {labels[i]}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* ── PASO 1: Paciente ─────────────────────────────────────────────── */}
      {step === "patient" && (
        <div className="bios-panel p-6 space-y-5">
          {/* Toggle búsqueda / nuevo */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPatientMode("search")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${
                patientMode === "search" ? "bg-bios-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Search className="w-4 h-4" /> Paciente existente
            </button>
            <button
              type="button"
              onClick={() => setPatientMode("new")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${
                patientMode === "new" ? "bg-bios-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Plus className="w-4 h-4" /> Paciente nuevo
            </button>
          </div>

          <form onSubmit={handlePatientSearch} className="space-y-4">
            <div>
              <label className="bios-field-label">Nombre completo *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder={patientMode === "search" ? "Busca por nombre…" : "Nombre del paciente"}
                  className="bios-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="bios-field-label">Correo electrónico *</label>
              <input name="email" type="email" required placeholder="correo@ejemplo.com" className="bios-field" />
              <p className="text-xs text-gray-400 mt-1.5">
                Si el paciente ya existe con este correo, se vinculará automáticamente.
              </p>
            </div>
            {patientMode === "new" && (
              <div>
                <label className="bios-field-label">Teléfono (opcional)</label>
                <input name="phone" type="tel" placeholder="Ej. 55 1234 5678" className="bios-field" />
              </div>
            )}
            <button type="submit" disabled={isPending} className="bios-btn-blue w-full py-3">
              {isPending ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Buscando…
                </span>
              ) : (
                <>Continuar <span className="ml-1">→</span></>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── PASO 2: Resultado ────────────────────────────────────────────── */}
      {step === "result" && (
        <div className="space-y-5">
          {/* Paciente seleccionado */}
          {foundPatient && (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-9 h-9 bg-green-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-green-900">{foundPatient.full_name}</p>
                <p className="text-xs text-green-700">{foundPatient.email}</p>
              </div>
              <button onClick={() => { setStep("patient"); setFoundPatient(null); setPatientId(null); }}
                      className="p-1 text-green-600 hover:text-green-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleUpload} className="bios-panel p-6 space-y-5">
            {/* Archivo */}
            <div>
              <label className="bios-field-label">Archivo PDF del resultado</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition ${
                  dragOver ? "border-bios-blue bg-blue-50" :
                  file ? "border-green-400 bg-green-50" :
                  "border-bios-line hover:border-bios-blue hover:bg-blue-50/40"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <>
                    <FileText className="w-8 h-8 text-green-500" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-green-800">{file.name}</p>
                      <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="text-xs text-red-500 font-semibold hover:text-red-700 transition-colors">Quitar archivo</button>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-bios-navy">Arrastra el PDF aquí</p>
                      <p className="text-xs text-gray-400">o haz clic para seleccionar · Máx. 10 MB · PDF, JPG, PNG</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Datos del resultado */}
            <div>
              <label className="bios-field-label">Título del resultado *</label>
              <input name="title" type="text" required placeholder="Ej. Biometría Hemática Completa" className="bios-field" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="bios-field-label">Tipo de estudio *</label>
                <select name="studyType" required className="bios-field">
                  <option value="">Seleccionar…</option>
                  {STUDY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="bios-field-label">Fecha del estudio *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    name="resultDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="bios-field pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Notas para el paciente */}
            <div>
              <label className="bios-field-label">Nota visible para el paciente</label>
              <textarea
                name="notesForPatient"
                rows={3}
                placeholder="Instrucciones o comentarios que verá el paciente al abrir su resultado…"
                className="bios-field resize-none"
              />
            </div>

            {/* Datos adicionales */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced((p) => !p)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-bios-navy"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Datos adicionales (sucursal, notas internas)
              </button>
              {showAdvanced && (
                <div className="mt-4 space-y-4 pt-4 border-t border-bios-line">
                  <div>
                    <label className="bios-field-label">Sucursal / Laboratorio</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="labBranch" type="text" placeholder="Ej. Sucursal Tultepec" className="bios-field pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="bios-field-label">Notas internas (no visibles para el paciente)</label>
                    <textarea
                      name="internalNotes"
                      rows={2}
                      placeholder="Observaciones solo para el equipo médico…"
                      className="bios-field resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Opciones de publicación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-bios-line cursor-pointer hover:border-bios-blue transition">
                <input type="checkbox" name="publishNow" value="true" className="mt-0.5 accent-bios-blue" defaultChecked />
                <div>
                  <p className="text-sm font-bold text-bios-navy">Publicar ahora</p>
                  <p className="text-xs text-gray-400">El paciente podrá verlo de inmediato</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 rounded-xl border border-bios-line cursor-pointer hover:border-bios-blue transition">
                <input type="checkbox" name="generateLink" value="true" className="mt-0.5 accent-bios-blue" defaultChecked />
                <div>
                  <p className="text-sm font-bold text-bios-navy">Generar link de consulta</p>
                  <p className="text-xs text-gray-400">Para pacientes sin cuenta</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep("patient")} className="bios-btn-secondary flex-1">
                ← Atrás
              </button>
              <button type="submit" disabled={isPending} className="bios-btn-blue flex-[2]">
                {isPending ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Subiendo…
                  </span>
                ) : (
                  <><FilePlus className="w-5 h-5" /> Guardar resultado</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── PASO 3: Éxito ────────────────────────────────────────────────── */}
      {step === "done" && (
        <div className="bios-panel p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="font-outfit text-2xl font-black text-bios-navy mb-2">¡Resultado guardado!</h2>
            <p className="text-gray-500 text-sm">
              El resultado fue subido correctamente y ya está disponible para el paciente.
            </p>
          </div>

          {/* Link de acceso */}
          {accessToken && (
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4 text-bios-blue" />
                <span className="text-sm font-black text-bios-navy uppercase tracking-wider">Link de consulta pública</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-bios-line">
                <code className="flex-1 text-xs text-gray-600 truncate">
                  {siteUrl}/consulta/{accessToken}
                </code>
                <button onClick={handleCopyLink}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          copied ? "bg-green-100 text-green-700" : "bg-bios-navy text-white hover:bg-[#102f4a]"
                        }`}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Comparte este link con el paciente. Expira en 30 días. Sin necesidad de cuenta.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => { setStep("patient"); setFoundPatient(null); setPatientId(null); setFile(null); setAccessToken(null); }}
              className="bios-btn-secondary text-sm"
            >
              Subir otro resultado
            </button>
            <button onClick={() => router.push("/medico/resultados")} className="bios-btn-primary text-sm">
              Ver todos los resultados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
