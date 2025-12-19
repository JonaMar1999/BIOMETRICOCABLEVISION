
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, ClipboardList, BarChart3, Fingerprint, LayoutDashboard, 
  ShieldCheck, Settings, LogOut, Search, Bell, AlertTriangle, X, Building2, Menu as MenuIcon
} from 'lucide-react';
import { Employee, AttendanceLog, DashboardStats, User, Role, Department, PERMISSIONS } from './types';
import Dashboard from './components/Dashboard';
import Monitor from './components/Monitor';
import EmployeeManager from './components/EmployeeManager';
import Reports from './components/Reports';
import UserRoles from './components/UserRoles';
import Config from './components/Config';
import Login from './components/Login';
import DepartmentManager from './components/DepartmentManager';

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, enroll_number: '1001', first_name: 'Jonathan', last_name: 'Martinez', department: 'DEP-001', status: 'active', created_at: '2024-01-15', origin_device: 'ZK-T88-MAIN' },
  { id: 2, enroll_number: '1002', first_name: 'Ana', last_name: 'García', department: 'DEP-002', status: 'active', created_at: '2024-02-10', origin_device: 'ZK-T88-MAIN' },
  { id: 3, enroll_number: '1003', first_name: 'Carlos', last_name: 'Ruiz', department: 'DEP-003', status: 'active', created_at: '2024-03-01', origin_device: 'ZK-T88-ENTRY' },
];

// DATA SIMULADA DE ALTA FIDELIDAD (ESCENARIO DE PRUEBA)
const INITIAL_LOGS: AttendanceLog[] = [
  // Jonathan: Jornada Completa (OK)
  { id: 1, enroll_number: '1001', first_name: 'Jonathan', att_time: '2024-05-20T08:00:00', status: 0, device_id: 'ZK-T88-MAIN', department: 'DEP-001' },
  { id: 2, enroll_number: '1001', first_name: 'Jonathan', att_time: '2024-05-20T17:00:00', status: 1, device_id: 'ZK-T88-MAIN', department: 'DEP-001' },
  
  // Ana: Jornada Completa (OK)
  { id: 3, enroll_number: '1002', first_name: 'Ana', att_time: '2024-05-20T08:15:22', status: 0, device_id: 'ZK-T88-MAIN', department: 'DEP-002' },
  { id: 4, enroll_number: '1002', first_name: 'Ana', att_time: '2024-05-20T16:45:10', status: 1, device_id: 'ZK-T88-MAIN', department: 'DEP-002' },

  // Carlos: Jornada Completa (OK)
  { id: 5, enroll_number: '1003', first_name: 'Carlos', att_time: '2024-05-20T08:30:00', status: 0, device_id: 'ZK-T88-ENTRY', department: 'DEP-003' },
  { id: 6, enroll_number: '1003', first_name: 'Carlos', att_time: '2024-05-20T17:30:00', status: 1, device_id: 'ZK-T88-ENTRY', department: 'DEP-003' },
  
  // ID 1014: INCIDENCIA (Solo Entrada, Sin Salida)
  { id: 7, enroll_number: '1014', first_name: '1014', att_time: '2024-05-20T09:15:00', status: 0, device_id: 'ZK-T88-OFFICE', department: 'DEP-001' }, 
];

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'DEP-001', name: 'Sistemas' },
  { id: 'DEP-002', name: 'RRHH' },
  { id: 'DEP-003', name: 'Producción' },
];

const INITIAL_ROLES: Role[] = [
  { 
    id: 'SuperAdmin', 
    name: 'Super Administrador', 
    permissions: PERMISSIONS.map(p => p.id), 
    allowed_departments: ['DEP-001', 'DEP-002', 'DEP-003'], 
    allowed_devices: ['ZK-T88-MAIN', 'ZK-T88-ENTRY', 'ZK-T88-OFFICE'] 
  }
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'employees' | 'reports' | 'config' | 'users' | 'departments'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [logs, setLogs] = useState<AttendanceLog[]>(INITIAL_LOGS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  
  const [currentUser] = useState<User>({ 
    username: 'admin_master', 
    full_name: 'Jonathan Martinez', 
    role: 'SuperAdmin' 
  });

  useEffect(() => {
    const existingEnrollNumbers = new Set(employees.map(e => e.enroll_number));
    const newEmployeesFromLogs: Employee[] = [];

    logs.forEach(log => {
      if (!existingEnrollNumbers.has(log.enroll_number)) {
        newEmployeesFromLogs.push({
          id: Date.now() + Math.random(),
          enroll_number: log.enroll_number,
          first_name: `ID: ${log.enroll_number}`,
          last_name: '(Pendiente de Revisión)',
          department: log.department || 'DEP-001',
          status: 'active',
          created_at: new Date().toISOString(),
          origin_device: log.device_id
        });
        existingEnrollNumbers.add(log.enroll_number);
      }
    });

    if (newEmployeesFromLogs.length > 0) {
      setEmployees(prev => [...prev, ...newEmployeesFromLogs]);
    }
  }, [logs]);

  const userPermissions = useMemo(() => {
    const roleDef = roles.find(r => r.id === currentUser.role);
    return roleDef ? roleDef.permissions : [];
  }, [currentUser, roles]);

  const can = (permission: string) => userPermissions.includes(permission);

  const stats: DashboardStats = useMemo(() => {
    // Calculamos incidencias reales para el dashboard
    const reportData: any[] = [];
    const uniqueEnrolls = Array.from(new Set(logs.map(l => l.enroll_number)));
    const today = new Date().toISOString().split('T')[0];
    
    let incidenceCount = 0;
    uniqueEnrolls.forEach(enroll => {
      const dayLogs = logs.filter(l => l.enroll_number === enroll);
      const hasEntry = dayLogs.some(l => l.status === 0);
      const hasExit = dayLogs.some(l => l.status === 1);
      if (hasEntry && !hasExit) incidenceCount++;
    });

    return {
      total_employees: employees.length,
      today_attendance: logs.length,
      late_arrivals: incidenceCount,
    };
  }, [employees, logs]);

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-['Inter'] overflow-hidden relative">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-80 bg-slate-900 text-white p-8 flex flex-col shadow-2xl z-40 shrink-0
        transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-14 px-2">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500 p-3 rounded-2xl shadow-xl shadow-indigo-900/50"><Fingerprint className="w-8 h-8 text-white" /></div>
            <div><h1 className="text-2xl font-black italic">BioAccess</h1><span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Enterprise</span></div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
          <button onClick={() => handleTabChange('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="font-bold text-sm">Panel</span>
          </button>
          
          {can('view_monitor') && (
            <button onClick={() => handleTabChange('attendance')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'attendance' ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
              <ClipboardList className="w-5 h-5" /> <span className="font-bold text-sm">Monitor</span>
            </button>
          )}

          <button onClick={() => handleTabChange('employees')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'employees' ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
            <Users className="w-5 h-5" /> <span className="font-bold text-sm">Personal</span>
          </button>

          <button onClick={() => handleTabChange('departments')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'departments' ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
            <Building2 className="w-5 h-5" /> <span className="font-bold text-sm">Zonas</span>
          </button>

          {can('view_reports') && (
            <button onClick={() => handleTabChange('reports')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'reports' ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
              <BarChart3 className="w-5 h-5" /> <span className="font-bold text-sm">Reportes</span>
            </button>
          )}

          {can('config_system') && (
            <button onClick={() => handleTabChange('config')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'config' ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
              <Settings className="w-5 h-5" /> <span className="font-bold text-sm">Configuración</span>
            </button>
          )}
        </nav>

        <div className="mt-auto bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-black text-xs text-white shadow-lg shrink-0">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs text-white truncate">{currentUser.full_name}</p>
            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{currentUser.role.toUpperCase()}</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b px-6 md:px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
              BioAccess Enterprise • v4.0
            </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 px-4 py-2 rounded-xl transition-all flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Cerrar Sesión</span>
          </button>
        </header>

        <main className="flex-1 p-6 md:p-14 overflow-y-auto custom-scrollbar">
          {activeTab === 'dashboard' && <Dashboard stats={stats} logs={logs} onNavigate={setActiveTab} onViewAllAttendance={() => setActiveTab('attendance')} />}
          {activeTab === 'attendance' && <Monitor logs={logs} />}
          {activeTab === 'employees' && <EmployeeManager employees={employees} setEmployees={setEmployees} departments={departments} canCreate={can('create_employee')} canEdit={can('edit_employee')} canDelete={can('delete_employee')} />}
          {activeTab === 'departments' && <DepartmentManager departments={departments} setDepartments={setDepartments} canCreate={can('create_dept')} canEdit={can('edit_dept')} canDelete={can('delete_dept')} />}
          {activeTab === 'reports' && <Reports logs={logs} employees={employees} departments={departments} />}
          {activeTab === 'config' && (
            <Config 
              departments={departments} 
              setDepartments={setDepartments} 
              roles={roles} 
              setRoles={setRoles} 
              logs={logs}
              canEdit={can('config_system')} 
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
