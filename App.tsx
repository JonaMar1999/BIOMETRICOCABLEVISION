
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, ClipboardList, BarChart3, Plus, Trash2, Edit, 
  Clock, Calendar, X, LogIn, LogOut, LayoutDashboard,
  ShieldCheck, AlertCircle, TrendingUp, Download, Building2,
  CheckCircle2, Fingerprint
} from 'lucide-react';
import { Employee, AttendanceLog, ReportItem, User, DashboardStats } from './types';

const API_URL = 'http://localhost:8080';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bio_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'employees' | 'reports'>('dashboard');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [stats, setStats] = useState<DashboardStats>({ total_employees: 0, today_attendance: 0, late_arrivals: 0 });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState<Partial<Employee>>({ enroll_number: '', first_name: '', last_name: '', department: '', status: 'active' });

  const [reportFilters, setReportFilters] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    department: '',
    employee_id: '',
    device_id: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUser(data.user);
        localStorage.setItem('bio_user', JSON.stringify(data.user));
      } else {
        alert(data.message);
      }
    } catch (e) { alert("Error de conexión"); }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bio_user');
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard.php`);
      if(res.ok) setStats(await res.json());
    } catch (e) {}
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, logRes] = await Promise.all([
        fetch(`${API_URL}/employees.php`),
        fetch(`${API_URL}/index.php`)
      ]);
      setEmployees(await empRes.json());
      setLogs(await logRes.json());
    } finally { setIsLoading(false); }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    const query = new URLSearchParams(reportFilters).toString();
    const res = await fetch(`${API_URL}/reportes.php?${query}`);
    setReports(await res.json());
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'reports' && user) fetchReports();
  }, [activeTab, reportFilters, user]);

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingEmployee ? 'PUT' : 'POST';
    const res = await fetch(`${API_URL}/employees.php`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingEmployee ? { ...empForm, id: editingEmployee.id } : empForm)
    });
    if (res.ok) {
      setIsEmpModalOpen(false);
      fetchData();
      fetchDashboard();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Empleado', 'Depto', 'Entrada', 'Salida', 'Horas'];
    const rows = reports.map(r => [
      r.date, 
      `"${r.first_name} ${r.last_name}"`, 
      r.department, 
      r.entry_time ? new Date(r.entry_time).toLocaleTimeString() : '--',
      r.exit_time ? new Date(r.exit_time).toLocaleTimeString() : '--',
      r.hours_worked
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_${reportFilters.start}_${reportFilters.end}.csv`;
    link.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-slate-200">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-600 p-5 rounded-[1.5rem] mb-4 shadow-xl shadow-indigo-100">
              <Fingerprint className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">BIOACCESS PRO</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Control de Asistencia</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Usuario</label>
              <input 
                type="text" required 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                onChange={e => setLoginData({...loginData, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Contraseña</label>
              <input 
                type="password" required 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                onChange={e => setLoginData({...loginData, password: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 uppercase text-sm tracking-widest">
              <LogIn className="w-5 h-5" /> Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 text-white p-6 shrink-0 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="bg-indigo-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Fingerprint className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none uppercase">BioAccess</h1>
            <span className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] block mt-1">Enterprise 2.5</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="font-bold text-sm">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
            <ClipboardList className="w-5 h-5" /> <span className="font-bold text-sm">Monitor en Vivo</span>
          </button>
          {user.role !== 'Visualizador' && (
            <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'employees' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <Users className="w-5 h-5" /> <span className="font-bold text-sm">Gestionar Personal</span>
            </button>
          )}
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
            <BarChart3 className="w-5 h-5" /> <span className="font-bold text-sm">Reportes Avanzados</span>
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800/50">
          <div className="flex items-center gap-4 px-2 mb-6 bg-slate-800/30 p-4 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black text-sm shadow-inner">
              {user.full_name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black truncate">{user.full_name}</p>
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{user.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-black text-xs uppercase tracking-widest">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Panel de Control</h2>
                <p className="text-slate-400 font-medium mt-1">Hoy es {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Sincronización Activa</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all flex items-center gap-8 group">
                <div className="bg-indigo-50 p-5 rounded-[1.5rem] text-indigo-600 group-hover:scale-110 transition-transform"><Users className="w-10 h-10" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal Activo</p>
                  <p className="text-5xl font-black text-slate-900 mt-1">{stats.total_employees}</p>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all flex items-center gap-8 group">
                <div className="bg-emerald-50 p-5 rounded-[1.5rem] text-emerald-600 group-hover:scale-110 transition-transform"><CheckCircle2 className="w-10 h-10" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asistencias</p>
                  <p className="text-5xl font-black text-slate-900 mt-1">{stats.today_attendance}</p>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-rose-100/50 transition-all flex items-center gap-8 group">
                <div className="bg-rose-50 p-5 rounded-[1.5rem] text-rose-600 group-hover:scale-110 transition-transform"><AlertCircle className="w-10 h-10" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Retardos</p>
                  <p className="text-5xl font-black text-slate-900 mt-1">{stats.late_arrivals}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-900 rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl shadow-indigo-200">
              <div className="relative z-10 max-w-lg">
                <h3 className="text-3xl font-black mb-4 italic">Ingesta Masiva Biométrica</h3>
                <p className="text-indigo-200 text-lg leading-relaxed">Sincronice miles de registros en segundos. Use el endpoint <code className="bg-indigo-800 px-2 py-1 rounded text-white font-mono">/sync.php</code> enviando un arreglo de objetos JSON.</p>
                <div className="mt-8 flex gap-4">
                  <span className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest">JSON Support</span>
                  <span className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest">Encrypted</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Fingerprint className="w-96 h-96" />
              </div>
            </div>
          </div>
        )}

        {/* Tablas Genéricas */}
        {activeTab !== 'dashboard' && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{activeTab.replace('reports', 'Reportes').replace('attendance', 'Asistencia').replace('employees', 'Personal')}</h2>
                <p className="text-slate-400 font-medium">Gestione los datos maestros y registros del sistema.</p>
              </div>
              <div className="flex gap-4">
                {activeTab === 'employees' && (
                  <button onClick={() => { setEditingEmployee(null); setEmpForm({enroll_number:'', first_name:'', last_name:'', department:'', status:'active'}); setIsEmpModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all uppercase text-xs tracking-widest flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nuevo Registro
                  </button>
                )}
                {activeTab === 'reports' && (
                  <button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all uppercase text-xs tracking-widest flex items-center gap-2">
                    <Download className="w-4 h-4" /> Descargar Excel
                  </button>
                )}
              </div>
            </header>

            {activeTab === 'reports' && (
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-wrap gap-8 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Inicial</label>
                  <input type="date" value={reportFilters.start} onChange={e => setReportFilters({...reportFilters, start:e.target.value})} className="block w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Final</label>
                  <input type="date" value={reportFilters.end} onChange={e => setReportFilters({...reportFilters, end:e.target.value})} className="block w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2 min-w-[200px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departamento</label>
                  <select value={reportFilters.department} onChange={e => setReportFilters({...reportFilters, department:e.target.value})} className="block w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold">
                    <option value="">TODOS</option>
                    {Array.from(new Set(employees.map(e => e.department).filter(Boolean))).map(d => <option key={d} value={d!}>{d}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    {activeTab === 'employees' && (
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enroll ID</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Depto</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                      </tr>
                    )}
                    {activeTab === 'reports' && (
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Día</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Entrada</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Salida</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Horas</th>
                      </tr>
                    )}
                    {activeTab === 'attendance' && (
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tipo</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Biométrico</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeTab === 'employees' && employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 font-mono font-bold text-indigo-600">{emp.enroll_number}</td>
                        <td className="px-8 py-5 font-black text-slate-800">{emp.first_name} {emp.last_name}</td>
                        <td className="px-8 py-5 text-slate-500 font-medium">{emp.department || '--'}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingEmployee(emp); setEmpForm(emp); setIsEmpModalOpen(true); }} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                            <button onClick={async () => { if(confirm('¿Eliminar?')) { await fetch(`${API_URL}/employees.php?id=${emp.id}`, {method:'DELETE'}); fetchData(); fetchDashboard(); } }} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {activeTab === 'reports' && reports.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-slate-500 font-bold">{r.date}</td>
                        <td className="px-8 py-5 font-black text-slate-800">{r.first_name} {r.last_name}</td>
                        <td className="px-8 py-5 text-center font-mono text-emerald-600 font-black">{r.entry_time ? new Date(r.entry_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--'}</td>
                        <td className="px-8 py-5 text-center font-mono text-orange-600 font-black">{r.exit_time ? new Date(r.exit_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--'}</td>
                        <td className="px-8 py-5 text-right"><span className="px-4 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-black text-xs">{r.hours_worked} h</span></td>
                      </tr>
                    ))}
                    {activeTab === 'attendance' && logs.map((l, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-slate-500 font-medium">{new Date(l.att_time).toLocaleString()}</td>
                        <td className="px-8 py-5 font-black text-slate-800">{l.first_name}</td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-3 py-1 rounded-lg font-black text-[10px] ${l.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{l.type}</span>
                        </td>
                        <td className="px-8 py-5 text-right font-mono text-xs text-slate-400">{l.device_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Employee Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 italic">{editingEmployee ? 'Modificar Registro' : 'Alta de Personal'}</h3>
              <button onClick={() => setIsEmpModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveEmployee} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enroll ID</label>
                  <input required disabled={!!editingEmployee} type="text" value={empForm.enroll_number} onChange={e => setEmpForm({...empForm, enroll_number: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                  <select value={empForm.status} onChange={e => setEmpForm({...empForm, status: e.target.value as any})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold">
                    <option value="active">ACTIVO</option>
                    <option value="inactive">BAJA</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre(s)</label>
                <input required type="text" value={empForm.first_name} onChange={e => setEmpForm({...empForm, first_name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellidos</label>
                <input type="text" value={empForm.last_name || ''} onChange={e => setEmpForm({...empForm, last_name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departamento</label>
                <input type="text" value={empForm.department || ''} onChange={e => setEmpForm({...empForm, department: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" placeholder="Sistemas, RRHH, etc." />
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsEmpModalOpen(false)} className="flex-1 px-8 py-5 rounded-2xl font-black text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all uppercase text-xs tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 px-8 py-5 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase text-xs tracking-widest">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
