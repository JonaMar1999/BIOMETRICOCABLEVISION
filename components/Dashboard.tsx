
import React from 'react';
import { 
  Users, CheckCircle2, AlertCircle, TrendingUp, Fingerprint, ClipboardList 
} from 'lucide-react';
import { DashboardStats, AttendanceLog } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  logs: AttendanceLog[];
  onViewAllAttendance: () => void;
  onNavigate: (tab: 'dashboard' | 'attendance' | 'employees' | 'reports' | 'config' | 'users') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, logs, onViewAllAttendance, onNavigate }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Panel General</h2>
          <p className="text-slate-400 font-medium mt-1">Resumen operativo basado en datos locales de demostración.</p>
        </div>
      </header>

      {/* TARJETAS DE ESTADÍSTICAS INTERACTIVAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Personal - Acceso Rápido a Gestión de Personal */}
        <button 
          onClick={() => onNavigate('employees')}
          className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-8 group transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer text-left w-full"
        >
          <div className="bg-indigo-50 p-6 rounded-[1.5rem] text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white shrink-0">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal Activo</p>
            <p className="text-5xl font-black text-slate-900 mt-1">{stats.total_employees}</p>
          </div>
        </button>
        
        {/* Asistencias - Acceso Rápido a Reportes */}
        <button 
          onClick={() => onNavigate('reports')}
          className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-8 group transition-all hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer text-left w-full"
        >
          <div className="bg-emerald-50 p-6 rounded-[1.5rem] text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asistencias Hoy</p>
            <p className="text-5xl font-black text-slate-900 mt-1">{stats.today_attendance}</p>
          </div>
        </button>

        {/* Retardos - Acceso Rápido a Reportes de Incidencias */}
        <button 
          onClick={() => onNavigate('reports')}
          className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-8 group transition-all hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 cursor-pointer text-left w-full"
        >
          <div className="bg-rose-50 p-6 rounded-[1.5rem] text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white shrink-0">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Retardos Det.</p>
            <p className="text-5xl font-black text-slate-900 mt-1">{stats.late_arrivals}</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BANNER DE TECNOLOGÍA */}
        <div className="bg-indigo-900 rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl shadow-indigo-200 h-full flex flex-col justify-center min-h-[400px]">
          <div className="relative z-10 max-w-lg">
            <div className="bg-indigo-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
               <Fingerprint className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black mb-6 italic leading-none">BioAccess Core v4.0</h3>
            <p className="text-indigo-200 text-lg leading-relaxed mb-10 font-medium">Motor de procesamiento biométrico con ingesta masiva y eliminación de duplicados en tiempo de ejecución.</p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">Auto-Sync Enabled</span>
              <span className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">Local Data Source</span>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 p-12 opacity-5 pointer-events-none rotate-12">
            <Fingerprint className="w-[500px] h-[500px]" />
          </div>
        </div>

        {/* FEED DE ÚLTIMAS MARCAS */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-10">
            <h4 className="text-xl font-black text-slate-900 italic flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-indigo-500" />
              Últimas Marcaciones
            </h4>
            <button 
              onClick={onViewAllAttendance}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b-2 border-transparent hover:border-indigo-600 transition-all pb-1"
            >
              Monitor Completo
            </button>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {logs.slice().reverse().map((log) => (
              <div key={log.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 transition-all hover:bg-white hover:border-indigo-100 hover:shadow-md group">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[11px] shadow-sm transition-all group-hover:scale-110 ${log.status === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {log.status === 0 ? 'IN' : 'OUT'}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm tracking-tight">{log.first_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(log.att_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                       <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{log.department}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">ID Dispositivo</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-200/50 px-3 py-1 rounded-lg">{log.device_id.split('-')[0]}</span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4 opacity-30">
                <ClipboardList className="w-16 h-16" />
                <p className="text-xs font-black uppercase tracking-widest">Sin registros recientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
