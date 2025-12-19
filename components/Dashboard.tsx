
import React from 'react';
import { 
  Users, CheckCircle2, AlertCircle, TrendingUp, Fingerprint, ClipboardList 
} from 'lucide-react';
import { DashboardStats, AttendanceLog } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  logs: AttendanceLog[];
  onViewAllAttendance: () => void;
  onNavigate: (tab: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, logs, onViewAllAttendance, onNavigate }) => {
  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight italic">Panel General</h2>
        <p className="text-slate-400 font-medium text-sm">Resumen operativo del ecosistema biométrico.</p>
      </header>

      {/* KPIs Responsivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        <button 
          onClick={() => onNavigate('employees')}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 md:gap-8 group transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer text-left w-full"
        >
          <div className="bg-indigo-50 p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white shrink-0">
            <Users className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal</p>
            <p className="text-3xl md:text-5xl font-black text-slate-900 mt-1">{stats.total_employees}</p>
          </div>
        </button>
        
        <button 
          onClick={() => onNavigate('reports')}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 md:gap-8 group transition-all hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer text-left w-full"
        >
          <div className="bg-emerald-50 p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white shrink-0">
            <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asistencias</p>
            <p className="text-3xl md:text-5xl font-black text-slate-900 mt-1">{stats.today_attendance}</p>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('reports')}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 md:gap-8 group transition-all hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 cursor-pointer text-left w-full md:col-span-2 lg:col-span-1"
        >
          <div className="bg-rose-50 p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white shrink-0">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Incidencias</p>
            <p className="text-3xl md:text-5xl font-black text-slate-900 mt-1">{stats.late_arrivals}</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-indigo-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-white overflow-hidden relative shadow-2xl shadow-indigo-200 flex flex-col justify-center min-h-[350px]">
          <div className="relative z-10">
            <div className="bg-indigo-500 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 shadow-lg">
               <Fingerprint className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black mb-4 md:mb-6 italic leading-none tracking-tight">BioAccess Core v4.0</h3>
            <p className="text-indigo-200 text-sm md:text-lg leading-relaxed mb-8 md:mb-10 font-medium max-w-md">Motor de procesamiento biométrico con ingesta masiva y eliminación de duplicados en tiempo real.</p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">Local Engine</span>
              <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">AES-256 Cloud Sync</span>
            </div>
          </div>
          <Fingerprint className="absolute -bottom-20 -right-20 w-[400px] h-[400px] opacity-5 pointer-events-none rotate-12" />
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 shadow-sm flex flex-col h-full min-h-[350px]">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <h4 className="text-lg md:text-xl font-black text-slate-900 italic flex items-center gap-3">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
              Últimas Marcas
            </h4>
            <button onClick={onViewAllAttendance} className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Ver Todo</button>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {logs.slice().reverse().map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-indigo-100 group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm ${log.status === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {log.status === 0 ? 'IN' : 'OUT'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-xs md:text-sm truncate">{log.first_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(log.att_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-200/50 px-2 py-1 rounded-lg">{log.device_id.split('-')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
