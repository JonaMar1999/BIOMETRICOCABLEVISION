
import React, { useState } from 'react';
import { 
  Settings, Mail, Bell, Building2, Save, CloudUpload, Clock, 
  ShieldCheck, Lock, Eye, EyeOff, Server, Globe, CheckCircle2,
  Cpu, Users, UserCog, ShieldAlert, CalendarDays, ChevronRight
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
    selected_days: [1, 2, 3, 4, 5], 
    report_time: '08:00'
  });

  const days = [
    { id: 1, label: 'L' }, { id: 2, label: 'M' }, { id: 3, label: 'M' },
    { id: 4, label: 'J' }, { id: 5, label: 'V' }, { id: 6, label: 'S' }, { id: 7, label: 'D' }
  ];

  const toggleDay = (id: number) => {
    if (!canEdit) return;
    setConfig(prev => ({
      ...prev,
      selected_days: prev.selected_days.includes(id)
        ? prev.selected_days.filter(d => d !== id)
        : [...prev.selected_days, id].sort()
    }));
  };

  const handleGlobalSave = () => {
    setIsSaving(true);
    // Simulación de guardado en API
    setTimeout(() => {
      setIsSaving(false);
      alert("Configuración global sincronizada correctamente.");
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Configuración del Sistema</h2>
          <p className="text-slate-500 font-medium">Panel maestro de control operativo y seguridad.</p>
        </div>
        {!canEdit && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" /> Modo Consulta: Cambios Restringidos
          </div>
        )}
      </header>

      {/* NAVEGACIÓN POR PESTAÑAS (TABS) */}
      <div className="flex gap-2 bg-slate-100 p-2 rounded-[2rem] w-fit border border-slate-200">
        {[
          { id: 'empresa', label: 'Empresa', icon: Building2 },
          { id: 'smtp', label: 'Correo (SMTP)', icon: Server },
          { id: 'automatizacion', label: 'Automatización', icon: Bell },
          { id: 'seguridad', label: 'Seguridad', icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeSubTab === tab.id 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {/* TAB 1: EMPRESA */}
        {activeSubTab === 'empresa' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-left-4 duration-300">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
               <h3 className="text-lg font-black italic flex items-center gap-3 text-slate-800">
                 <Globe className="w-6 h-6 text-indigo-500" /> Identidad Visual
               </h3>
               <div className="flex flex-col items-center justify-center p-10 border-4 border-dashed border-slate-50 rounded-[2.5rem] bg-slate-50/30 group hover:border-indigo-100 transition-all">
                  <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-100 mb-4 transition-transform group-hover:-translate-y-2">
                    <CloudUpload className="w-10 h-10 text-indigo-500" />
                  </div>
                  <p className="font-black text-slate-800 text-sm">Cargar Nuevo Logotipo</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">SVG, PNG o JPG • 200x200px</p>
                  <input type="file" disabled={!canEdit} className="hidden" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Nombre Comercial</label>
                  <input 
                    type="text" 
                    disabled={!canEdit}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-50"
                    value={config.company_name} 
                    onChange={e => setConfig({...config, company_name: e.target.value})} 
                  />
               </div>
            </div>
            
            <div className="bg-indigo-900 rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col justify-center">
               <div className="relative z-10">
                 <h4 className="text-3xl font-black italic mb-4">Vista Previa</h4>
                 <p className="text-indigo-200 font-medium mb-8 leading-relaxed">Así se verá tu organización en los reportes exportados y en el panel de bienvenida.</p>
                 <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md inline-flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-900 font-black">L</div>
                    <p className="font-black text-xl italic">{config.company_name}</p>
                 </div>
               </div>
               <Building2 className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-5 rotate-12" />
            </div>
          </div>
        )}

        {/* TAB 2: CORREO SMTP */}
        {activeSubTab === 'smtp' && (
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10 animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-4">
               <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600"><Server className="w-8 h-8" /></div>
               <div>
                 <h3 className="text-xl font-black italic text-slate-900 leading-none">Servidor de Salida</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Configuración SMTP para Alertas y Reportes</p>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Servidor SMTP (Host)</label>
                  <input type="text" disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 disabled:opacity-50" value={config.smtp_server} onChange={e => setConfig({...config, smtp_server: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Puerto</label>
                  <input type="text" disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 disabled:opacity-50" value={config.smtp_port} onChange={e => setConfig({...config, smtp_port: e.target.value})} />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Nombre de Usuario / Email</label>
                  <input type="email" disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 disabled:opacity-50" value={config.smtp_user} onChange={e => setConfig({...config, smtp_user: e.target.value})} />
                </div>
                <div className="md:col-span-3 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Contraseña de Autenticación</label>
                  <div className="relative">
                    <input 
                      type={showSmtpPass ? 'text' : 'password'} 
                      disabled={!canEdit}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 pr-16 disabled:opacity-50" 
                      value={config.smtp_pass} 
                      onChange={e => setConfig({...config, smtp_pass: e.target.value})} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showSmtpPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
             </div>
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">¿Deseas validar la conexión?</p>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100">Test de Conexión</button>
             </div>
          </div>
        )}

        {/* TAB 3: AUTOMATIZACIÓN */}
        {activeSubTab === 'automatizacion' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in duration-300">
             <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="p-4 bg-orange-50 rounded-2xl text-orange-600"><CalendarDays className="w-8 h-8" /></div>
                     <div>
                       <h3 className="text-xl font-black italic text-slate-900 leading-none">Reportes Automáticos</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Programación de envíos masivos por email</p>
                     </div>
                   </div>
                   <button 
                    disabled={!canEdit}
                    onClick={() => setConfig({...config, auto_reports: !config.auto_reports})}
                    className={`w-14 h-7 rounded-full transition-all relative ${config.auto_reports ? 'bg-indigo-600' : 'bg-slate-200 opacity-50'}`}
                   >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${config.auto_reports ? 'right-1' : 'left-1'}`}></div>
                   </button>
                </div>

                <div className={`space-y-8 transition-all duration-500 ${config.auto_reports ? 'opacity-100 translate-y-0' : 'opacity-20 pointer-events-none -translate-y-4'}`}>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Días de Ejecución</label>
                      <div className="flex justify-between bg-slate-50 p-3 rounded-3xl border border-slate-100">
                        {days.map(day => (
                          <button 
                            key={day.id} 
                            onClick={() => toggleDay(day.id)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
                              config.selected_days.includes(day.id) ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Hora de Envío</label>
                        <div className="relative">
                          <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                          <input type="time" disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-4 font-bold text-slate-700 outline-none" value={config.report_time} onChange={e => setConfig({...config, report_time: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Sincronización</label>
                        <div className="relative">
                          <Cpu className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                          <select disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-4 font-bold text-slate-700 outline-none cursor-pointer appearance-none" value={config.sync_interval} onChange={e => setConfig({...config, sync_interval: e.target.value})}>
                            <option value="1">Cada Minuto</option>
                            <option value="5">Cada 5 Minutos</option>
                            <option value="15">Cada 15 Minutos</option>
                          </select>
                        </div>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Lista de Destinatarios (Admin/Auditoría)</label>
                      <textarea disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none min-h-[100px]" value={config.emails} onChange={e => setConfig({...config, emails: e.target.value})} placeholder="email1@empresa.com, email2@empresa.com..."></textarea>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* TAB 4: SEGURIDAD (CONSOLIDADO) */}
        {activeSubTab === 'seguridad' && (
          <div className="animate-in fade-in duration-500">
             <UserRoles 
                departments={departments} 
                logs={logs} 
                roles={roles} 
                setRoles={setRoles} 
                canEdit={canEdit}
             />
          </div>
        )}
      </div>

      {/* BOTÓN GLOBAL DE GUARDADO */}
      <div className="sticky bottom-0 bg-slate-50/90 backdrop-blur-md py-8 border-t border-slate-200 mt-10">
        <button 
          onClick={handleGlobalSave}
          disabled={!canEdit || isSaving}
          className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 hover:bg-slate-800 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-6 h-6" /> Guardar Toda la Configuración
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Config;
