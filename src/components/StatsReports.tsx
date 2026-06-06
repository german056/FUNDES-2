import { Course } from '../types';
import { 
  FileText, Printer, CheckCircle, AlertTriangle, XCircle, 
  Download, Award, Layers, Calendar, ArrowRight, Layers3 
} from 'lucide-react';

interface StatsReportsProps {
  courses: Course[];
}

export default function StatsReports({ courses }: StatsReportsProps) {
  const dateStr = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const total = courses.length;
  const greens = courses.filter(c => c.status === 'green');
  const yellows = courses.filter(c => c.status === 'yellow');
  const reds = courses.filter(c => c.status === 'red');

  const greenPct = total > 0 ? Math.round((greens.length / total) * 100) : 0;
  const yellowPct = total > 0 ? Math.round((yellows.length / total) * 100) : 0;
  const redPct = total > 0 ? Math.round((reds.length / total) * 100) : 0;

  const avgProgress = total > 0 
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / total) 
    : 0;

  // Group by category for a structured report
  const categoriesList = Array.from(new Set(courses.map(c => c.category)));

  const handlePrint = () => {
    window.print();
  };

  // Build a custom CSV download helper for audit
  const handleDownloadCSV = () => {
    const headers = ['ID', 'Nombre de Curso', 'URL', 'Avance %', 'Color Habilitación', 'Categoría', 'Responsable', 'Observaciones'];
    const rows = courses.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.url,
      c.progress,
      c.status === 'green' ? 'VERDE (Habilitado)' : c.status === 'yellow' ? 'AMARILLO (Mejoras pendientes)' : 'ROJO (Falla crítica)',
      `"${c.category.replace(/"/g, '""')}"`,
      `"${c.responsible.replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Habilitacion_Cursos_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Action panel at the top (Non-printable area optionally styled) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <FileText size={18} className="text-indigo-500" />
            Generador de Reportes de Cumplimiento
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Exporte auditorías académicas completas listas para impresión o análisis de datos.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* CSV Download */}
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Download size={14} /> Descargar CSV (Excel)
          </button>

          {/* Printable Action */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs shadow-md shadow-indigo-600/15 flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} /> Imprimir Reporte PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet Card */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8" id="printable-area">
        
        {/* Printable Header */}
        <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 px-2.5 py-1 bg-indigo-50 rounded-md border border-indigo-100/30">
              AUDITORÍA ACADÉMICA VIRTUAL
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800 mt-2">Reporte de Estado y Habilitación de Cursos</h1>
            <p className="text-xs text-slate-400 mt-1">Especializaciones Virtuales — Fundes</p>
          </div>
          <div className="text-right text-slate-500 text-xs mt-1 md:mt-0">
            <div>Fecha de emisión: <strong className="text-slate-700">{dateStr}</strong></div>
            <div>Origen de datos: <strong className="text-slate-700">Google Sheets plantilla / CRUD</strong></div>
          </div>
        </div>

        {/* Executive summary statement */}
        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Programados</span>
            <div className="text-3xl font-extrabold text-slate-800">{total} <span className="text-xs font-normal text-slate-500">Cursos</span></div>
            <p className="text-xs text-slate-400">Totalidad evaluada en plataforma.</p>
          </div>
          <div className="space-y-1 border-y md:border-y-0 md:border-x border-slate-100 py-3 md:py-0 md:px-6">
            <span className="text-[10px] uppercase font-bold text-slate-400">Porcentaje de Avance General</span>
            <div className="text-3xl font-extrabold text-indigo-600">{avgProgress}%</div>
            <p className="text-xs text-slate-400">Habilitación global en desarrollo virtual.</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tasa de Cumplimiento (Verde)</span>
            <div className="text-3xl font-extrabold text-emerald-600">{greenPct}%</div>
            <p className="text-xs text-slate-400">Cursos aprobados listos para dictarse.</p>
          </div>
        </div>

        {/* Level of Habilitation Status breakdown bar */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Distribución de Estados en el Portafolio</h4>
          <div className="w-full flex h-6 rounded-xl overflow-hidden shadow-inner bg-slate-100 border text-white font-bold text-[10px] leading-[22px] text-center">
            {greens.length > 0 && (
              <div 
                className="bg-emerald-500 transition-all" 
                style={{ width: `${greenPct}%` }}
                title={`${greens.length} Cursos Verdes`}
              >
                {greenPct}% Completo
              </div>
            )}
            {yellows.length > 0 && (
              <div 
                className="bg-amber-400 text-amber-900 transition-all" 
                style={{ width: `${yellowPct}%` }}
                title={`${yellows.length} Cursos Amarillos`}
              >
                {yellowPct}% Ajustes
              </div>
            )}
            {reds.length > 0 && (
              <div 
                className="bg-rose-500 transition-all" 
                style={{ width: `${redPct}%` }}
                title={`${reds.length} Cursos Rojos`}
              >
                {redPct}% Crítico
              </div>
            )}
          </div>
        </div>

        {/* Detailed Status audit matrices per category */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">AUDITORÍA DETALLADA POR ÁREA DE CONFORMIDAD</h3>

          {categoriesList.map((category) => {
            const categoryCourses = courses.filter(c => c.category === category);
            const catProgress = Math.round(categoryCourses.reduce((sum, c) => sum + c.progress, 0) / categoryCourses.length);
            const catGreen = categoryCourses.filter(c => c.status === 'green').length;

            return (
              <div key={category} className="space-y-3 bg-white border border-slate-100 rounded-xl p-4.5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-50 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Layers3 size={15} className="text-indigo-500" />
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">{category}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span>Avance: <strong className="text-indigo-600 font-semibold">{catProgress}%</strong></span>
                    <span>Habilitados: <strong className="text-emerald-600 font-semibold">{catGreen} de {categoryCourses.length}</strong></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-50 font-bold">
                        <th className="py-2">Curso / Espacio Académico</th>
                        <th className="py-2 text-center">Avance</th>
                        <th className="py-2 text-center">Nivel</th>
                        <th className="py-2">Responsable Académico</th>
                        <th className="py-2">Observaciones de Auditoría</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-[11px] text-slate-600">
                      {categoryCourses.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/20">
                          <td className="py-2.5 font-semibold text-slate-800 max-w-[170px] truncate">{c.name}</td>
                          <td className="py-2.5 text-center font-bold text-slate-700">{c.progress}%</td>
                          <td className="py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                              c.status === 'green' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              c.status === 'yellow' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {c.status === 'green' ? 'Verde' : c.status === 'yellow' ? 'Amarillo' : 'Rojo'}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-500">{c.responsible}</td>
                          <td className="py-2.5 text-slate-400 italic max-w-[200px] truncate" title={c.notes}>{c.notes || 'Habilitado sin observaciones'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Sign-off space (Excellent detail for institutional print audits) */}
        <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-100 mt-6 text-center text-xs text-slate-500">
          <div className="space-y-6 max-w-xs mx-auto md:mx-0">
            <div className="border-b border-slate-300 h-10" />
            <div>
              <span className="block font-bold text-slate-700">Coordinador(a) Académico(a) Virtual</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Firma de Conformidad</span>
            </div>
          </div>
          <div className="space-y-6 max-w-xs mx-auto md:mr-0">
            <div className="border-b border-slate-300 h-10" />
            <div>
              <span className="block font-bold text-slate-700">Auditor(a) de Calidad de Contenidos</span>
              <span className="block text-[11px] text-slate-400 mt-0.5 font-normal">Habilitación Virtual</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
