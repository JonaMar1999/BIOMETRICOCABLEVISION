
import React, { useState } from 'react';
import { Employee, Department } from '../types';
import { Edit, Trash2, X, Save, Search, UserPlus, ShieldAlert, AlertCircle } from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  departments: Department[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, setEmployees, departments, canCreate, canEdit, canDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ enroll_number: '', first_name: '', last_name: '', department: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...emp, ...formData } : emp));
    } else {
      setEmployees(prev => [...prev, { id: Date.now(), ...formData, status: 'active', created_at: new Date().toISOString() }]);
    }
    closeModal();
  };

  const closeModal = () => { setIsModalOpen(false); setEditingEmployee(null); setFormData({ enroll_number: '', first_name: '', last_name: '', department: '' }); };

  const filtered = employees.filter(e => 
    e.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    e.enroll_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Personal</h2>
          <p className="text-slate-500 font-medium text-sm">Administra los usuarios en los biométricos.</p>
        </div>
        {canCreate ? (
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100">
            <UserPlus className="w-4 h-4" /> Registrar Nuevo
          </button>
        ) : (
          <div className="bg-slate-100 text-slate-400 px-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase border border-slate-200 italic">
            <ShieldAlert className="w-4 h-4" /> Lectura
          </div>
        )}
      </header>

      <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
        <Search className="w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Buscar personal..." className="flex-1 outline-none text-sm font-bold text-slate-700 bg-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Enroll</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Apellido</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zona</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs font-black text-indigo-600">{emp.enroll_number}</td>
                  <td className="px-8 py-5 font-bold text-slate-800 text-sm">{emp.first_name}</td>
                  <td className="px-8 py-5 font-bold text-slate-800 text-sm">{emp.last_name || '--'}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase">{departments.find(d => d.id === emp.department)?.name || emp.department}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditingEmployee(emp); setFormData({ enroll_number: emp.enroll_number, first_name: emp.first_name, last_name: emp.last_name || '', department: emp.department }); setIsModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                      {canDelete && <button onClick={() => setConfirmDeleteId(emp.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-[95%] sm:w-full sm:max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 md:p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black italic">{editingEmployee ? 'Ficha' : 'Nuevo'}</h3>
              <button onClick={closeModal}><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">ID</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold text-sm focus:border-indigo-500 transition-all" value={formData.enroll_number} onChange={e => setFormData({...formData, enroll_number: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nombre</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold text-sm focus:border-indigo-500 transition-all" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Apellido</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold text-sm focus:border-indigo-500 transition-all" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Zona</label>
                  <select required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold text-sm focus:border-indigo-500 transition-all appearance-none cursor-pointer" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                    <option value="">- Seleccionar -</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all">
                <Save className="w-4 h-4" /> Confirmar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black italic mb-2">¿Eliminar Empleado?</h4>
            <p className="text-sm text-slate-500 font-medium mb-8">Esta acción eliminará permanentemente al personal seleccionado del sistema.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setConfirmDeleteId(null)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-all">Cancelar</button>
              <button onClick={() => { setEmployees(prev => prev.filter(e => e.id !== confirmDeleteId)); setConfirmDeleteId(null); }} className="py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-rose-700 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
