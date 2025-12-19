
import React, { useState, useMemo } from 'react';
import { Department } from '../types';
import { Building2, Plus, Edit2, Trash2, X, Search, Layers, Check, ShieldAlert } from 'lucide-react';

interface DepartmentManagerProps {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const DepartmentManager: React.FC<DepartmentManagerProps> = ({ departments, setDepartments, canCreate, canEdit, canDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? { ...d, name: formData.name } : d));
    } else {
      setDepartments(prev => [...prev, { id: `DEP-${prev.length + 1}`, name: formData.name }]);
    }
    closeModal();
  };

  const closeModal = () => { setIsModalOpen(false); setEditingDept(null); setFormData({ name: '' }); };

  const filtered = departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Zonas</h2>
          <p className="text-slate-500 font-medium text-sm">Estructura organizacional del sistema.</p>
        </div>
        {canCreate && (
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">
            <Plus className="w-5 h-5" /> Nueva Zona
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Filtrar áreas..." className="flex-1 outline-none text-sm font-bold text-slate-700 bg-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="bg-indigo-900 p-5 rounded-2xl text-white flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase text-indigo-300">Total</p><p className="text-2xl font-black italic">{departments.length}</p></div>
          <Layers className="w-6 h-6 opacity-30" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Área</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/50">
                  <td className="px-8 py-5 font-mono text-[11px] font-black text-slate-400">{dept.id}</td>
                  <td className="px-8 py-5 font-bold text-slate-800 text-sm">{dept.name}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => { setEditingDept(dept); setFormData({name: dept.name}); setIsModalOpen(true); }} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      {canDelete && <button onClick={() => setConfirmDeleteId(dept.id)} className="p-2 text-rose-300 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
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
              <h3 className="text-xl font-black italic">Ajustar Área</h3>
              <button onClick={closeModal}><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
              <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nombre</label><input required type="text" className="w-full bg-slate-50 border rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none" value={formData.name} onChange={e => setFormData({name: e.target.value})} /></div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3"><Check className="w-5 h-5" /> Confirmar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;
