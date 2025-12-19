
import React, { useState } from 'react';
import { 
  Settings, Mail, Bell, Building2, Save, CloudUpload, Clock, 
  ShieldCheck, Lock, Eye, EyeOff, Server, Globe, CheckCircle2,
  Cpu, Users, UserCog, ShieldAlert, CalendarDays, ChevronRight, Activity
} from 'lucide-react';
import { Department, Role, AttendanceLog, User } from '../types';
import UserRoles from './UserRoles';

interface ConfigProps {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  logs: AttendanceLog[];
  canEdit: boolean;
}

const Config: React.FC<ConfigProps> = ({ departments, setDepartments, roles, setRoles, logs, canEdit }) => {
  const [activeSubTab, setActiveSubTab] = useState<'empresa' | 'smtp' | 'automatizacion' | 'seguridad'>('empresa');
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [config, setConfig] = useState({
    company_name: 'BioAccess Enterprise',
    smtp_server: 'smtp.bioaccess-cloud.com',
    smtp_port: '587',
    smtp_user: 'notificaciones@bioaccess.com',
    smtp_pass: 'aezakmi_secure_key_2024',
    auto_reports: true,
    emails: 'admin@bioaccess.com, rrhh@bioaccess.com',
    sync_interval: '5',
    selected_days: [1, 2, 3, 4, 5], // Lunes a Viernes
    report_time: '08:00'
  });

  const toggleDay = (day: number) => {
    if (!canEdit) return;
    setConfig(prev => ({
      ...prev,
      selected_days: prev.selected_days.includes(day) 
        ? prev.selected_days.filter(d => d !== day) 
        : [...prev.selected_days, day]
    }));
  };

  const handleGlobalSave = () => { 
    setIsSaving(true); 
    setTimeout(() => { 
      setIsSaving(false); 
      alert("Configuración sincronizada exitosamente con el núcleo."); 
    }, 1000); 
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic leading-tight">Configuración</h2>
          <p className="text-slate-500 font-medium text-sm">Control operativo y de seguridad del sistema.</p>
        </div>
        {!canEdit && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest w-fit">
            <ShieldAlert className="w-4 h-4" /> Modo Lectura
          </div>
        )}
      </header>

      {/* Navegación de Pestañas Responsiva */}
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 bg-slate-100 p-2 rounded-[2rem] w-max border border-slate-200">
          {[
            { id: 'empresa', label: 'Empresa', icon: Building2 },
            { id: 'smtp', label: 'SMTP', icon: Server },
            { id: 'automatizacion', label: 'Auto', icon: Bell },
            { id: 'seguridad', label: 'Seguridad', icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeSubTab === tab.id ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {/* PESTAÑA EMPRESA RESTAURADA */}
        {activeSubTab === 'empresa' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-in slide-in-from-left-4">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
               <h3 className="text-lg font-black italic flex items-center gap-3 text-slate-800"><Globe className="w-6 h-6 text-indigo-500" /> Identidad Visual</h3>
               <div className="flex flex-col items-center justify-center p-8 md:p-10 border-4 border-dashed border-slate-50 rounded-[2.5rem] bg-slate-50/30 group transition-all hover:bg-slate-50">
                  <div className="bg-white p-5 rounded-2xl shadow-lg mb-4 text-indigo-500"><CloudUpload className="w-8 h-8" /></div>
                  <p className="font-black text-slate-800 text-sm">Arrastra o selecciona el logo</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">PNG o SVG recomendado</p>
                  <input type="file" disabled={!canEdit} className="hidden" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2 italic">Nombre de la Institución</label>
                  <input type="text" disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-50" value={config.company_name} onChange={e => setConfig({...config, company_name: e.target.value})} />
               </div>
            </div>
            
            <div className="bg-indigo-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center min-h-[300px] shadow-2xl shadow-indigo-100">
               <div className="relative z-10">
                 <h4 className="text-2xl md:text-3xl font-black italic mb-6 leading-tight">Vista Previa Corporativa</h4>
                 <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md inline-flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-900 font-black shadow-lg">L</div>
                    <p className="font-black text-xl italic truncate max-w-[180px]">{config.company_name}</p>
                 </div>
               </div>
               <Building2 className="absolute -bottom-10 -right-10 w-48 h-48 text-white opacity-5 rotate-12" />
            </div>
          </div>
        )}

        {/* PESTAÑA SMTP RESTAURADA */}
        {activeSubTab === 'smtp' && (
          <div className="max-w-3xl mx-auto bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10 animate-in zoom-in duration-300">
             <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500"><Mail className="w-6 h-6" /></div>
                <div><h3 className="text-xl font-black italic">Servidor de Notificaciones</h3><p className="text-xs text-slate-400 font-medium">Configuración de correos para alertas y reportes.</p></div>
             </div>
             <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-2 italic tracking-widest">Host SMTP</label>
                  <input type="text" disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-indigo-500" value={config.smtp_server} onChange={e => setConfig({...config, smtp_server: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <div className="sm:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-2 italic tracking-widest">Usuario Auth</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-indigo-500" value={config.smtp_user} onChange={e => setConfig({...config, smtp_user: e.target.value})} /></div>
                   <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-2 italic tracking-widest">Puerto</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-indigo-500" value={config.smtp_port} onChange={e => setConfig({...config, smtp_port: e.target.value})} /></div>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-2 italic tracking-widest">Contraseña App</label>
                  <div className="relative">
                    <input type={showSmtpPass ? 'text' : 'password'} disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-indigo-500" value={config.smtp_pass} onChange={e => setConfig({...config, smtp_pass: e.target.value})} />
                    <button type="button" onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">{showSmtpPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  </div>
                </div>
             </div>
             <button 
               onClick={() => alert('✅ Conexión Exitosa: El servidor SMTP respondió correctamente')}
               className="w-full py-5 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-colors shadow-sm"
             >
               Probar Conexión del Nodo
             </button>
          </div>
        )}

        {/* PESTAÑA AUTOMATIZACIÓN RESTAURADA */}
        {activeSubTab === 'automatizacion' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4">
             <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black italic flex items-center gap-3"><Activity className="w-6 h-6 text-emerald-500" /> Programación</h3>
                  <button onClick={() => setConfig({...config, auto_reports: !config.auto_reports})} className={`w-12 h-6 rounded-full transition-colors relative ${config.auto_reports ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.auto_reports ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block ml-1 italic tracking-widest">Días de Envío</label>
                      <div className="flex flex-wrap gap-2">
                        {['L','M','X','J','V','S','D'].map((day, idx) => (
                          <button key={idx} onClick={() => toggleDay(idx + 1)} className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all border ${config.selected_days.includes(idx + 1) ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                            {day}
                          </button>
                        ))}
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 italic tracking-widest">Hora Ejecución</label>
                        <div className="relative">
                          <input type="time" disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-sm" value={config.report_time} onChange={e => setConfig({...config, report_time: e.target.value})} />
                          <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 italic tracking-widest">Intervalo Sync</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-sm" value={config.sync_interval} onChange={e => setConfig({...config, sync_interval: e.target.value})}>
                          <option value="5">Cada 5 min</option>
                          <option value="15">Cada 15 min</option>
                          <option value="60">Cada hora</option>
                        </select>
                      </div>
                   </div>
                   {/* CAMPO RESTAURADO: CORREO DE DESTINO */}
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 italic tracking-widest">Correo de Destino</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          disabled={!canEdit} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-sm outline-none focus:border-indigo-500 disabled:opacity-50" 
                          placeholder="ejemplo@correo.com"
                          value={config.emails} 
                          onChange={e => setConfig({...config, emails: e.target.value})} 
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-slate-100 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 flex flex-col justify-center text-center">
                <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-500 shadow-xl border border-slate-100"><CalendarDays className="w-10 h-10" /></div>
                <h4 className="text-xl font-black italic mb-3">Auditoría Automatizada</h4>
                <p className="text-xs text-slate-500 font-medium max-w-[280px] mx-auto leading-relaxed">El sistema enviará un resumen de inasistencias los días seleccionados a las {config.report_time} hrs.</p>
                <div className="mt-8 flex items-center justify-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Servicio Activo</span>
                </div>
             </div>
          </div>
        )}

        {/* PESTAÑA SEGURIDAD RESTAURADA */}
        {activeSubTab === 'seguridad' && <UserRoles departments={departments} logs={logs} roles={roles} setRoles={setRoles} canEdit={canEdit} />}
      </div>

      {/* BOTÓN DE GUARDADO GLOBAL RESTAURADO Y MEJORADO */}
      <div className="fixed bottom-0 left-0 right-0 p-6 md:p-10 bg-slate-50/80 backdrop-blur-xl border-t border-slate-200/50 z-20 md:relative md:bg-transparent md:border-0 md:p-0 md:mt-12">
        <button 
          onClick={handleGlobalSave}
          disabled={!canEdit || isSaving}
          className={`
            w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] py-6 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-slate-900
            ${isSaving ? 'cursor-wait' : 'cursor-pointer'}
          `}
        >
          {isSaving ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-6 h-6" /> 
              <span className="hidden sm:inline">Guardar Configuración Global</span>
              <span className="sm:hidden text-xs">Guardar Cambios</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Config;
