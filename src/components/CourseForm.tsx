import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { X, Save, AlertTriangle, Link, Layers, User, Calendar, Plus } from 'lucide-react';

interface CourseFormProps {
  course: Course | null; // If null, we are in 'create' mode
  categories: string[];
  onSave: (courseData: Omit<Course, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export default function CourseForm({ course, categories, onSave, onCancel }: CourseFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<Course['status']>('red');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [responsible, setResponsible] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (course) {
      setName(course.name);
      setUrl(course.url);
      setProgress(course.progress);
      setStatus(course.status);
      setCategory(course.category);
      setResponsible(course.responsible);
      setNotes(course.notes || '');
      setImageUrl(course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80');
    } else {
      setName('');
      setUrl('');
      setProgress(0);
      setStatus('red');
      setCategory(categories[0] || 'Especializaciones');
      setResponsible('');
      setNotes('');
      setImageUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80');
    }
    setErrors({});
  }, [course, categories]);

  // Sync status with progress dynamically for convenience, but let user override
  const handleProgressChange = (val: number) => {
    setProgress(val);
    if (val === 100) {
      setStatus('green');
    } else if (val >= 60) {
      setStatus('yellow');
    } else {
      setStatus('red');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre del curso es obligatorio.';
    
    if (!url.trim()) {
      newErrors.url = 'La URL es obligatoria.';
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      newErrors.url = 'La URL debe iniciar con http:// o https://';
    }
    
    if (!responsible.trim()) newErrors.responsible = 'El docente/responsable es obligatorio.';
    
    const activeCategory = showNewCatInput ? newCategory : category;
    if (!activeCategory || !activeCategory.trim()) {
      newErrors.category = 'Debe seleccionar o especificar una categoría.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = showNewCatInput ? newCategory.trim() : category;

    onSave({
      id: course?.id,
      name: name.trim(),
      url: url.trim(),
      progress,
      status,
      category: finalCategory,
      responsible: responsible.trim(),
      notes: notes.trim(),
      imageUrl: imageUrl.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {course ? 'Editar Curso Virtual' : 'Registrar Nuevo Curso Virtual'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete los detalles del curso académico para su monitoreo.
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Grid Layout */}
          <div className="space-y-4">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre del Curso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Especialidad en Analítica de Datos"
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-300 bg-red-50/10 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 text-left">{errors.name}</p>}
            </div>

            {/* URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Link size={13} className="text-slate-400" />
                URL de Acceso (Moodle/Aula Virtual) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://virtual.fundes.edu.co/course/view.php?id=..."
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.url ? 'border-red-300 bg-red-50/10 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
              />
              {errors.url && <p className="text-red-500 text-xs mt-1 text-left">{errors.url}</p>}
            </div>

            {/* Category and Responsible in 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Layers size={13} className="text-slate-400" />
                  Categoría / Programa <span className="text-red-500">*</span>
                </label>
                
                {!showNewCatInput ? (
                  <div className="flex gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      {categories.length === 0 && (
                        <option value="Varios">Varios</option>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput(true)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors flex items-center gap-1 border border-slate-200"
                    >
                      <Plus size={14} /> Nueva
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Nueva Categoría"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput(false)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-xs transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {errors.category && <p className="text-red-500 text-xs mt-1 text-left">{errors.category}</p>}
              </div>

              {/* Responsible */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <User size={13} className="text-slate-400" />
                  Docente/Responsable <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Ej. Dr. Mario Silva"
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.responsible ? 'border-red-300 bg-red-50/10 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} focus:ring-2 focus:border-transparent outline-none transition-all text-sm`}
                />
                {errors.responsible && <p className="text-red-500 text-xs mt-1 text-left">{errors.responsible}</p>}
              </div>

            </div>

            {/* Progress & Functionality Color Code (Indispensable) */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-500" />
                Estado de Avance y Calificación de Funcionalidad
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Progress Bar Range Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-slate-600">Porcentaje de Avance</span>
                    <span className="text-sm font-bold text-indigo-600">{progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => handleProgressChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1">
                    <span>0% (Inicio)</span>
                    <span>50% (Medio)</span>
                    <span>100% (Listo)</span>
                  </div>
                </div>

                {/* Level of Functionality Color Choice */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 text-left">
                    Nivel de Funcionalidad:
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Green */}
                    <button
                      type="button"
                      onClick={() => setStatus('green')}
                      className={`text-xs p-2 rounded-xl flex flex-col items-center justify-center border transition-all ${status === 'green' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-800 font-semibold' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      <div className="w-4 h-4 rounded-full bg-emerald-500 mb-1 border border-emerald-600" />
                      <span>Verde</span>
                      <span className="text-[9px] text-slate-400 font-normal">Ajustado</span>
                    </button>

                    {/* Yellow */}
                    <button
                      type="button"
                      onClick={() => setStatus('yellow')}
                      className={`text-xs p-2 rounded-xl flex flex-col items-center justify-center border transition-all ${status === 'yellow' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-800 font-semibold' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      <div className="w-4 h-4 rounded-full bg-amber-400 mb-1 border border-amber-500" />
                      <span>Amarillo</span>
                      <span className="text-[9px] text-slate-400 font-normal">Funcional c/ ajustes</span>
                    </button>

                    {/* Red */}
                    <button
                      type="button"
                      onClick={() => setStatus('red')}
                      className={`text-xs p-2 rounded-xl flex flex-col items-center justify-center border transition-all ${status === 'red' ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-800 font-semibold' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      <div className="w-4 h-4 rounded-full bg-rose-500 mb-1 border border-rose-600" />
                      <span>Rojo</span>
                      <span className="text-[9px] text-slate-400 font-normal">Crítico / Fallas</span>
                    </button>
                  </div>

                </div>
                
              </div>

              {/* Functional Alert description */}
              <div className="p-2.5 rounded-xl text-[11px] flex gap-2 items-start border">
                {status === 'green' && (
                  <div className="text-emerald-700 bg-emerald-50/50 flex gap-1.5 w-full">
                    <span className="font-bold text-lg leading-none">✓</span>
                    <span>El color <strong>verde</strong> indica cursos completamente estructurados, funcionales y listos para docencia virtual.</span>
                  </div>
                )}
                {status === 'yellow' && (
                  <div className="text-amber-700 bg-amber-50/50 flex gap-1.5 w-full">
                    <span className="font-bold text-lg leading-none font-mono">!</span>
                    <span>El color <strong>amarillo</strong> indica cursos que funcionan pero requieren mejoras como subir algunos recursos o arreglar detalles menores.</span>
                  </div>
                )}
                {status === 'red' && (
                  <div className="text-rose-700 bg-rose-50/50 flex gap-1.5 w-full">
                    <span className="font-bold text-lg leading-none">✗</span>
                    <span>El color <strong>rojo</strong> indica cursos no funcionales o con enlaces rotos, fallas críticas que bloquean el proceso formativo.</span>
                  </div>
                )}
              </div>

            </div>

            {/* Imagen o Banner del Curso */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-left">
                Imagen o Banner de Presentación
              </label>
              
              <div className="space-y-3">
                {/* Visualizer and Custom URL Input */}
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center relative">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt="Previsualización" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">Sin Imagen</span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="URL de imagen personalizada (https://...)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Puede ingresar una URL personalizada o seleccionar uno de los diseños recomendados abajo.
                    </p>
                  </div>
                </div>

                {/* Templates Selector / Quick picks */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider text-left">
                    Banners recomendados:
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { name: 'Tecnología', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80' },
                      { name: 'Frontend', url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80' },
                      { name: 'E-Learning', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
                      { name: 'Business', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80' },
                      { name: 'Whiteboard', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80' }
                    ].map((tpl) => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => setImageUrl(tpl.url)}
                        className={`group relative h-12 rounded-xl overflow-hidden border transition-all ${imageUrl === tpl.url ? 'ring-2 ring-indigo-500 border-indigo-500 scale-[1.03]' : 'border-slate-200 hover:scale-[1.02]'}`}
                        title={tpl.name}
                      >
                        <img 
                          src={tpl.url} 
                          alt={tpl.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] text-white font-medium px-1 truncate max-w-full">
                            {tpl.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes / Observaciones */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Observaciones y Detalles de Intervención
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Escriba los detalles sobre pendientes, recursos faltantes, o justificaciones del nivel de funcionalidad..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-indigo-500 focus:ring-2 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

          </div>

          {/* Form Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 rounded-xl text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-md shadow-indigo-600/15 flex items-center gap-1.5 hover:shadow-indigo-600/20 transition-all"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
