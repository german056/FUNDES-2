import { useState, useEffect } from 'react';
import { Course } from './types';
import Dashboard from './components/Dashboard';
import CourseTable from './components/CourseTable';
import CourseForm from './components/CourseForm';
import StatsReports from './components/StatsReports';
import AuthModal from './components/AuthModal';
import { 
  BookOpen, Layout, PieChart, FileText, RefreshCw, 
  HelpCircle, AlertCircle, CheckCircle2, LogIn, LogOut, Lock
} from 'lucide-react';

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'reports'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notifications, setNotifications] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Authentication states with Local Storage persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fundes_authenticated') === 'true';
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Interceptor helper to run actions only if authenticated
  const executeWithAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setPendingAction(() => action);
      setIsAuthOpen(true);
      triggerNotification('error', 'Identificación requerida para realizar modificaciones (Usuario/Clave: 1234).');
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('fundes_authenticated', 'true');
    setIsAuthOpen(false);
    triggerNotification('success', '¡Autenticación de Coordinador exitosa!');
    
    // Execute the action that triggered the login modal, if any
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Load courses on startup
  useEffect(() => {
    fetchCourses();
  }, []);

  const triggerNotification = (type: 'success' | 'error', msg: string) => {
    setNotifications({ type, msg });
    setTimeout(() => {
      setNotifications(null);
    }, 5000);
  };

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Error al obtener la lista de cursos');
      const data = await response.json();
      setCourses(data.courses || []);
      
      // Extract unique categories from imported list
      const cats = Array.from(new Set((data.courses || []).map((c: Course) => c.category))) as string[];
      setCategories(cats.length ? cats : ['Especializaciones', 'Educación Virtual', 'Ingeniería']);
    } catch (error: any) {
      console.error(error);
      triggerNotification('error', 'No se pudo conectar al servidor. Trabajando con base de datos local.');
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize/pull courses directly from google sheets template URL (indispensable)
  const handleSyncSheets = async () => {
    setIsSyncing(true);
    triggerNotification('success', 'Sincronizando plantilla especializaciones virtuales de Google Sheets...');
    try {
      const response = await fetch('/api/courses/sync');
      if (!response.ok) throw new Error('Error al sincronizar con Google Sheets');
      const data = await response.json();
      setCourses(data.courses || []);
      
      const cats = Array.from(new Set((data.courses || []).map((c: Course) => c.category))) as string[];
      setCategories(cats.length ? cats : ['Especializaciones', 'Educación Virtual']);
      
      triggerNotification('success', `¡Sincronización completa! Se cargaron ${data.count} cursos virtuales.`);
    } catch (error: any) {
      console.error(error);
      triggerNotification('error', 'Error de red al intentar sincronizar con Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Create or Update course virtual
  const handleSaveCourse = async (courseData: Omit<Course, 'id'> & { id?: string }) => {
    try {
      let response;
      if (courseData.id) {
        // Edit existing course
        response = await fetch(`/api/courses/${courseData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData)
        });
      } else {
        // Create new course
        response = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData)
        });
      }

      if (!response.ok) throw new Error('Error al guardar el curso académico');
      await fetchCourses();
      setIsFormOpen(false);
      setSelectedCourse(null);
      triggerNotification('success', courseData.id ? 'Curso actualizado exitosamente.' : 'Curso registrado de manera exitosa.');
    } catch (error: any) {
      console.error(error);
      triggerNotification('error', 'No se pudo guardar la información en la base de datos.');
    }
  };

  // Delete course
  const handleDeleteCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar curso');
      await fetchCourses();
      triggerNotification('success', 'Curso académico eliminado correctamente.');
    } catch (error: any) {
      console.error(error);
      triggerNotification('error', 'Fallo al procesar la eliminación en el servidor.');
    }
  };

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedCourse(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 print:hidden shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-600/20">
              FV
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                Gestión de Cursos Virtuales
                <span className="text-[10px] font-bold tracking-widest uppercase py-0.5 px-2 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100/30">
                  Fundes
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">FUNDES, FUNDACIÓN DE ESTUDIOS SUPERIORES MONSEÑOR ABRAHAM ESCUDERO MONTOYA</p>
            </div>
          </div>

          {/* Sync Sheets Controls & Authentication Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 bg-slate-100/70 border border-slate-200/80 px-3.5 py-2 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold text-slate-700">Coordinador Logueado</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('fundes_authenticated');
                    setIsAuthenticated(false);
                    triggerNotification('success', 'Sesión de Coordinador cerrada exitosamente.');
                  }}
                  className="ml-1 text-slate-400 hover:text-rose-600 hover:bg-white p-1 rounded-lg transition-all border border-transparent hover:border-slate-150 cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPendingAction(null);
                  setIsAuthOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700/90 border border-slate-200 hover:border-indigo-100/50 font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn size={12} />
                <span>Iniciar Sesión Modificación</span>
              </button>
            )}

            <button
              onClick={() => executeWithAuth(handleSyncSheets)}
              disabled={isSyncing}
              className={`px-3.5 py-2 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 font-semibold text-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer`}
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin text-indigo-500' : 'text-slate-400'} />
              <span>Sincronizar Google Sheets</span>
            </button>
          </div>

        </div>
      </header>

      {/* Persistent Notification system */}
      {notifications && (
        <div className="fixed top-18 right-6 z-50 print:hidden transition-all duration-300">
          <div className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 max-w-sm ${notifications.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
            <div className="shrink-0 mt-0.5">
              {notifications.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">{notifications.type === 'success' ? 'Éxito' : 'Mensaje o Alerta'}</p>
              <p className="text-xs mt-0.5 font-medium leading-relaxed">{notifications.msg}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs bar */}
      <nav className="bg-white border-b border-slate-100 py-3 px-4 sm:px-6 lg:px-8 print:hidden shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          
          {/* Tab 1: Dashboard Control Panel */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/15' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <PieChart size={13} /> Panel de Control
          </button>

          {/* Tab 2: Admin Table list */}
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 ${activeTab === 'table' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/15' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <Layout size={13} /> Ventana Principal (Administración)
          </button>

          {/* Tab 3: Detailed Report Audit printable sheets */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/15' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            <FileText size={13} /> Reportes Académicos
          </button>

        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Cargando base de datos de cursos...</span>
          </div>
        ) : (
          <div className="transition-all duration-300">
            {activeTab === 'dashboard' && <Dashboard courses={courses} />}
            {activeTab === 'table' && (
              <CourseTable 
                courses={courses} 
                categories={categories}
                onAddCourse={() => executeWithAuth(handleCreateClick)}
                onEditCourse={(course) => executeWithAuth(() => handleEditClick(course))}
                onDeleteCourse={(id) => executeWithAuth(() => handleDeleteCourse(id))}
              />
            )}
            {activeTab === 'reports' && <StatsReports courses={courses} />}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-100 bg-white text-center text-xs text-slate-400 font-medium print:hidden shrink-0 mt-auto">
        <p>© 2026 Plataforma Especializaciones Virtuales Fundes. Todos los derechos reservados.</p>
      </footer>

      {/* Modal - Course Creator/Editor */}
      {isFormOpen && (
        <CourseForm
          course={selectedCourse}
          categories={categories}
          onSave={(courseData) => executeWithAuth(() => handleSaveCourse(courseData))}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedCourse(null);
          }}
        />
      )}

      {/* Modal - Auth Verification */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => {
            setIsAuthOpen(false);
            setPendingAction(null);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

    </div>
  );
}
