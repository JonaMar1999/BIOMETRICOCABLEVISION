
import React, { useState } from 'react';
import { 
  Settings, Mail, Bell, Building2, Save, CloudUpload, Clock, 
  CalendarDays, Map, Plus, Edit2, Trash2, Check, X 
} from 'lucide-react';
import { Department } from '../types';

interface ConfigProps {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
}

const Config: React.FC<ConfigProps> = ({ departments, setDepartments }) => {
  const [config, setConfig] = useState({
    company_name: 'BioAccess Enterprise',
    auto_reports: true,
    emails: 'admin@bioaccess.com, rrhh@bioaccess.com',
    sync_interval: '5',
    selected_days: [1, 2, 3, 4, 5], // 1=Lunes, 7=Domingo
    report_time: '08:00'
  });

  const days = [
    { id: 1, label: 'L', name: 'Lunes' },
    { id: 2, label: 'M', name: 'Martes' },
    { id: 3, label: 'M', name: 'Miércoles' },
    { id: 4, label: 'J', name: 'Jueves' },
    { id: 5, label: 'V', name: 'Viernes' },
    { id: 6, label: 'S', name: 'Sábado' },
    { id: 7, label: 'D', name: 'Domingo' },
  ];

  const toggleDay = (id: number) => {
    setConfig(prev => ({
      ...prev,
      selected_days: prev.selected_days.includes(id)
        ? prev.selected_days.filter(d => d !== id)
        : [...prev.selected_days, id].sort()
    }));
  };

  const getSummaryText = () => {
    if (config.selected_days.length === 0) return "No hay días seleccionados para el envío.";
    if (config.selected_days.length === 7) return `Se enviarán reportes todos los días a las ${config.report_time}.`;
    
    const selectedNames = days
      .filter(d => config.selected_days.includes(d.id))
      .map(d => d.name);
      
    return `Reportes programados para: ${selectedNames.join(', ')} a las ${config.report_time}.`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Configuración</h2>
        <p className="text-slate-500 font-medium">Ajustes globales del motor de asistencia.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
           <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-black italic flex items-center gap-3">
                <Building2 className="w-6 h-6 text-indigo-600" /> Identidad Corporativa
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                   <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                      <CloudUpload />
                   </div>
                   <div>
                      <p className="font-bold text-slate-800">Logo de la Empresa</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">PNG o JPG • Max 2MB</p>
                   </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre de la Organización</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold text-slate-700"
                    value={config.company_name} onChange={e => setConfig({...config, company_name: e.target.value})} />
                </div>
              </div>
           </section>

           <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-black italic flex items-center gap-3">
                <Settings className="w-6 h-6 text-indigo-600" /> Motor de Sincronización
              </h3>
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Intervalo de Sync (Minutos)</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold text-slate-700 cursor-pointer"
                    value={config.sync_interval} onChange={e => setConfig({...config, sync_interval: e.target.value})}>
                    <option value="1">Cada minuto</option>
                    <option value="5">Cada 5 minutos</option>
                    <option value="15">Cada 15 minutos</option>
                    <option value="60">Cada hora</option>
                  </select>
                </div>
           </section>
        </div>

        <div className="space-y-8">
           <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-black italic flex items-center justify-between">
                <span className="flex items-center gap-3"><Mail className="w-6 h-6 text-indigo-600" /> Reportes Automáticos</span>
                <button 
                  onClick={() => setConfig({...config, auto_reports: !config.auto_reports})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${config.auto_reports ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.auto_reports ? 'right-1' : 'left-1'}`}></div>
                </button>
              </h3>
              <div className={`space-y-6 transition-all duration-300 ${config.auto_reports ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Correos de Destino (Separados por coma)</label>
                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold text-slate-700 min-h-[100px]"
                      value={config.emails} onChange={e => setConfig({...config, emails: e.target.value})}></textarea>
                 </div>

                 <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Programación Semanal (Días de Envío)</label>
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-3xl border border-slate-100">
                        {days.map((day) => {
                          const isActive = config.selected_days.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              onClick={() => toggleDay(day.id)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                                isActive 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                                : 'bg-transparent text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hora de Envío</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                        <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none font-bold text-slate-700 text-sm"
                          value={config.report_time} onChange={e => setConfig({...config, report_time: e.target.value})} />
                      </div>
                    </div>
                 </div>

                 <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <Bell className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-indigo-700 leading-tight">
                      {getSummaryText()}
                    </p>
                 </div>
              </div>
           </section>

           <button className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95">
              <Save className="w-5 h-5" /> Guardar Cambios Globales
           </button>
        </div>
      </div>
    </div>
  );
};

export default Config;
