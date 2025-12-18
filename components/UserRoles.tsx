
import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Trash2, Key, CheckSquare, Square, X, Save, Edit2 } from 'lucide-react';
import { Role, User, PERMISSIONS } from '../types';

const UserRoles: React.FC = () => {
  // --- ESTADOS ---
  const [roles, setRoles] = useState<Role[]>([
    { id: 'SuperAdmin', name: 'Super Administrador', permissions: PERMISSIONS.map(p => p.id) },
    { id: 'RRHH', name: 'Recursos Humanos', permissions: ['view_monitor', 'view_reports', 'edit_personal'] }
  ]);
  const [users, setUsers] = useState<User[]>([
    { username: 'admin_master', full_name: 'Jonathan Martinez', role: 'SuperAdmin' },
    { username: 'ana_rh', full_name: 'Ana García', role: 'RRHH' }
  ]);

  // Modales y Edición
  const [isRoleModal, setIsRoleModal] = useState(false);
  const [isUserModal, setIsUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Formularios
  const [newRole, setNewRole] = useState({ name: '', permissions: [] as string[] });
  const [userFormData, setUserFormData] = useState<User>({ username: '', full_name: '', role: 'RRHH' });

  // --- LÓGICA DE USUARIOS ---
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({ ...user });
    setIsUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      // Actualizar usuario existente
      setUsers(prev => prev.map(u => u.username === editingUser.username ? userFormData : u));
    } else {
      // Crear nuevo usuario (evitar duplicados de username)
      if (users.find(u => u.username === userFormData.username)) {
        alert("El nombre de usuario ya existe.");
        return;
      }
      setUsers(prev => [...prev, userFormData]);
    }
    closeUserModal();
  };

  const handleDeleteUser = (username: string) => {
    if (confirm(`¿Estás seguro de eliminar al administrador ${username}?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  const closeUserModal = () => {
    setIsUserModal(false);
    setEditingUser(null);
    setUserFormData({ username: '', full_name: '', role: 'RRHH' });
  };

  // --- LÓGICA DE ROLES ---
  const togglePermission = (pid: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(pid) 
        ? prev.permissions.filter(id => id !== pid)
        : [...prev.permissions, pid]
    }));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Usuarios y Roles</h2>
        <p className="text-slate-500 font-medium">Control granular de accesos al sistema administrativo.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gestión de Roles */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black italic flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" /> Roles Definidos
            </h3>
            <button 
              onClick={() => setIsRoleModal(true)} 
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              Crear Nuevo Rol
            </button>
          </div>
          <div className="space-y-4">
            {roles.map(role => (
              <div key={role.id} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group transition-all hover:bg-white hover:shadow-md">
                <div>
                  <p className="font-bold text-slate-800">{role.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{role.permissions.length} Permisos asignados</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-indigo-50 text-indigo-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-rose-50 text-rose-300 hover:text-rose-600 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gestión de Usuarios */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black italic flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-500" /> Administradores
            </h3>
            <button 
              onClick={() => { setEditingUser(null); setIsUserModal(true); }}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              Agregar Usuario
            </button>
          </div>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.username} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group transition-all hover:bg-white hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{user.full_name}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{user.role}</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                       <span className="text-[9px] font-bold text-slate-400 italic">@{user.username}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditUser(user)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteUser(user.username)} className="p-2 hover:bg-rose-50 text-rose-300 hover:text-rose-600 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: GESTIONAR USUARIO (EDITAR/CREAR) */}
      {isUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black italic">{editingUser ? 'Editar Administrador' : 'Nuevo Administrador'}</h3>
              <button onClick={closeUserModal} className="hover:rotate-90 transition-transform"><X /></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-6">
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre Completo</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-colors font-bold text-slate-700"
                      value={userFormData.full_name} onChange={e => setUserFormData({...userFormData, full_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre de Usuario (ID)</label>
                    <input required disabled={!!editingUser} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-colors font-bold text-slate-700 disabled:opacity-50"
                      value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Rol de Acceso</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-colors font-bold text-slate-700 cursor-pointer"
                      value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})}>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
               </div>
               <button type="submit" className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3">
                  <Save className="w-4 h-4" /> {editingUser ? 'Actualizar Datos' : 'Registrar Administrador'}
               </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GESTIONAR ROL */}
      {isRoleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black italic">Creador de Roles Personalizados</h3>
              <button onClick={() => setIsRoleModal(false)} className="hover:rotate-90 transition-transform"><X /></button>
            </div>
            <div className="p-8 space-y-6">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre del Rol</label>
                  <input type="text" placeholder="Ej: Supervisor de Zona" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold text-slate-700"
                    value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Permisos del Sistema</label>
                  <div className="grid grid-cols-2 gap-3">
                    {PERMISSIONS.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => togglePermission(p.id)}
                        className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${newRole.permissions.includes(p.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                      >
                        {newRole.permissions.includes(p.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        <span className="text-xs font-bold">{p.label}</span>
                      </button>
                    ))}
                  </div>
               </div>
               <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsRoleModal(false)} className="flex-1 border border-slate-200 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Cancelar</button>
                  <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-colors">Crear Rol</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles;
