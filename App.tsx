import React, { useState, useEffect } from 'react';
import { 
  Users, ClipboardList, BarChart3, Plus, Trash2, Edit, 
  Clock, X, LayoutDashboard, AlertCircle, TrendingUp, Download, 
  CheckCircle2, Fingerprint, Calendar, Search, Filter, MoreVertical,
  MapPin, Cpu, Settings, Mail, Building, Upload, FileText, Bell,
  Save, Share2, ShieldCheck, Lock, UserCog, UserPlus, Eye, EyeOff
} from 'lucide-react';
import { Employee, AttendanceLog, ReportItem, DashboardStats, User } from './types';

// DATOS DE PRUEBA (MOCK DATA)
const MOCK_STATS: DashboardStats = {
  total_employees: 48,
  today_attendance: 42,
  late_arrivals: 6
};

const MOCK_USERS: User[] = [
  { username: 'admin_master', full_name: 'Jonathan Martinez', role: 'SuperAdmin' },
  { username: 'ana_rh', full_name: 'Ana García', role: 'RRHH' },
  { username: 'supervisor_01', full_name: 'Roberto Sánchez', role: 'Visualizador' },
];

const MOCK_EMPLOYEES: Employee[] = [
  { id: 1, enroll_number: '1001', first_name: 'Jonathan', last_name: 'Martinez', department: 'Sistemas', status: 'active' },
  { id: 2, enroll_number: '1002', first_name: 'Ana', last_name: 'García', department: 'Recursos Humanos', status: 'active' },
  { id: 3, enroll_number: '1003', first_name: 'Roberto', last_name: 'Sánchez', department: 'Operaciones', status: 'active' },
  { id: 4, enroll_number: '1004', first_name: 'Elena', last_name: 'Pérez', department: 'Ventas', status: 'active' },
  { id: 5, enroll_number: '1005', first_name: 'Ricardo', last_name: 'López', department: 'Sistemas', status: 'active' },
  { id: 6, enroll_number: '1006', first_name: 'Claudia', last_name: 'Torres', department: 'Finanzas', status: 'active' },
];

const MOCK_LOGS: AttendanceLog[] = [
  { enroll_number: '1001', first_name: 'Jonathan Martinez', att_time: new Date().toISOString(), type: 'IN', device_id: 'DEV-01' },
  { enroll_number: '1004', first_name: 'Elena Pérez', att_time: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: 'IN', device_id: 'DEV-01' },
  { enroll_number: '1002', first_name: 'Ana García', att_time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), type: 'IN', device_id: 'DEV-02' },
  { enroll_number: '1003', first_name: 'Roberto Sánchez', att_time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'OUT', device_id: 'DEV-01' },
  { enroll_number: '1005', first_name: 'Ricardo López', att_time: new Date(Date.now() - 1000 * 60 * 180).toISOString(), type: 'IN', device_id: 'DEV-01' },
];

const MOCK_REPORTS: ReportItem[] = [
  { date: '2024-05-20', employee_id: 1, first_name: 'Jonathan', last_name: 'Martinez', department: 'Sistemas', entry_time: '2024-05-20T08:00:00', exit_time: '2024-05-20T17:30:00', hours_worked: 9.5, device_id: 'BIO-ACC-01' },
  { date: '2024-05-20', employee_id: 2, first_name: 'Ana', last_name: 'García', department: 'RRHH', entry_time: '2024-05-20T08:15:00', exit_time: '2024-05-20T17:00:00', hours_worked: 8.75, device_id: 'BIO-ACC-02' },
  { date: '2024-05-19', employee_id: 1, first_name: 'Jonathan', last_name: 'Martinez', department: 'Sistemas', entry_time: '2024-05-19T08:05:00', exit_time: '2024-05-19T17:15:00', hours_worked: 9.1, device_id: 'BIO-ACC-01' },
  { date: '2024-05-19', employee_id: 3, first_name: 'Roberto', last_name: 'Sánchez', department: 'Operaciones', entry_time: '2024-05-19T07:50:00', exit_time: '2024-05-19T18:00:00', hours_worked: 10.1, device_id: 'BIO-ACC-03' },
];

const DEPARTMENTS = ['Todos', 'Sistemas', 'Recursos Humanos', 'Operaciones', 'Ventas', 'Finanzas'];
const DEVICES = ['Todos', 'BIO-ACC-01', 'BIO-ACC-02', 'BIO-ACC-03'];

const PERMISSIONS = [
  { id: 'edit_personal', label: 'Editar Personal / CRUD', roles: ['SuperAdmin', 'RRHH'] },
  { id: 'view_reports', label: 'Ver Reportes Avanzados', roles: ['SuperAdmin', 'RRHH', 'Visualizador'] },
  { id: 'export_data', label: 'Exportar Datos (PDF/CSV)', roles: ['SuperAdmin', 'RRHH'] },
  { id: 'config_system', label: 'Configuración de Sistema / SMTP', roles: ['SuperAdmin'] },
  { id: 'manage_users', label: 'Gestión de Usuarios Administrativos', roles: ['SuperAdmin'] },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'employees' | 'reports' | 'config' | 'users'>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Simulando Admin por defecto
  const [stats] = useState<DashboardStats>(MOCK_STATS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [logs] = useState<AttendanceLog[]>(MOCK_LOGS);
  const [reports] = useState<ReportItem[]>(MOCK_REPORTS);
  const [isLoading, setIsLoading] = useState(false);
  
  // Helpers para permisos
  const can = (permissionId: string) => {
    const perm = PERMISSIONS.find(p => p.id === permissionId);
    return perm ? perm.roles.includes(currentUser.role) : false;
  };

  // States para Configuración
  const [autoReports, setAutoReports] = useState(true);
  const [configForm, setConfigForm] = useState({
    companyName: 'BioAccess Enterprise',
    emails: 'rrhh@empresa.com, admin@empresa.com',
    reportTime: '08:00',
    logo: null as string | null
  });

  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState<Partial<Employee>>({ enroll_number: '', first_name: '', last_name: '', department: '', status: 'active' });

  const [reportFilters, setReportFilters] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    deviceId: 'Todos',
    department: 'Todos',
    search: ''
  });

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!can('edit_personal')) {
      alert("Acceso Denegado: Su rol no permite editar personal.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      if (editingEmployee) {
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? { ...emp, ...empForm } as Employee : emp));
      } else {
        const newEmp: Employee = {
          id: employees.length + 1,
          enroll_number: empForm.enroll_number || '',
          first_name: empForm.first_name || '',
          last_name: empForm.last_name || '',
          department: empForm.department || '',
          status: 'active'
        };
        setEmployees([newEmp, ...employees]);
      }
      setIsLoading(false);
      setIsEmpModalOpen(false);
    }, 500);
  };

  const handleDeleteEmployee = (id: number) => {
    if (!can('edit_personal')) {
      alert("Acceso Denegado: No tiene permisos de eliminación.");
      return;
    }
    if(confirm('¿Está seguro de eliminar a este colaborador?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const exportToCSV = () => alert("Iniciando descarga de reporte CSV...");
  const exportToPDF = () => alert("Generando documento PDF profesional...");
  
  const handleSaveConfig = () => {
    if (!can('config_system')) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Configuración del sistema actualizada correctamente.");
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 text-white p-6 shrink-0 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="bg-indigo-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Fingerprint className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none uppercase">BioAccess</h1>
            <span className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] block mt-1">Enterprise Core</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> <span className="font-bold text-sm">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('attendance')} 
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}
          >
            <ClipboardList className="w-5 h-5" /> <span className="font-bold text-sm">Monitor en Vivo</span>
          </button>
          <button 
            onClick={() => setActiveTab('employees')} 
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'employees' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5" /> <span className="font-bold text-sm">Personal</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5" /> <span className="font-bold text-sm">Reportes</span>
          </button>
          
          <div className="pt-4 border-t border-slate-800/50 mt-4 space-y-2">
            <button 
              onClick={() => setActiveTab('users')} 
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}
            >
              <ShieldCheck className="w-5 h-5" /> <span className="font-bold text-sm">Usuarios y Roles</span>
            </button>
            <button 
              disabled={!can('config_system')}
              onClick={() => setActiveTab('config')} 
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}
            >
              <Settings className="w-5 h-5" /> <span className="font-bold text-sm">Configuración</span>
            </button>
          </div>
        </nav>

        {/* Simulador de Perfil para la Demo */}
        <div className="mt-auto pt-8 border-t border-slate-800/50">
           <div className="bg-slate-800/50 p-4 rounded-2xl mb-4">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Simular Sesión:</label>
              <select 
                value={currentUser.username}
                onChange={(e) => setCurrentUser(MOCK_USERS.find(u => u.username === e.target.value)!)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs font-bold text-indigo-400 outline-none"
              >
                {MOCK_USERS.map(u => <option key={u.username} value={u.username}>{u.full_name} ({u.role})</option>)}
              </select>
           </div>
           <p className="text-[10px] text-slate-500 text-center font-bold tracking-widest uppercase">BioAccess Pro v2.5</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen relative custom-scrollbar">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Panel de Control</h2>
                <p className="text-slate-400 font-medium mt-1">Resumen general de las operaciones de hoy.</p>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-8 group transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
                <div className="bg-indigo-50 p-6 rounded-[1.5rem] text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white"><Users className="w-8 h-8" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal Activo</p>
                  <p className="text-5xl font-black text-slate-900 mt-1">{stats.total_employees}</p>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-8 group transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1">
                <div className="bg-emerald-50 p-6 rounded-[1.5rem] text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white"><CheckCircle2 className="w-8 h-8" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asistencias Hoy</p>
                  <p className="text-5xl font-black text-slate-900 mt-1">{stats.today_attendance}</p>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-8 group transition-all hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-1">
                <div className="bg-rose-50 p-6 rounded-[1.5rem] text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white"><AlertCircle className="w-8 h-8" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Retardos</p>
                  <p className="text-5xl font-black text-slate-900 mt-1">{stats.late_arrivals}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-indigo-900 rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl shadow-indigo-200 h-full flex flex-col justify-center">
                <div className="relative z-10 max-w-lg">
                  <h3 className="text-3xl font-black mb-4 italic">Sincronización Biométrica</h3>
                  <p className="text-indigo-200 text-lg leading-relaxed mb-6">El sistema está listo para recibir datos. El endpoint de ingesta está activo y escuchando peticiones JSON.</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">PostgreSQL 15</span>
                    <span className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">Auto-Sync</span>
                    <span className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">REST API</span>
                  </div>
                </div>
                <div className="absolute -bottom-20 -right-20 p-12 opacity-10 pointer-events-none rotate-12">
                  <Fingerprint className="w-80 h-80" />
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-black text-slate-900 italic flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Últimas Marcas
                  </h4>
                  <button onClick={() => setActiveTab('attendance')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Ver Todo</button>
                </div>
                <div className="space-y-4 flex-1">
                  {logs.slice(0, 4).map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-indigo-100 hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${log.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {log.type}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{log.first_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(log.att_time).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{log.device_id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
             <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Usuarios y Roles</h2>
                  <p className="text-slate-400 font-medium mt-1">Gestione los accesos y niveles de privilegio del sistema.</p>
                </div>
                <button 
                  disabled={!can('manage_users')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all uppercase text-xs tracking-widest flex items-center gap-2 group disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" /> Nuevo Administrador
                </button>
             </header>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
               {/* Tabla de Usuarios */}
               <div className="xl:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                  <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-black text-slate-900 italic">Cuentas Activas</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario / Nombre</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol Asignado</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MOCK_USERS.map((u, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6">
                              <div className="flex flex-col">
                                <span className="font-black text-slate-800 text-sm tracking-tight">{u.full_name}</span>
                                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">@{u.username}</span>
                              </div>
                            </td>
                            <td className="px-10 py-6">
                               <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border ${u.role === 'SuperAdmin' ? 'bg-rose-50 text-rose-600 border-rose-100' : u.role === 'RRHH' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                 {u.role}
                               </span>
                            </td>
                            <td className="px-10 py-6">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">En Línea</span>
                              </span>
                            </td>
                            <td className="px-10 py-6 text-right">
                              <button disabled={!can('manage_users')} className="p-3 text-slate-300 hover:text-indigo-600 transition-colors disabled:opacity-20"><Edit className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>

               {/* Matriz de Permisos */}
               <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
                 <div className="flex items-center gap-4 text-indigo-600 mb-8">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black italic">Configurador de Reglas</h3>
                 </div>
                 
                 <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 border-b border-slate-100 pb-8">
                   Defina qué acciones puede realizar cada rol dentro de la plataforma BioAccess Enterprise.
                 </p>

                 <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {PERMISSIONS.map(perm => (
                      <div key={perm.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all group">
                         <div className="flex items-center justify-between mb-4">
                           <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{perm.label}</span>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {['SuperAdmin', 'RRHH', 'Visualizador'].map(role => (
                              <div 
                                key={role}
                                className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${perm.roles.includes(role) ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-300 border border-slate-200 opacity-50'}`}
                              >
                                {perm.roles.includes(role) ? <Lock className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                                {role}
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="mt-8 pt-8 border-t border-slate-100">
                    <button disabled={!can('manage_users')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-30">
                      <Save className="w-3.5 h-3.5" /> Aplicar Cambios Globales
                    </button>
                 </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            <header>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Configuración del Sistema</h2>
              <p className="text-slate-400 font-medium mt-1">Personalice las preferencias globales y automatizaciones.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Sección Reportes Automáticos */}
              <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 flex flex-col">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4 text-indigo-600">
                     <div className="p-3 bg-indigo-50 rounded-2xl">
                       <Mail className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-black italic">Reportes Automáticos</h3>
                   </div>
                   {/* Switch Personalizado */}
                   <button 
                    onClick={() => setAutoReports(!autoReports)}
                    className={`relative w-14 h-8 transition-all rounded-full border-2 ${autoReports ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-200 border-slate-300'}`}
                   >
                     <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${autoReports ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>
                
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Active el envío diario de reportes en PDF directamente a los correos electrónicos configurados.</p>

                <div className="space-y-6 flex-1">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correos de Destino (Separados por coma)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={configForm.emails}
                        onChange={e => setConfigForm({...configForm, emails: e.target.value})}
                        placeholder="ejemplo@correo.com"
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all" 
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora de Envío</label>
                    <div className="relative">
                      <input 
                        type="time" 
                        value={configForm.reportTime}
                        onChange={e => setConfigForm({...configForm, reportTime: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all" 
                      />
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-3xl flex items-start gap-4">
                   <Bell className="w-5 h-5 text-indigo-500 mt-0.5" />
                   <p className="text-xs text-indigo-600 font-bold leading-relaxed">El sistema enviará el resumen de asistencia de las últimas 24 horas cada día a la hora seleccionada.</p>
                </div>
              </div>

              {/* Sección Empresa */}
              <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 flex flex-col">
                <div className="flex items-center gap-4 text-indigo-600">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <Building className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black italic">Datos de la Empresa</h3>
                </div>

                <div className="space-y-6 flex-1">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                    <input 
                      type="text" 
                      value={configForm.companyName}
                      onChange={e => setConfigForm({...configForm, companyName: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all" 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo del Sistema (PNG/JPG)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Click para subir logo</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSaveConfig}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all hover:bg-indigo-700"
                >
                   <Save className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vistas Estándar (Monitor, Personal, Reportes) */}
        {activeTab !== 'dashboard' && activeTab !== 'config' && activeTab !== 'users' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight capitalize italic">
                  {activeTab === 'reports' ? 'Reportes de Horas' : activeTab === 'attendance' ? 'Monitor Asistencia' : 'Gestión de Personal'}
                </h2>
                <p className="text-slate-400 font-medium mt-1">Administre y visualice los datos del sistema BioAccess.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {activeTab === 'employees' && (
                  <button 
                    disabled={!can('edit_personal')}
                    onClick={() => { setEditingEmployee(null); setEmpForm({enroll_number:'', first_name:'', last_name:'', department:'', status:'active'}); setIsEmpModalOpen(true); }} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all uppercase text-xs tracking-widest flex items-center gap-2 group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Nuevo Colaborador
                  </button>
                )}
                {activeTab === 'reports' && (
                  <div className="flex gap-3">
                    <button 
                      disabled={!can('export_data')}
                      onClick={exportToPDF} 
                      className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 transition-all uppercase text-xs tracking-widest flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <FileText className="w-4 h-4 text-rose-400" /> Exportar PDF
                    </button>
                    <button 
                      disabled={!can('export_data')}
                      onClick={exportToCSV} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 transition-all uppercase text-xs tracking-widest flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" /> Exportar CSV
                    </button>
                  </div>
                )}
              </div>
            </header>

            {activeTab === 'reports' && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end">
                <div className="space-y-3 flex-1 min-w-[180px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Fecha Inicio
                  </label>
                  <input type="date" value={reportFilters.start} onChange={e => setReportFilters({...reportFilters, start:e.target.value})} className="block w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm" />
                </div>
                <div className="space-y-3 flex-1 min-w-[180px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Fecha Fin
                  </label>
                  <input type="date" value={reportFilters.end} onChange={e => setReportFilters({...reportFilters, end:e.target.value})} className="block w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm" />
                </div>
                
                <div className="space-y-3 flex-1 min-w-[180px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Cpu className="w-3 h-3 text-indigo-500" /> Biométrico
                  </label>
                  <select 
                    value={reportFilters.deviceId} 
                    onChange={e => setReportFilters({...reportFilters, deviceId: e.target.value})}
                    className="block w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm appearance-none cursor-pointer"
                  >
                    {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-3 flex-1 min-w-[180px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-indigo-500" /> Depto / Zona
                  </label>
                  <select 
                    value={reportFilters.department} 
                    onChange={e => setReportFilters({...reportFilters, department: e.target.value})}
                    className="block w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm appearance-none cursor-pointer"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-3 flex-1 min-w-[200px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Search className="w-3 h-3" /> Buscar Personal
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Nombre o Apellido..." 
                      value={reportFilters.search}
                      onChange={e => setReportFilters({...reportFilters, search: e.target.value})}
                      className="block w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm pr-10" 
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Procesando información...</p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                      {activeTab === 'employees' && (
                        <tr>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Biométrica</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Departamento</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                      )}
                      {activeTab === 'reports' && (
                        <tr>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Entrada</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Salida</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Dispositivo</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Horas</th>
                        </tr>
                      )}
                      {activeTab === 'attendance' && (
                        <tr>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Real</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empleado</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Dispositivo</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Marca</th>
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeTab === 'employees' && employees.map(emp => (
                        <tr key={emp.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                          <td className="px-10 py-6 font-mono font-bold text-indigo-600 text-sm">{emp.enroll_number}</td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                                {emp.first_name.charAt(0)}{emp.last_name?.charAt(0)}
                              </div>
                              <span className="font-black text-slate-800 text-sm tracking-tight">{emp.first_name} {emp.last_name}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px] uppercase tracking-wider">{emp.department || '--'}</span>
                          </td>
                          <td className="px-10 py-6">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></span>
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Activo</span>
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingEmployee(emp); setEmpForm(emp); setIsEmpModalOpen(true); }} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteEmployee(emp.id)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'reports' && reports.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-slate-600 font-bold text-sm">{new Date(r.date).toLocaleDateString('es-ES')}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                             <span className="font-black text-slate-800 text-sm tracking-tight">{r.first_name} {r.last_name}</span>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{r.department}</p>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="font-mono text-emerald-700 font-black text-sm">{r.entry_time ? new Date(r.entry_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--'}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                              <Clock className="w-3.5 h-3.5 text-orange-500" />
                              <span className="font-mono text-orange-700 font-black text-sm">{r.exit_time ? new Date(r.exit_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--'}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-slate-200">
                                {r.device_id}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <span className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100">{r.hours_worked}h</span>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'attendance' && logs.map((l, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-10 py-6">
                            <div className="flex flex-col">
                              <span className="text-slate-800 font-bold text-sm tracking-tight">{new Date(l.att_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(l.att_time).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 font-mono font-bold text-indigo-600 text-sm">{l.enroll_number}</td>
                          <td className="px-10 py-6 font-black text-slate-800 text-sm">{l.first_name}</td>
                          <td className="px-10 py-6 text-center">
                            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full font-bold text-[10px] uppercase tracking-wider border border-slate-200">{l.device_id}</span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest ${l.type === 'IN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                              {l.type === 'IN' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              MARCA {l.type === 'IN' ? 'ENTRADA' : 'SALIDA'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Employee Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-200">
            <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-slate-900 italic tracking-tight">{editingEmployee ? 'Editar Perfil' : 'Registro de Personal'}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Información Básica del Colaborador</p>
              </div>
              <button onClick={() => setIsEmpModalOpen(false)} className="p-3 text-slate-300 hover:text-slate-900 transition-colors bg-white rounded-2xl border border-slate-100 shadow-sm"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveEmployee} className="p-12 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Fingerprint className="w-3 h-3 text-indigo-500" /> ID Biométrico (Enroll ID)
                </label>
                <input 
                  required 
                  disabled={!!editingEmployee} 
                  type="text" 
                  placeholder="Ej: 1025"
                  value={empForm.enroll_number} 
                  onChange={e => setEmpForm({...empForm, enroll_number: e.target.value})} 
                  className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-lg focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all disabled:opacity-50" 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre(s)</label>
                  <input required type="text" value={empForm.first_name} onChange={e => setEmpForm({...empForm, first_name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Apellidos</label>
                  <input type="text" value={empForm.last_name || ''} onChange={e => setEmpForm({...empForm, last_name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Departamento</label>
                <select 
                  value={empForm.department || ''} 
                  onChange={e => setEmpForm({...empForm, department: e.target.value})}
                  className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Seleccione Departamento</option>
                  {DEPARTMENTS.filter(d => d !== 'Todos').map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsEmpModalOpen(false)} className="flex-1 px-8 py-6 rounded-3xl font-black text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest">Cancelar Operación</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-8 py-6 rounded-3xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all uppercase text-[10px] tracking-widest disabled:opacity-50">
                  {isLoading ? 'Guardando...' : editingEmployee ? 'Actualizar Perfil' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
      `}} />
    </div>
  );
}

export default App;