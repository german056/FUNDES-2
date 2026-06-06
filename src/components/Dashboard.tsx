import { Course } from '../types';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Activity, BookOpen, AlertTriangle, CheckCircle, Award, 
  HelpCircle, Sparkles, TrendingUp, HelpCircle as HelpIcon, PieChart as PieIcon, BarChart2
} from 'lucide-react';

interface DashboardProps {
  courses: Course[];
}

export default function Dashboard({ courses }: DashboardProps) {
  const total = courses.length;
  
  // Counts by level of functionality status
  const greenCount = courses.filter(c => c.status === 'green').length;
  const yellowCount = courses.filter(c => c.status === 'yellow').length;
  const redCount = courses.filter(c => c.status === 'red').length;

  // Average progress overall
  const avgProgress = total > 0 
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / total) 
    : 0;

  // Compliance percentage (Green courses / Total)
  const complianceRate = total > 0 
    ? Math.round((greenCount / total) * 100) 
    : 0;

  // Category stats mapping
  const categoryMap: Record<string, { total: number; green: number; yellow: number; red: number; sumProgress: number }> = {};
  
  courses.forEach(c => {
    if (!categoryMap[c.category]) {
      categoryMap[c.category] = { total: 0, green: 0, yellow: 0, red: 0, sumProgress: 0 };
    }
    categoryMap[c.category].total += 1;
    categoryMap[c.category].sumProgress += c.progress;
    if (c.status === 'green') categoryMap[c.category].green += 1;
    else if (c.status === 'yellow') categoryMap[c.category].yellow += 1;
    else if (c.status === 'red') categoryMap[c.category].red += 1;
  });

  const categoryData = Object.entries(categoryMap).map(([key, val]) => ({
    name: key,
    total: val.total,
    green: val.green,
    yellow: val.yellow,
    red: val.red,
    'Avance Promedio': Math.round(val.sumProgress / val.total)
  }));

  // Chart data for Pie Chart (Functionality Levels)
  const pieData = [
    { name: 'Funcional Completo (Verde)', value: greenCount, color: '#10b981' },
    { name: 'Con Ajustes Menores (Amarillo)', value: yellowCount, color: '#f59e0b' },
    { name: 'Falla Crítica (Rojo)', value: redCount, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Courses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
            <BookOpen size={22} />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Cursos Totales</span>
            <span className="block text-2xl font-bold text-slate-800 mt-1">{total}</span>
            <span className="block text-[11px] text-slate-400 mt-0.5 mt-0.5">En plataforma educativa</span>
          </div>
        </div>

        {/* Metric 2: Average Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Avance Promedio</span>
            <span className="block text-2xl font-bold text-slate-800 mt-1">{avgProgress}%</span>
            <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: `${avgProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Metric 3: Compliance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <Award size={22} />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasa de Cumplimiento</span>
            <span className="block text-2xl font-bold text-slate-800 mt-1">{complianceRate}%</span>
            <span className="block text-[11px] text-emerald-600 font-semibold mt-0.5">{greenCount} cursos aprobados</span>
          </div>
        </div>

        {/* Metric 4: Critical Level (Red) */}
        <div className={`p-5 rounded-2xl border shadow-xs flex items-center gap-4 transition-all duration-350 ${redCount > 0 ? 'bg-rose-50/40 border-rose-100' : 'bg-white border-slate-100'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${redCount > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Fallas Críticas</span>
            <span className={`block text-2xl font-bold mt-1 ${redCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>{redCount}</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Requieren intervención</span>
          </div>
        </div>

      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left: Recharts Level of Functionality Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <PieIcon size={16} className="text-indigo-500" />
              Niveles de Funcionalidad
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Desglose porcentual de cursos según su disponibilidad y calidad en plataforma.
            </p>
          </div>

          <div className="h-60 mt-4 relative flex items-center justify-center">
            {pieData.length === 0 ? (
              <span className="text-slate-400 text-xs">Sin datos disponibles</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} Cursos`, 'Cantidad']}
                    contentStyle={{ borderRadius: '12px', borderColor: '#f1f5f9', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Center percentage label */}
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-2xl font-extrabold text-slate-800">{complianceRate}%</span>
              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Aprobado</span>
            </div>
          </div>

          {/* Detailed breakdown legend indices */}
          <div className="mt-2 space-y-2 border-t border-slate-50 pt-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                <span className="block text-xs font-semibold text-emerald-800">{greenCount}</span>
                <span className="block text-[10px] text-emerald-600">Verdes</span>
              </div>
              <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                <span className="block text-xs font-semibold text-amber-800">{yellowCount}</span>
                <span className="block text-[10px] text-amber-600">Amarillos</span>
              </div>
              <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                <span className="block text-xs font-semibold text-rose-800">{redCount}</span>
                <span className="block text-[10px] text-rose-600">Rojos</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Average Progress by Category Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <BarChart2 size={16} className="text-indigo-500" />
              Porcentaje de Avance por Categoría / Programa
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Monitoreo del promedio del desarrollo académico por área temática.
            </p>
          </div>

          <div className="h-64 mt-6">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Cargue o cree un curso para visualizar estadísticas de categoría.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    ticks={[0, 20, 40, 60, 80, 100]} 
                    tickFormatter={(tick) => `${tick}%`}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Avance Promedio']}
                    contentStyle={{ borderRadius: '12px', borderColor: '#f1f5f9', fontSize: '12px' }}
                  />
                  <Bar dataKey="Avance Promedio" radius={[8, 8, 0, 0]}>
                    {categoryData.map((entry, index) => {
                      // Alternate bar gradient colors based on accomplishment
                      const val = entry['Avance Promedio'];
                      const color = val === 100 ? '#10b981' : val >= 60 ? '#6366f1' : '#f43f5e';
                      return <Cell key={`bar-cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="text-[11px] text-slate-400 mt-2 text-center border-t border-slate-50 pt-3">
            💡 Código visual: <span className="font-semibold text-emerald-550 text-emerald-600">Verde (100%)</span>, <span className="font-semibold text-indigo-500 text-indigo-600">Púrpura (60-99%)</span> y <span className="font-semibold text-rose-500 text-rose-600">Rojo (menos del 60%)</span>.
          </div>

        </div>

      </div>

      {/* Categorized Progress Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-1">Distribución y Seguimiento por Programas Académicos</h3>
        <p className="text-xs text-slate-400 mb-6">Detalle consolidado del estado de habilitación de cursos por cada área de estudio.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryData.map((cat) => {
            const progress = cat['Avance Promedio'];
            let colorClass = 'border-emerald-100 bg-emerald-50/10 text-emerald-800';
            let barColor = 'bg-emerald-500';
            
            if (progress < 60) {
              colorClass = 'border-rose-100 bg-rose-50/10 text-rose-800';
              barColor = 'bg-rose-500';
            } else if (progress < 95) {
              colorClass = 'border-amber-100 bg-amber-50/10 text-amber-800';
              barColor = 'bg-amber-400';
            }

            return (
              <div 
                key={cat.name} 
                className={`p-4 rounded-xl border flex flex-col justify-between hover:shadow-xs transition-shadow ${colorClass}`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm text-slate-800 truncate" title={cat.name}>{cat.name}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {cat.total} curso{cat.total !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Status distribution bubbles */}
                  <div className="flex gap-1.5 mt-2.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 font-semibold flex items-center gap-0.5">
                      ✓ {cat.green}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-800 font-semibold flex items-center gap-0.5">
                      ! {cat.yellow}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-800 font-semibold flex items-center gap-0.5">
                      ✗ {cat.red}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Avance General</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
