
import React, { useState } from 'react';
import { Employee, Department } from '../types';
import { Edit, Trash2, X, Save, Search, UserPlus } from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  departments: Department[];
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, setEmployees, departments }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ enroll_number: '', first_name: '', last_name: '', department: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id ? { ...emp, ...formData } : emp
      ));
    } else {
      const newEmp: Employee = {
        id: Date.now(),
        ...formData,
        status: 'active',
        created_at: new Date().toISOString()
      };
      setEmployees(prev => [...prev, newEmp]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({ enroll_number: '', first_name: '', last_name: '', department: '' });
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ enroll_number: emp.enroll_number, first_name: emp.first_name, last_name: emp.last_name || '', department: emp.department });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar este empleado? Esta acción no se puede deshacer.')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const filtered = employees.filter(e => 
    e.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.enroll_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Gestión de Personal</h2>
          <p className="text-slate-500 font-medium">Administra los usuarios autorizados en los dispositivos biométricos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
        >
          <UserPlus className="w-4 h-4" /> Registrar Nuevo
        </button>
      </header>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o enroll ID..." 
          className="flex-1 outline-none text-sm font-bold text-slate-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enroll ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nombre Completo</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Departamento</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha Registro</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5 font-mono text-xs font-black text-indigo-600">{emp.enroll_number}</td>
                <td className="px-8 py-5">
                  <p className="font-bold text-slate-800">{emp.first_name} {emp.last_name}</p>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">{emp.department}</span>
                </td>
                <td className="px-8 py-5 text-xs text-slate-400 font-bold">{new Date(emp.created_at).toLocaleDateString()}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(emp)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(emp.id)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black italic">{editingEmployee ? 'Editar Empleado' : 'Nuevo Registro'}</h3>
              <button onClick={closeModal} className="hover:rotate-90 transition-transform"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Enroll ID</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors font-bold" 
                    value={formData.enroll_number} onChange={e => setFormData({...formData, enroll_number: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombres</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors font-bold" 
                    value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Apellidos</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors font-bold" 
                    value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Departamento</label>
                  <select required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors font-bold cursor-pointer" 
                    value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {editingEmployee ? 'Actualizar' : 'Guardar Empleado'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
