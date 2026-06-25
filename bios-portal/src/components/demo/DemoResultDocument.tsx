import { FlaskConical } from "lucide-react";

interface DemoResultDocumentProps {
  title: string;
}

const rows = [
  { name: "Hemoglobina", value: "14.2", unit: "g/dL", range: "12.0 - 16.0" },
  { name: "Leucocitos", value: "7.1", unit: "10^3/uL", range: "4.5 - 11.0" },
  { name: "Plaquetas", value: "255", unit: "10^3/uL", range: "150 - 450" },
  { name: "Glucosa", value: "91", unit: "mg/dL", range: "70 - 99" },
  { name: "Colesterol total", value: "178", unit: "mg/dL", range: "< 200" },
];

export function DemoResultDocument({ title }: DemoResultDocumentProps) {
  return (
    <div className="bios-panel overflow-hidden">
      <div className="border-b border-bios-line px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-outfit font-black text-bios-navy text-sm">Documento de resultado</h2>
          <p className="text-xs text-gray-400 mt-0.5">Vista demostrativa del informe médico</p>
        </div>
        <span className="bios-chip bg-green-50 text-green-700 border-green-200 text-xs">
          Demo
        </span>
      </div>

      <div className="bg-white p-6 sm:p-8">
        <div className="max-w-3xl mx-auto border border-bios-line rounded-xl overflow-hidden">
          <div className="bg-bios-navy text-white p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-200 font-black">Laboratorios BIOS</p>
              <h3 className="font-outfit text-2xl font-black mt-2">{title}</h3>
              <p className="text-blue-100/70 text-sm mt-1">Reporte clínico de muestra</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-cyan-300" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-bios-line">
            {[
              ["Paciente", "María Fernández"],
              ["Fecha", "21 junio 2026"],
              ["Sucursal", "Centro"],
              ["Estatus", "Validado"],
            ].map(([label, value]) => (
              <div key={label} className="p-4 border-r border-bios-line last:border-r-0">
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">{label}</p>
                <p className="text-sm font-bold text-bios-navy mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-gray-400 border-b border-bios-line">
                  <th className="py-3 font-black">Prueba</th>
                  <th className="py-3 font-black">Resultado</th>
                  <th className="py-3 font-black hidden sm:table-cell">Unidad</th>
                  <th className="py-3 font-black hidden sm:table-cell">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-3 font-semibold text-bios-navy">{row.name}</td>
                    <td className="py-3 font-black text-green-700">{row.value}</td>
                    <td className="py-3 text-gray-500 hidden sm:table-cell">{row.unit}</td>
                    <td className="py-3 text-gray-500 hidden sm:table-cell">{row.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-bios-blue mb-1">Interpretación</p>
              <p className="text-sm text-bios-ink">
                Parámetros dentro de rangos esperados para la muestra. Se recomienda correlacionar con el cuadro clínico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
