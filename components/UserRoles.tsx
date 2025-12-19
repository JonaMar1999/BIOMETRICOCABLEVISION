
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, UserPlus, Trash2, Key, CheckSquare, Square, X, 
  Save, Edit2, Building2, Cpu, AlertTriangle, CheckCircle2,
  Fingerprint, ShieldAlert, UserCog, Lock
} from 'lucide-react';
import { Role, User, PERMISSIONS, Department, AttendanceLog } from '../types';

interface UserRolesProps {
  departments: Department[];
  logs: AttendanceLog[];
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  canEdit: boolean;
}

const UserRoles: React.FC<UserRolesProps> = ({ departments, logs, roles, setRoles, canEdit }) => {
  const [users, setUsers] = useState<User[]>([
    { username: 'admin_master', full_name: 'Jonathan Martinez', role: 'SuperAdmin' },
    { username: 'ana_rh', full_name: 'Ana García', role: 'RRHH' }
  ]);

  const [isRoleModal, setIsRoleModal] = useState(false);
  const [isUserModal, setIsUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{type: 'usuario' | 'rol', id: string, name: string} | null>(null);
  
  const [roleFormData, setRoleFormData] = useState<Role>({ id: '', name: '', permissions: [], allowed_departments: [], allowed_devices: [] });
  const [userFormData, setUserFormData] = useState<User>({ username: '', full_name: '', role: 'RRHH' });

  const availableDevices = useMemo(() => Array.from(new Set(logs.map(l => l.device_id).filter(Boolean))), [logs]);

  const toggleSelection = (field: 'permissions' | 'allowed_departments' | 'allowed_devices', val: string) => {
    if (!canEdit) return;
    setRoleFormData(prev => {
      const current = (prev[field] as string[]) || [];
      return { ...prev, [field]: current.includes(val) ? current.filter(i => i !== val) : [...current, val] };
    });
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (editingRole) {
      setRoles(prev => prev.map(r => r.id === editingRole.id ? roleFormData : r));
    } else {
      setRoles(prev => [...prev, { ...roleFormData, id: roleFormData.name.replace(/\s+/g, '-').toUpperCase() }]);
    }
    setIsRoleModal(false);
    setEditingRole(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (editingUser) {
      setUsers(prev => prev.map(u => u.username === editingUser.username ? userFormData : u));
    } else {
      const username = userFormData.username || userFormData.full_name.toLowerCase().replace(/\s+/g, '_');
      setUsers(prev => [...prev, { ...userFormData, username }]);
    }
    setIsUserModal(false);
    setEditingUser(null);
  };

  const executeDeletion = () => {
    if (!confirmDelete || !canEdit) return;
    if (confirmDelete.type === 'usuario') setUsers(prev => prev.filter(u => u.username !== confirmDelete.id));
    else setRoles(prev => prev.filter(r => r.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ROLES */}
        <div className="bg-slate-50/50 p-8 rounded-[3rem] border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black italic flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-500" /> Matriz de Roles</h3>
            {canEdit && <button onClick={() => { setEditingRole(null); setRoleFormData({id:'', name:'', permissions:[], allowed_departments:[], allowed_devices:[]}); setIsRoleModal(true); }} className="px-4 py-2 bg-slate-900 text-[9px] font-black text-white uppercase tracking-widest rounded-xl hover:bg-slate-800">Nuevo Rol</button>}
          </div>
          <div className="space-y-4">
            {roles.map(role => (
              <div key={role.id} className="p-5 bg-white rounded-[1.5rem] border border-slate-100 flex items-center justify-between group transition-all">
                <div>
                  <p className="font-black text-slate-800 italic text-sm">{role.name}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase">{role.permissions.length} Permisos • {role.allowed_departments?.length || 0} Zonas</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingRole(role); setRoleFormData({...role}); setIsRoleModal(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  {canEdit && <button onClick={() => setConfirmDelete({type: 'rol', id: role.id, name: role.name})} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OPERADORES */}
        <div className="bg-slate-50/50 p-8 rounded-[3rem] border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black italic flex items-center gap-2"><UserCog className="w-5 h-5 text-indigo-500" /> Operadores</h3>
            {canEdit && <button onClick={() => { setEditingUser(null); setUserFormData({ username: '', full_name: '', role: 'RRHH' }); setIsUserModal(true); }} className="px-4 py-2 bg-indigo-600 text-[9px] font-black text-white uppercase tracking-widest rounded-xl hover:bg-indigo-700">Nuevo Usuario</button>}
          </div>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.username} className="p-5 bg-white rounded-[1.5rem] border border-slate-100 flex items-center justify-between group transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs">{user.full_name.charAt(0)}</div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{user.full_name}</p>
                    <span className="text-[9px] font-black text-indigo-400 uppercase">{user.role}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => { setEditingUser(user); setUserFormData({...user}); setIsUserModal(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl"><Edit2 className="w-4 h-4" /></button>
                   {canEdit && <button onClick={() => setConfirmDelete({type: 'usuario', id: user.username, name: user.full_name})} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONFIRMACIÓN ELIMINAR */}
      {confirmDelete && canEdit && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white max-w-sm w-full rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><ShieldAlert className="w-10 h-10" /></div>
              <h4 className="text-xl font-black italic mb-2">¿Eliminar Registro?</h4>
              <p className="text-sm text-slate-500 font-medium mb-8">Esta acción para <span className="text-slate-900 font-black">"{confirmDelete.name}"</span> es irreversible.</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setConfirmDelete(null)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Cancelar</button>
                 <button onClick={executeDeletion} className="py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs">Confirmar</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL ARQUITECTO DE ROLES */}
      {isRoleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500 rounded-2xl"><ShieldCheck className="w-6 h-6" /></div>
                <h3 className="text-xl font-black italic">{editingRole ? 'Editar Privilegios' : 'Configurar Nuevo Rol'}</h3>
              </div>
              <button onClick={() => setIsRoleModal(false)} className="hover:rotate-90 transition-transform p-2 bg-white/10 rounded-full"><X /></button>
            </div>
            
            <form onSubmit={handleSaveRole} className="p-10 space-y-12">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Nombre del Rol</label>
                  <input required disabled={!canEdit} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold text-slate-700"
                    value={roleFormData.name} onChange={e => setRoleFormData({...roleFormData, name: e.target.value})} />
               </div>

               {/* PERMISOS DE ACCESO */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-indigo-500" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acceso a Módulos</span></div>
                  <div className="grid grid-cols-2 gap-3">
                    {PERMISSIONS.filter(p => p.group === 'ACCESO').map(p => (
                      <button key={p.id} type="button" onClick={() => toggleSelection('permissions', p.id)}
                        className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${roleFormData.permissions.includes(p.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        {roleFormData.permissions.includes(p.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        <span className="text-xs font-bold">{p.label}</span>
                      </button>
                    ))}
                  </div>
               </div>

               {/* PERMISOS CRUD */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2"><Edit2 className="w-4 h-4 text-orange-500" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permisos CRUD</span></div>
                  <div className="bg-slate-50 p-6 rounded-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PERMISSIONS.filter(p => p.group === 'ACCIÓN CRUD').map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-slate-500">{p.label}</span>
                        <button type="button" onClick={() => toggleSelection('permissions', p.id)} className={`w-10 h-6 rounded-full transition-colors relative ${roleFormData.permissions.includes(p.id) ? 'bg-orange-500' : 'bg-slate-200'}`}>
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${roleFormData.permissions.includes(p.id) ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
               </div>

               {/* TERRITORIO */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2"><Building2 className="w-4 h-4 text-emerald-500" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Segmentación Territorial</span></div>
                  <div className="flex flex-wrap gap-2">
                    {departments.map(dept => (
                      <button key={dept.id} type="button" onClick={() => toggleSelection('allowed_departments', dept.id)}
                        className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase flex items-center gap-2 transition-all ${roleFormData.allowed_departments?.includes(dept.id) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        {dept.name} {roleFormData.allowed_departments?.includes(dept.id) && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                      </button>
                    ))}
                  </div>
               </div>

               {canEdit && <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Confirmar Arquitectura del Rol</button>}
            </form>
          </div>
        </div>
      )}

      {/* MODAL USUARIO */}
      {isUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black italic">{editingUser ? 'Editar Administrador' : 'Nuevo Administrador'}</h3>
              <button onClick={() => { setIsUserModal(false); setEditingUser(null); }} className="hover:rotate-90 transition-transform p-2 bg-white/10 rounded-full"><X /></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-10 space-y-6">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre Completo</label>
                  <input required disabled={!canEdit} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold text-slate-700"
                    value={userFormData.full_name} onChange={e => setUserFormData({...userFormData, full_name: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rol Asignado</label>
                  <select disabled={!canEdit} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 appearance-none italic tracking-widest cursor-pointer"
                    value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})}>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
               </div>
               {canEdit && <button type="submit" className="w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2"><Save className="w-4 h-4" /> {editingUser ? 'Actualizar Ficha' : 'Activar Operador'}</button>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles;
