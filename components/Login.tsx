
import React, { useState } from 'react';
import { Fingerprint, Lock, User, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simular un pequeño retraso de carga para realismo visual
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-['Inter']">
      {/* Decoración de fondo */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="p-12">
            {/* Logo y Encabezado */}
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-200 mb-6">
                <Fingerprint className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic">BioAccess</h1>
              <span className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.4em] block mt-2">Enterprise Core</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-4">Identificador</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Nombre de usuario" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-4">Contraseña de acceso</label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Entrar al Sistema <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Protegido por BioAccess Encryption
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-500 text-xs font-medium">
          ¿Problemas para acceder? <span className="text-indigo-400 font-black uppercase tracking-widest cursor-pointer hover:text-indigo-300">Contactar IT</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
