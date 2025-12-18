
import React, { useState, useMemo } from 'react';
import { 
  Users, ClipboardList, BarChart3, Fingerprint, LayoutDashboard, 
  ShieldCheck, Settings, LogOut, Search, Bell, AlertTriangle, X
} from 'lucide-react';
import { Employee, AttendanceLog, DashboardStats, User, Role } from './types';
import Dashboard from './components/Dashboard';
import Monitor from './components/Monitor';
import EmployeeManager from './components/EmployeeManager';
import Reports from './components/Reports';
import UserRoles from './components/UserRoles';
import Config from './components/Config';
import Login from './components/Login';

// --- FUENTE DE VERDAD: MOCK DATA INICIAL ---
const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, enroll_number: '1001', first_name: 'Jonathan', last_name: 'Martinez', department: 'Sistemas', status: 'active', created_at: '2024-01-15' },
  { id: 2, enroll_number: '1002', first_name: 'Ana', last_name: 'García', department: 'RRHH', status: 'active', created_at: '2024-02-10' },
  { id: 3, enroll_number: '1003', first_name: 'Carlos', last_name: 'Ruiz', department: 'Operaciones', status: 'active', created_at: '2024-03-01' },
  { id: 4, enroll_number: '1004', first_name: 'Elena', last_name: 'Pérez', department: 'Administración', status: 'active', created_at: '2024-03-12' },
  { id: 5, enroll_number: '1005', first_name: 'Marcos', last_name: 'Solis', department: 'Sistemas', status: 'active', created_at: '2024-04-05' },
];

const INITIAL_LOGS: AttendanceLog[] = [
  { id: 1, enroll_number: '1001', first_name: 'Jonathan', att_time: '2024-05-20T08:05:22', status: 0, device_id: 'ZK-T88-MAIN', department: 'Sistemas' },
  { id: 2, enroll_number: '1002', first_name: 'Ana', att_time: '2024-05-20T08:12:10', status: 0, device_id: 'ZK-T88-MAIN', department: 'RRHH' },
  { id: 3, enroll_number: '1003', first_name: 'Carlos', att_time: '2024-05-20T08:15:45', status: 0, device_id: 'ZK-F22-LAB', department: 'Operaciones' },
  { id: 4, enroll_number: '1001', first_name: 'Jonathan', att_time: '2024-05-20T13:02:11', status: 1, device_id: 'ZK-T88-MAIN', department: 'Sistemas' },
  { id: 5, enroll_number: '1004', first_name: 'Elena', att_time: '2024-05-20T14:10:00', status: 0, device_id: 'ZK-T88-MAIN', department: 'Administración' },
  { id: 6, enroll_number: '1005', first_name: 'Marcos', att_time: '2024-05-21T08:02:00', status: 0, device_id: 'ZK-F22-LAB', department: 'Sistemas' },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'employees' | 'reports' | 'config' | 'users'>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Estados centralizados para simular base de datos
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [logs, setLogs] = useState<AttendanceLog[]>(INITIAL_LOGS);
  const [currentUser] = useState<User>({ username: 'admin_master', full_name: 'Jonathan Martinez', role: 'SuperAdmin' });

  // Estadísticas calculadas en tiempo real
  const stats: DashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total_employees: employees.length,
      today_attendance: logs.filter(l => l.att_time.startsWith(today) || l.att_time.startsWith('2024-05-20')).length,
      late_arrivals: logs.filter(l => l.status === 0 && l.att_time.split('T')[1] > "08:00:00").length,
    };
  }, [employees, logs]);

  // Lógica de Alertas Recientes para el Panel de Notificaciones
  const alerts = useMemo(() => {
    return logs
      .filter(l => l.status === 0 && l.att_time.split('T')[1] > "08:00:00")
      .slice(-5)
      .reverse();
  }, [logs]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard'); // Reset tab on logout
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden font-['Inter'] animate-in fade-in duration-700">
      {/* SIDEBAR DE NAVEGACIÓN PROFESIONAL */}
      <aside className="w-full md:w-80 bg-slate-900 text-white p-8 shrink-0 flex flex-col shadow-2xl z-20 overflow-y-auto transition-all">
        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="bg-indigo-500 p-3 rounded-2xl shadow-xl shadow-indigo-900/50">
            <Fingerprint className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none uppercase italic">BioAccess</h1>
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] block mt-1">Enterprise Core</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-6">Main Menu</div>
          
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="font-bold text-sm">Panel General</span>
          </button>
          
          <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
            <ClipboardList className="w-5 h-5" /> <span className="font-bold text-sm">Monitor Live</span>
          </button>

          <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'employees' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5" /> <span className="font-bold text-sm">Personal</span>
          </button>

          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
            <BarChart3 className="w-5 h-5" /> <span className="font-bold text-sm">Reportes</span>
          </button>
          
          <div className="pt-8 border-t border-slate-800/50 mt-8 space-y-2">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-6">Administration</div>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <ShieldCheck className="w-5 h-5" /> <span className="font-bold text-sm">Usuarios y Roles</span>
            </button>
            <button onClick={() => setActiveTab('config')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <Settings className="w-5 h-5" /> <span className="font-bold text-sm">Configuración</span>
            </button>
          </div>
        </nav>

        <div className="mt-auto pt-8">
           <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-black text-xs shadow-lg">
                {currentUser.full_name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs truncate">{currentUser.full_name}</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{currentUser.role}</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hover:bg-rose-500/10 rounded-xl transition-all"
            >
             <LogOut className="w-3 h-3" /> Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 bg-slate-50 px-6 py-2.5 rounded-2xl border border-slate-100 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar en el sistema..." className="bg-transparent outline-none text-xs font-bold text-slate-600 w-full" />
          </div>
          <div className="flex items-center gap-6">
            
            {/* BOTÓN CAMPANA Y PANEL DE NOTIFICACIONES */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-xl transition-all ${isNotificationsOpen ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
              >
                <Bell className="w-6 h-6" />
                {alerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-black italic text-slate-900 uppercase tracking-tight">Alertas Recientes</h3>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{alerts.length} Críticas</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                    {alerts.map((alert, i) => (
                      <div key={i} className="p-4 rounded-2xl hover:bg-slate-50 transition-colors flex gap-4 items-start group">
                        <div className="mt-1 p-2 bg-rose-50 text-rose-500 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 tracking-tight leading-tight">{alert.first_name} tiene un retardo detectado</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                            Entrada: {new Date(alert.att_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <div className="p-10 text-center space-y-3 opacity-20">
                        <Bell className="w-8 h-8 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Sin notificaciones nuevas</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                     <button onClick={() => setIsNotificationsOpen(false)} className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">Cerrar Panel</button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biometric Engine</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-900 uppercase">Mock Mode Ready</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-10 md:p-14 overflow-y-auto custom-scrollbar">
          {activeTab === 'dashboard' && (
            <Dashboard 
              stats={stats} 
              logs={logs} 
              onViewAllAttendance={() => setActiveTab('attendance')} 
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'attendance' && <Monitor logs={logs} />}
          {activeTab === 'employees' && (
            <EmployeeManager 
              employees={employees} 
              setEmployees={setEmployees} 
            />
          )}
          {activeTab === 'reports' && (
            <Reports 
              logs={logs} 
              employees={employees} 
            />
          )}
          {activeTab === 'users' && <UserRoles />}
          {activeTab === 'config' && <Config />}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default App;
