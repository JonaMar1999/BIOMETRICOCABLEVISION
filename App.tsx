import React, { useState, useEffect } from 'react';
import { 
  Users, ClipboardList, BarChart3, Plus, Trash2, Edit, 
  Clock, X, LayoutDashboard, AlertCircle, TrendingUp, Download, 
  CheckCircle2, Fingerprint, Calendar, Search, Filter, MoreVertical
} from 'lucide-react';
import { Employee, AttendanceLog, ReportItem, DashboardStats } from './types';

// DATOS DE PRUEBA (MOCK DATA)
const MOCK_STATS: DashboardStats = {
  total_employees: 48,
  today_attendance: 42,
  late_arrivals: 6
};

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
  { date: '2024-05-20', employee_id: 1, first_name: 'Jonathan', last_name: 'Martinez', department: 'Sistemas', entry_time: '2024-05-20T08:00:00', exit_time: '2024-05-20T17:30:00', hours_worked: 9.5, device_id: 'DEV-01' },
  { date: '2024-05-20', employee_id: 2, first_name: 'Ana', last_name: 'García', department: 'RRHH', entry_time: '2024-05-20T08:15:00', exit_time: '2024-05-20T17:00:00', hours_worked: 8.75, device_id: 'DEV-01' },
  { date: '2024-05-19', employee_id: 1, first_name: 'Jonathan', last_name: 'Martinez', department: 'Sistemas', entry_time: '2024-05-19T08:05:00', exit_time: '2024-05-19T17:15:00', hours_worked: 9.1, device_id: 'DEV-01' },
  { date: '2024-05-19', employee_id: 3, first_name: 'Roberto', last_name: 'Sánchez', department: 'Operaciones', entry_time: '2024-05-19T07:50:00', exit_time: '2024-05-19T18:00:00', hours_worked: 10.1, device_id: 'DEV-01' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'employees' | 'reports'>('dashboard');
  const [stats] = useState<DashboardStats>(MOCK_STATS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [logs] = useState<AttendanceLog[]>(MOCK_LOGS);
  const [reports] = useState<ReportItem[]>(MOCK_REPORTS);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState<Partial<Employee>>({ enroll_number: '', first_name: '', last_name: '', department: '', status: 'active' });

  const [reportFilters, setReportFilters] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulación de guardado
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
    if(confirm('¿Está seguro de eliminar a este colaborador?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const exportToCSV = () => {
    alert("Iniciando descarga de reporte CSV...");
    // Simulación de exportación
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
            <Users className="w-5 h-5" /> <span className="font-bold text-sm">Gestionar Personal</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5" /> <span className="font-bold text-sm">Reportes Avanzados</span>
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800/50">
           <div className="bg-slate-800/50 p-4 rounded-2xl mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistema Online</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Servidor: local_docker_instance</p>
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

        {activeTab !== 'dashboard' && (
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
                    onClick={() => { setEditingEmployee(null); setEmpForm({enroll_number:'', first_name:'', last_name:'', department:'', status:'active'}); setIsEmpModalOpen(true); }} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all uppercase text-xs tracking-widest flex items-center gap-2 group"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Nuevo Colaborador
                  </button>
                )}
                {activeTab === 'reports' && (
                  <button 
                    onClick={exportToCSV} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 transition-all uppercase text-xs tracking-widest flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Exportar a CSV
                  </button>
                )}
              </div>
            </header>

            {activeTab === 'reports' && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap gap-8 items-end">
                <div className="space-y-3 flex-1 min-w-[200px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Fecha Inicio
                  </label>
                  <input type="date" value={reportFilters.start} onChange={e => setReportFilters({...reportFilters, start:e.target.value})} className="block w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                </div>
                <div className="space-y-3 flex-1 min-w-[200px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Fecha Fin
                  </label>
                  <input type="date" value={reportFilters.end} onChange={e => setReportFilters({...reportFilters, end:e.target.value})} className="block w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                </div>
                <div className="space-y-3 flex-1 min-w-[200px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Search className="w-3 h-3" /> Búsqueda
                  </label>
                  <div className="relative">
                    <input type="text" placeholder="Filtrar por nombre..." className="block w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
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
                              <button onClick={() => { setEditingEmployee(emp); setEmpForm(emp); setIsEmpModalOpen(true); }} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteEmployee(emp.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'reports' && reports.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-slate-600 font-bold text-sm">{new Date(r.date).toLocaleDateString('es-ES')}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                             <span className="font-black text-slate-800 text-sm">{r.first_name} {r.last_name}</span>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{r.department}</p>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="font-mono text-emerald-700 font-black text-sm">{r.entry_time ? new Date(r.entry_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--'}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl">
                              <Clock className="w-3.5 h-3.5 text-orange-500" />
                              <span className="font-mono text-orange-700 font-black text-sm">{r.exit_time ? new Date(r.exit_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--'}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <span className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100">{r.hours_worked} horas</span>
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
                            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full font-bold text-[10px] uppercase tracking-wider">{l.device_id}</span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest ${l.type === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
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
                <input type="text" value={empForm.department || ''} onChange={e => setEmpForm({...empForm, department: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all" placeholder="Ej: Operaciones, Administración..." />
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
      `}} />
    </div>
  );
}

export default App;