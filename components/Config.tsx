import React, { useState } from 'react';
import { Settings, Mail, Bell, Building2, Save, CloudUpload } from 'lucide-react';

const Config: React.FC = () => {
  const [config, setConfig] = useState({
    company_name: 'BioAccess Enterprise',
    auto_reports: true,
    emails: 'admin@bioaccess.com, rrhh@bioaccess.com',
    sync_interval: '5'
  });

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
              <div className={`space-y-4 transition-opacity ${config.auto_reports ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Correos de Destino (Separados por coma)</label>
                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold text-slate-700 min-h-[120px]"
                      value={config.emails} onChange={e => setConfig({...config, emails: e.target.value})}></textarea>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <Bell className="w-5 h-5 text-amber-500" />
                    <p className="text-[10px] font-bold text-amber-700 leading-tight">Los reportes se enviarán diariamente a las 00:00 con el resumen del día anterior.</p>
                 </div>
              </div>
           </section>

           <button className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
              <Save className="w-5 h-5" /> Guardar Cambios Globales
           </button>
        </div>
      </div>
    </div>
  );
};

export default Config;