
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, UserPlus, Trash2, Key, CheckSquare, Square, X, 
  Save, Edit2, Building2, Cpu, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { Role, User, PERMISSIONS, Department, AttendanceLog } from '../types';

interface UserRolesProps {
  departments: Department[];
  logs: AttendanceLog[];
}

const UserRoles: React.FC<UserRolesProps> = ({ departments, logs }) => {
  // --- ESTADOS ---
  const [roles, setRoles] = useState<Role[]>([
    { id: 'SuperAdmin', name: 'Super Administrador', permissions: PERMISSIONS.map(p => p.id), allowed_departments: departments.map(d => d.id), allowed_devices: ['ZK-T88-MAIN', 'ZK-F22-LAB'] },
    { id: 'RRHH', name: 'Recursos Humanos', permissions: ['view_monitor', 'view_reports', 'edit_personal'], allowed_departments: ['DEP-002'], allowed_devices: ['ZK-T88-MAIN'] }
  ]);
  const [users, setUsers] = useState<User[]>([
    { username: 'admin_master', full_name: 'Jonathan Martinez', role: 'SuperAdmin' },
    { username: 'ana_rh', full_name: 'Ana García', role: 'RRHH' }
  ]);

  // Modales y Alertas
  const [isRoleModal, setIsRoleModal] = useState(false);
  const [isUserModal, setIsUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{type: 'user' | 'role', id: string} | null>(null);
  
  // Formularios
  const [roleFormData, setRoleFormData] = useState<Role>({ 
    id: '', 
    name: '', 
    permissions: [], 
    allowed_departments: [], 
    allowed_devices: [] 
  });
  const [userFormData, setUserFormData] = useState<User>({ username: '', full_name: '', role: 'RRHH' });

  // Lista única de dispositivos
  const availableDevices = useMemo(() => {
    const devices = logs.map(l => l.device_id).filter(id => id);
    return Array.from(new Set(devices));
  }, [logs]);

  // --- LÓGICA DE USUARIOS ---
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({ ...user });
    setIsUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(prev => prev.map(u => u.username === editingUser.username ? userFormData : u));
    } else {
      if (users.find(u => u.username === userFormData.username)) {
        alert("El nombre de usuario ya existe.");
        return;
      }
      setUsers(prev => [...prev, userFormData]);
    }
    closeUserModal();
  };

  const closeUserModal = () => {
    setIsUserModal(false);
    setEditingUser(null);
    setUserFormData({ username: '', full_name: '', role: 'RRHH' });
  };

  // --- LÓGICA DE ROLES ---
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({ ...role });
    setIsRoleModal(true);
  };

  const togglePermission = (pid: string) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(pid) 
        ? prev.permissions.filter(id => id !== pid)
        : [...prev.permissions, pid]
    }));
  };

  const toggleDeptAccess = (did: string) => {
    setRoleFormData(prev => ({
      ...prev,
      allowed_departments: (prev.allowed_departments || []).includes(did)
        ? prev.allowed_departments?.filter(id => id !== did)
        : [...(prev.allowed_departments || []), did]
    }));
  };

  const toggleDeviceAccess = (devId: string) => {
    setRoleFormData(prev => ({
      ...prev,
      allowed_devices: (prev.allowed_devices || []).includes(devId)
        ? prev.allowed_devices?.filter(id => id !== devId)
        : [...(prev.allowed_devices || []), devId]
    }));
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      setRoles(prev => prev.map(r => r.id === editingRole.id ? roleFormData : r));
    } else {
      const newId = roleFormData.name.replace(/\s+/g, '');
      setRoles(prev => [...prev, { ...roleFormData, id: newId }]);
    }
    setIsRoleModal(false);
    setEditingRole(null);
    setRoleFormData({ id: '', name: '', permissions: [], allowed_departments: [], allowed_devices: [] });
  };

  const handleDeleteConfirmed = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'user') {
      setUsers(prev => prev.filter(u => u.username !== confirmDelete.id));
    } else {
      setRoles(prev => prev.filter(r => r.id !== confirmDelete.id));
    }
    setConfirmDelete(null);
  };

  const getRoleBadgeColor = (roleId: string) => {
    switch (roleId) {
      case 'SuperAdmin': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'RRHH': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-indigo-100 text-indigo-600 border-indigo-200';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Usuarios y Roles</h2>
        <p className="text-slate-500 font-medium">Control de accesos segmentado por acción, zona y equipo.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sección de Roles */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black italic flex items-center gap-2 text-slate-800">
              <ShieldCheck className="w-5 h-5 text-indigo-500" /> Matriz de Privilegios
            </h3>
            <button 
              onClick={() => { setEditingRole(null); setIsRoleModal(true); }} 
              className="px-4 py-2 bg-slate-50 text-[10px] font-black text-indigo-600 uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all border border-slate-100 shadow-sm"
            >
              Nuevo Rol
            </button>
          </div>
          <div className="space-y-4">
            {roles.map(role => (
              <div key={role.id} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group transition-all hover:bg-white hover:shadow-xl hover:border-indigo-100">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-800 italic">{role.name}</p>
                    <span className="px-2 py-0.5 bg-slate-200 text-[8px] font-black uppercase text-slate-500 rounded">{role.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{role.permissions.length} Acciones</p>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">{role.allowed_departments?.length || 0} Deptos</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button onClick={() => handleEditRole(role)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmDelete({type: 'role', id: role.id})} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección de Usuarios */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black italic flex items-center gap-2 text-slate-800">
              <UserPlus className="w-5 h-5 text-indigo-500" /> Administradores Activos
            </h3>
            <button 
              onClick={() => { setEditingUser(null); setIsUserModal(true); }}
              className="px-4 py-2 bg-slate-900 text-[10px] font-black text-white uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-100"
            >
              Agregar Usuario
            </button>
          </div>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.username} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group transition-all hover:bg-white hover:shadow-xl hover:border-indigo-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-100 transition-transform group-hover:rotate-6">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm leading-none">{user.full_name}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <span className={`px-2 py-0.5 border text-[8px] font-black uppercase tracking-wider rounded-md ${getRoleBadgeColor(user.role)}`}>
                         {user.role}
                       </span>
                       <span className="text-[9px] font-bold text-slate-400 italic">@{user.username}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button onClick={() => handleEditUser(user)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl shadow-sm transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmDelete({type: 'user', id: user.username})} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 rounded-xl shadow-sm transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: ALERTA DE CONFIRMACIÓN ESTÉTICA */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white max-w-sm w-full rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <AlertTriangle className="w-10 h-10 animate-bounce" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2 italic">¿Está seguro?</h4>
              <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
                Esta acción eliminará permanentemente al {confirmDelete.type === 'user' ? 'usuario' : 'rol'} <span className="text-slate-900 font-black">"{confirmDelete.id}"</span>. Esta operación no se puede revertir.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setConfirmDelete(null)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
                 <button onClick={handleDeleteConfirmed} className="py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all">Confirmar</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: GESTIONAR ROL (CON SEGMENTACIÓN) */}
      {isRoleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500 rounded-2xl"><ShieldCheck className="w-6 h-6" /></div>
                <h3 className="text-xl font-black italic">{editingRole ? 'Editar Configuración del Rol' : 'Arquitecto de Roles'}</h3>
              </div>
              <button onClick={() => setIsRoleModal(false)} className="hover:rotate-90 transition-transform p-2 bg-white/10 rounded-full"><X /></button>
            </div>
            <form onSubmit={handleSaveRole} className="p-10 space-y-10">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Nombre Descriptivo</label>
                  <input required type="text" placeholder="Ej: Gerente de Operaciones" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold text-slate-700 focus:border-indigo-500 transition-all"
                    value={roleFormData.name} onChange={e => setRoleFormData({...roleFormData, name: e.target.value})} />
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacidades del Sistema (Acciones)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERMISSIONS.map(p => (
                      <button 
                        key={p.id} type="button"
                        onClick={() => togglePermission(p.id)}
                        className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${roleFormData.permissions.includes(p.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-inner translate-x-1' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                      >
                        {roleFormData.permissions.includes(p.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        <span className="text-xs font-bold">{p.label}</span>
                      </button>
                    ))}
                  </div>
               </div>

               {/* SEGMENTACIÓN POR DEPARTAMENTO */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Segmentación Territorial (Zonas/Deptos)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {departments.map(dept => (
                      <button 
                        key={dept.id} type="button"
                        onClick={() => toggleDeptAccess(dept.id)}
                        className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all ${roleFormData.allowed_departments?.includes(dept.id) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                      >
                        <span className="truncate mr-2">{dept.name}</span>
                        {roleFormData.allowed_departments?.includes(dept.id) && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                      </button>
                    ))}
                  </div>
               </div>

               {/* SEGMENTACIÓN POR BIOMÉTRICO */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Segmentación de Equipos (Biométricos)</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableDevices.map(devId => (
                      <button 
                        key={devId} type="button"
                        onClick={() => toggleDeviceAccess(devId)}
                        className={`px-4 py-2 rounded-lg border text-[10px] font-black uppercase flex items-center gap-2 transition-all ${roleFormData.allowed_devices?.includes(devId) ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                      >
                        <Cpu className="w-3 h-3" />
                        {devId}
                      </button>
                    ))}
                    {availableDevices.length === 0 && <p className="text-[10px] font-bold text-slate-300 italic">No hay equipos registrados en el monitor.</p>}
                  </div>
               </div>

               <div className="flex gap-4 pt-6 sticky bottom-0 bg-white/90 backdrop-blur-sm py-4 border-t">
                  <button type="button" onClick={() => setIsRoleModal(false)} className="flex-1 border border-slate-200 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Descartar</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-colors">
                    {editingRole ? 'Actualizar Rol' : 'Grabar Privilegios'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GESTIONAR USUARIO */}
      {isUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black italic">{editingUser ? 'Ficha de Administrador' : 'Nuevo Registro Administrativo'}</h3>
              <button onClick={closeUserModal} className="hover:rotate-90 transition-transform p-2 bg-white/10 rounded-full"><X /></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-10 space-y-6">
               <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Nombre Completo</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
                      value={userFormData.full_name} onChange={e => setUserFormData({...userFormData, full_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Nombre de Usuario (ID Sistema)</label>
                    <input required disabled={!!editingUser} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Rol Asignado</label>
                    <div className="relative">
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-black text-slate-700 cursor-pointer appearance-none uppercase text-xs italic tracking-widest"
                        value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})}>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                    </div>
                  </div>
               </div>
               <button type="submit" className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 mt-4 hover:scale-[1.02] active:scale-95 transition-all">
                  <Save className="w-4 h-4" /> {editingUser ? 'Guardar Cambios' : 'Activar Usuario'}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles;
