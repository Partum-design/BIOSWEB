import { demoPatients, demoResults, isDemoMode } from "@/lib/demo";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resultados" };

export default function AdminResultadosPage() {
  const results = isDemoMode ? demoResults : [];

  return (
    <div className="animate-page-enter space-y-6">
      <div>
        <h1 className="font-outfit text-2xl font-black text-bios-navy">Resultados</h1>
        <p className="text-sm text-gray-500">{results.length} resultados en el sistema</p>
      </div>

      <div className="space-y-3">
        {results.map((result) => {
          const patient = demoPatients.find((item) => item.id === result.patient_id);

          return (
            <div key={result.id} className="bios-panel p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-bios-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-bios-navy">{result.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {patient?.full_name ?? "Paciente"} · {result.study_type} · {formatDate(result.result_date)}
                </p>
              </div>
              <StatusBadge status={result.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
