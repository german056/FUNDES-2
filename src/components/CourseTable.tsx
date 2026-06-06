import { useState } from 'react';
import { Course } from '../types';
import { 
  Search, Plus, ExternalLink, Edit3, Trash2, 
  Layers, User, LayoutGrid, List, MessageCircle, ArrowUpRight,
  TrendingUp, Compass, AlertCircle
} from 'lucide-react';

interface CourseTableProps {
  courses: Course[];
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  categories: string[];
}

export default function CourseTable({ courses, onAddCourse, onEditCourse, onDeleteCourse, categories }: CourseTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'mosaic' | 'list'>('mosaic');

  // Filter courses based on search term and category/status
  const filteredCourses = courses.filter((course) => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !lowerSearch ||
      course.name.toLowerCase().includes(lowerSearch) ||
      course.category.toLowerCase().includes(lowerSearch) ||
      course.responsible.toLowerCase().includes(lowerSearch) ||
      (course.notes && course.notes.toLowerCase().includes(lowerSearch));

    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Group filtered courses by category (program)
  const groupedCourses: Record<string, Course[]> = {};
  filteredCourses.forEach((course) => {
    if (!groupedCourses[course.category]) {
      groupedCourses[course.category] = [];
    }
    groupedCourses[course.category].push(course);
  });

  // Unique programs/categories in the current filtered set
  const programNames = Object.keys(groupedCourses).sort();

  // Color indicators mapper
  const getStatusDetails = (status: Course['status']) => {
    switch (status) {
      case 'green':
        return {
          label: 'Ajustado (Completo)',
          colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
          dotClass: 'bg-emerald-500',
          ringClass: 'ring-emerald-500/10 hover:bg-emerald-50',
          cardBorder: 'hover:border-emerald-300'
        };
      case 'yellow':
        return {
          label: 'Con mejoras (Pendiente)',
          colorClass: 'bg-amber-50 text-amber-700 border-amber-200/50',
          dotClass: 'bg-amber-400',
          ringClass: 'ring-amber-500/10 hover:bg-amber-50',
          cardBorder: 'hover:border-amber-300'
        };
      case 'red':
        return {
          label: 'Con fallas (Crítico)',
          colorClass: 'bg-rose-50 text-rose-700 border-rose-200/50',
          dotClass: 'bg-rose-500',
          ringClass: 'ring-rose-500/10 hover:bg-rose-50',
          cardBorder: 'hover:border-rose-300'
        };
      default:
        return {
          label: 'No definido',
          colorClass: 'bg-slate-50 text-slate-700 border-slate-200',
          dotClass: 'bg-slate-400',
          ringClass: 'ring-slate-500/10 hover:bg-slate-50',
          cardBorder: 'hover:border-slate-300'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Control Actions & Searching Hub */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Módulo de Gestión
            </span>
            <h2 className="text-xl font-bold text-slate-800 mt-1.5">Monitoreo y Control de Cursos</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Administre la oferta educativa agrupada por programa de formación, califique su estado de avance y funcionalidad.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle Switch */}
            <div className="bg-slate-100 p-1 rounded-xl inline-flex border border-slate-200/70 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('mosaic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'mosaic' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <LayoutGrid size={14} />
                Mosaico (Imágenes)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <List size={14} />
                Lista (Tabla)
              </button>
            </div>

            <button
              onClick={onAddCourse}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> Registrar Curso
            </button>
          </div>
        </div>

        {/* Searching and Filter inputs */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Advanced Search */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Buscar por curso, docente, observaciones, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 outline-none text-sm focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 bg-slate-50/20 hover:bg-slate-50/50 focus:bg-white transition-all text-slate-700"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-slate-400 hover:text-indigo-600 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Category drop */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none bg-white transition-all"
            >
              <option value="all">Filtro: Todos los Programas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status color drop */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none bg-white transition-all"
            >
              <option value="all">Filtro: Cualquier Estado</option>
              <option value="green">🟢 Verde (Funcional completo)</option>
              <option value="yellow">🟡 Amarillo (Con mejoras pendientes)</option>
              <option value="red">🔴 Rojo (Fallas críticas)</option>
            </select>
          </div>

        </div>

        {/* Dynamic information badge selection indicators */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-500 bg-slate-50/50 px-4 py-2 rounded-xl border border-slate-100">
          <span>
            Mostrando <strong className="text-indigo-600">{filteredCourses.length}</strong> cursos de <strong className="text-slate-800">{courses.length}</strong> registrados en total.
          </span>
          {selectedCategory !== 'all' && (
            <span className="text-slate-400">| Programa activo: <strong className="text-indigo-600 font-bold">{selectedCategory}</strong></span>
          )}
          {selectedStatus !== 'all' && (
            <span className="text-slate-400">| Estado activo: <strong className="text-indigo-600 font-bold">{selectedStatus === 'green' ? 'Verde' : selectedStatus === 'yellow' ? 'Amarillo' : 'Rojo'}</strong></span>
          )}
        </div>
      </div>

      {/* Group courses by program */}
      {programNames.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-12 text-center">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Compass size={28} className="animate-spin-slow" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No se encontraron cursos académicos</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Ningún registro coincide con sus criterios de búsqueda o con el filtro seleccionado para la oferta académica. Reduzca la especificidad de los términos de búsqueda.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="mt-5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Restablecer Configuración de Filtros
            </button>
          </div>
        </div>
      ) : (
        // Render Grouped Blocks
        programNames.map((program) => {
          const coursesInProgram = groupedCourses[program];
          
          return (
            <div key={program} className="space-y-4">
              {/* Program Section Header divider with elegant count */}
              <div className="flex items-center justify-between border-b border-indigo-100/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Layers size={16} />
                  </span>
                  <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                    {program}
                  </h3>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {coursesInProgram.length} {coursesInProgram.length === 1 ? 'curso' : 'cursos'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-semibold italic">
                  Estructura agrupada
                </div>
              </div>

              {/* Toggle views depending on state */}
              {viewMode === 'mosaic' ? (
                /* --- MOSAIC GRID VIEW WITH BANNER IMAGES --- */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {coursesInProgram.map((course) => {
                    const statusVal = getStatusDetails(course.status);
                    const defaultImg = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
                    const activeBanner = course.imageUrl || defaultImg;

                    return (
                      <div 
                        key={course.id}
                        className={`bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group h-full ${statusVal.cardBorder}`}
                      >
                        {/* Course Banner Image Area */}
                        <div className="relative h-40 bg-slate-100 overflow-hidden shrink-0">
                          <img 
                            src={activeBanner} 
                            alt={course.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = defaultImg;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                          
                          {/* Floating Top indicators */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            {/* Color Flag */}
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-xs ${statusVal.colorClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusVal.dotClass}`} />
                              {statusVal.label}
                            </span>

                            {/* Options popup trigger or quick button */}
                            <a 
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-xs transition-colors"
                              title="Ingresar al Aula Virtual"
                            >
                              <ArrowUpRight size={14} />
                            </a>
                          </div>

                          {/* Category overlay */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <span className="text-[10px] font-bold text-indigo-200 bg-slate-900/40 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {course.category}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            {/* Title */}
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2" title={course.name}>
                                {course.name}
                              </h4>
                            </div>

                            {/* Teacher and details in rows */}
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <User size={13} className="text-slate-400 shrink-0" />
                                <span className="truncate">Docente: <strong className="text-slate-700 font-medium">{course.responsible}</strong></span>
                              </div>
                            </div>

                            {/* Progress Indicator */}
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                              <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                                <span className="text-slate-500 uppercase tracking-wider">Progreso de Montaje</span>
                                <span className={course.progress === 100 ? 'text-emerald-600' : 'text-indigo-600'}>
                                  {course.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    course.status === 'green' ? 'bg-emerald-500' : 
                                    course.status === 'yellow' ? 'bg-amber-400' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Notes description if exist */}
                            {course.notes && (
                              <div className="text-[11px] text-slate-500 bg-slate-50/50 p-2 rounded-lg border border-slate-100 flex gap-1 items-start">
                                <MessageCircle size={12} className="text-slate-400 shrink-0 mt-0.5" />
                                <p className="line-clamp-2 leading-relaxed" title={course.notes}>
                                  {course.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Quick Bottom Actions */}
                          <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold shrink-0">
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 hover:underline"
                            >
                              Acceso al Aula
                              <ExternalLink size={11} className="shrink-0" />
                            </a>

                            <div className="flex items-center gap-1">
                              {/* Edit */}
                              <button
                                onClick={() => onEditCourse(course)}
                                className="p-1 px-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 flex items-center gap-1 cursor-pointer"
                                title="Editar curso académico"
                              >
                                <Edit3 size={11} />
                                <span>Refactor</span>
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (confirm(`¿Está seguro de eliminar "${course.name}"?`)) {
                                    onDeleteCourse(course.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent cursor-pointer"
                                title="Eliminar curso"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* --- LIST TABLE VIEW GROUPED UNDER PROGRAM --- */
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                          <th className="px-5 py-3 font-bold">Curso Virtual</th>
                          <th className="px-5 py-3 font-bold">Responsable Docente</th>
                          <th className="px-5 py-3 font-bold">Avance</th>
                          <th className="px-5 py-3 font-bold text-center">Estado Funcional</th>
                          <th className="px-5 py-3 font-bold text-center">Observación / Notas</th>
                          <th className="px-5 py-3 font-bold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {coursesInProgram.map((course) => {
                          const statusVal = getStatusDetails(course.status);
                          return (
                            <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                              {/* Course info */}
                              <td className="px-5 py-3.5 max-w-xs">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-slate-800 block text-sm line-clamp-1">{course.name}</span>
                                  <a 
                                    href={course.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5"
                                  >
                                    Enlace de Acceso <ExternalLink size={8} />
                                  </a>
                                </div>
                              </td>

                              {/* Teacher of course */}
                              <td className="px-5 py-3.5 text-slate-600">
                                <div className="flex items-center gap-1">
                                  <User size={12} className="text-slate-400" />
                                  <span>{course.responsible}</span>
                                </div>
                              </td>

                              {/* progress */}
                              <td className="px-5 py-3.5 w-32">
                                <div className="space-y-1">
                                  <span className="font-bold text-slate-700">{course.progress}%</span>
                                  <div className="w-full bg-slate-100 rounded-full h-1">
                                    <div 
                                      className={`h-full rounded-full ${
                                        course.status === 'green' ? 'bg-emerald-500' : 
                                        course.status === 'yellow' ? 'bg-amber-400' : 'bg-rose-500'
                                      }`}
                                      style={{ width: `${course.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* functional code status badge */}
                              <td className="px-5 py-3.5 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${statusVal.colorClass} shadow-xs text-[10px]`}>
                                  <span className={`w-1 h-1 rounded-full ${statusVal.dotClass}`} />
                                  {statusVal.label}
                                </span>
                              </td>

                              {/* observations */}
                              <td className="px-5 py-3.5 max-w-xs">
                                <p className="text-slate-500 truncate leading-relaxed" title={course.notes}>
                                  {course.notes || <span className="text-slate-300 italic">Sin observaciones</span>}
                                </p>
                              </td>

                              {/* Actions */}
                              <td className="px-5 py-3.5 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => onEditCourse(course)}
                                    className="p-1 px-2 text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all cursor-pointer"
                                    title="Editar curso"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`¿Eliminar curso "${course.name}"?`)) {
                                        onDeleteCourse(course.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                    title="Eliminar curso"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Global Summary Panel */}
      <div className="bg-slate-50 rounded-2xl border border-slate-150 p-4 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500 font-semibold">
        <span>Mostrando {filteredCourses.length} de {courses.length} cursos registrados</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            Verde (Ajustado): <strong>{courses.filter(c => c.status === 'green').length}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            Amarillo (Mejoras): <strong>{courses.filter(c => c.status === 'yellow').length}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            Rojo (Crítico): <strong>{courses.filter(c => c.status === 'red').length}</strong>
          </span>
        </div>
      </div>

    </div>
  );
}
