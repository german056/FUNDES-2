import { useState, FormEvent } from 'react';
import { Lock, User, ShieldAlert, X, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('Por favor complete todos los campos.');
      return;
    }

    if (trimmedUser === '1234' && trimmedPass === '1234') {
      onSuccess();
    } else {
      setError('Credenciales inválidas. Verifique el usuario y la clave de acceso.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden transition-all scale-100">
        
        {/* Header decoration */}
        <div className="bg-indigo-600 px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white mb-2.5">
            <Lock size={20} className="text-white" />
          </div>
          <h3 className="text-base font-bold">Autenticación de Coordinador</h3>
          <p className="text-xs text-indigo-100/90 mt-0.5">
            Ingrese sus credenciales para autorizar cambios o modificaciones en el sistema.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="bg-rose-50 border border-rose-100/80 text-rose-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
              <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="font-semibold">{error}</div>
            </div>
          )}

          {/* User input field */}
          <div className="space-y-1.5 text-left">
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Usuario de Acceso
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={15} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="Ejemplo: 1234"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 bg-slate-50/30 hover:bg-slate-50/60 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>

          {/* Password input/key field */}
          <div className="space-y-1.5 text-left">
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Clave / Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={15} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Ingrese su contraseña"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none text-xs focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 bg-slate-50/30 hover:bg-slate-50/60 focus:bg-white transition-all text-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal text-left">
            * Nota: Por disposiciones administrativas, la cuenta configurada es única para el control curricular de FUNDES.
          </p>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/15 active:scale-95 cursor-pointer"
            >
              Validar Acceso
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
