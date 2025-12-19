
import React, { useState, useMemo } from 'react';
import { 
  Users, ClipboardList, BarChart3, Fingerprint, LayoutDashboard, 
  ShieldCheck, Settings, LogOut, Search, Bell, AlertTriangle, X, Building2
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
  { id: 1, enroll_number: '1001', first_name: 'Jonathan', last_name: 'Martinez', department: 'DEP-001', status: 'active', created_at: '2024-01-15' },
  { id: 2, enroll_number: '1002', first_name: 'Ana', last_name: 'García', department: 'DEP-002', status: 'active', created_at: '2024-02-10' },
  { id: 3, enroll_number: '1003', first_name: 'Carlos', last_name: 'Ruiz', department: 'DEP-003', status: 'active', created_at: '2024-03-01' },
];

const INITIAL_LOGS: AttendanceLog[] = [
  { id: 1, enroll_number: '1001', first_name: 'Jonathan', att_time: '2024-05-20T08:05:22', status: 0, device_id: 'ZK-T88-MAIN', department: 'DEP-001' },
  { id: 2, enroll_number: '1002', first_name: 'Ana', att_time: '2024-05-20T08:12:10', status: 0, device_id: 'ZK-T88-MAIN', department: 'DEP-002' },
];

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'DEP-001', name: 'Sistemas' },
  { id: 'DEP-002', name: 'RRHH' },
];

const INITIAL_ROLES: Role[] = [
  { 
    id: 'SuperAdmin', 
    name: 'Super Administrador', 
    permissions: PERMISSIONS.map(p => p.id), 
    allowed_departments: ['DEP-001', 'DEP-002'], 
    allowed_devices: ['ZK-T88-MAIN'] 
  },
  { 
    id: 'RRHH', 
    name: 'Recursos Humanos', 
    permissions: ['view_reports', 'create_employee', 'edit_employee'], 
    allowed_departments: ['DEP-002'], 
    allowed_devices: ['ZK-T88-MAIN'] 
  }
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'employees' | 'reports' | 'config' | 'users' | 'departments'>('dashboard');
  
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [logs, setLogs] = useState<AttendanceLog[]>(INITIAL_LOGS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  
  // RESTAURACIÓN: Jonathan Martinez como Super Administrador
  const [currentUser] = useState<User>({ 
    username: 'admin_master', 
    full_name: 'Jonathan Martinez', 
    role: 'SuperAdmin' 
  });

  // --- Lógica de Permisos Activos ---
  const userPermissions = useMemo(() => {
    const roleDef = roles.find(r => r.id === currentUser.role);
    return roleDef ? roleDef.permissions : [];
  }, [currentUser, roles]);

  const can = (permission: string) => userPermissions.includes(permission);

  const stats: DashboardStats = useMemo(() => ({
    total_employees: employees.length,
    today_attendance: logs.length,
    late_arrivals: 2,
  }), [employees, logs]);

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen flex bg-slate-50 font-['Inter'] overflow-hidden">
      <aside className="w-80 bg-slate-900 text-white p-8 flex flex-col shadow-2xl z-20 shrink-0">
        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="bg-indigo-500 p-3 rounded-2xl shadow-xl shadow-indigo-900/50"><Fingerprint className="w-8 h-8 text-white" /></div>
          <div><h1 className="text-2xl font-black italic">BioAccess</h1><span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Enterprise</span></div>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="font-bold text-sm">Panel</span>
          </button>
          
          {can('view_monitor') && (
            <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'attendance' ? 'bg-indigo-600 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>
              <ClipboardList className="w-5 h-5" /> <span className="font-bold text-sm">Monitor</span>
            </button>
          )}

          <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'employees' ? 'bg-indigo-600 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>
            <Users className="w-5 h-5" /> <span className="font-bold text-sm">Personal</span>
          </button>

          <button onClick={() => setActiveTab('departments')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'departments' ? 'bg-indigo-600 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>
            <Building2 className="w-5 h-5" /> <span className="font-bold text-sm">Zonas</span>
          </button>

          {can('view_reports') && (
            <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'reports' ? 'bg-indigo-600 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>
              <BarChart3 className="w-5 h-5" /> <span className="font-bold text-sm">Reportes</span>
            </button>
          )}

          {/* Restaurado acceso a Configuración */}
          {can('config_system') && (
            <button onClick={() => setActiveTab('config')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'config' ? 'bg-indigo-600 shadow-xl' : 'text-slate-500 hover:bg-slate-800'}`}>
              <Settings className="w-5 h-5" /> <span className="font-bold text-sm">Configuración</span>
            </button>
          )}
        </nav>

        {/* Badge de Identidad: Jonathan Martinez */}
        <div className="mt-auto bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-black text-xs text-white shadow-lg">
            {currentUser.full_name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-xs text-white">{currentUser.full_name}</p>
            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{currentUser.role.toUpperCase()}</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b px-10 flex items-center justify-between shrink-0">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {activeTab === 'config' ? 'Módulo Maestro de Configuración' : 'Arquitectura BioAccess • Control Total'}
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 px-4 py-2 rounded-xl transition-all"><LogOut className="w-3 h-3 inline mr-2" /> Salir</button>
        </header>

        <main className="flex-1 p-14 overflow-y-auto custom-scrollbar">
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
