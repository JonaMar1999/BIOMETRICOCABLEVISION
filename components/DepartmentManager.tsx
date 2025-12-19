
import React, { useState, useMemo } from 'react';
import { Department } from '../types';
import { 
  Building2, Plus, Edit2, Trash2, X, Search, 
  Layers, MapPin, Hash, Check, ShieldAlert, AlertCircle 
} from 'lucide-react';

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

  const nextId = useMemo(() => {
    if (editingDept) return editingDept.id;
    const ids = departments.map(d => parseInt(d.id.split('-')[1] || '0')).filter(id => !isNaN(id));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return `DEP-${(maxId + 1).toString().padStart(3, '0')}`;
  }, [departments, editingDept]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? { ...d, name: formData.name } : d));
    } else {
      setDepartments(prev => [...prev, { id: nextId, name: formData.name }]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setFormData({ name: '' });
  };

  const handleDeleteConfirmed = () => {
    if (confirmDeleteId) {
      setDepartments(prev => prev.filter(d => d.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Estructura Organizacional</h2>
          <p className="text-slate-500 font-medium">Define las áreas operativas para segmentar la asistencia.</p>
        </div>
        {canCreate ? (
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100">
            <Plus className="w-5 h-5" /> Nueva Zona
          </button>
        ) : (
          <div className="bg-slate-100 text-slate-400 px-6 py-4 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest border border-slate-200 cursor-not-allowed">
            <ShieldAlert className="w-4 h-4" /> Sólo Lectura
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Filtrar por nombre o identificador..." className="flex-1 outline-none text-sm font-bold text-slate-700 bg-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="bg-indigo-900 p-6 rounded-[2rem] text-white flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase text-indigo-300">Total Áreas</p><p className="text-3xl font-black italic">{departments.length}</p></div>
          <Layers className="w-8 h-8 opacity-20" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Área / Departamento</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((dept) => (
              <tr key={dept.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-6 font-mono text-[11px] font-black text-slate-400">{dept.id}</td>
                <td className="px-10 py-6 font-bold text-slate-800">{dept.name}</td>
                <td className="px-10 py-6">
                  <div className="flex items-center justify-center gap-3">
                    {canEdit ? (
                      <button onClick={() => { setEditingDept(dept); setFormData({name: dept.name}); setIsModalOpen(true); }} className="p-3 hover:bg-indigo-50 text-indigo-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Edit2 className="w-5 h-5" /></button>
                    ) : (
                      <div className="p-3 text-slate-100"><Edit2 className="w-5 h-5" /></div>
                    )}
                    {canDelete ? (
                      <button onClick={() => setConfirmDeleteId(dept.id)} className="p-3 hover:bg-rose-50 text-rose-300 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5" /></button>
                    ) : (
                      <div className="p-3 text-slate-100"><Trash2 className="w-5 h-5" /></div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ALERTA ELIMINAR */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white max-w-sm w-full rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in">
             <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-8 h-8" /></div>
             <h4 className="text-xl font-black italic mb-2">¿Eliminar Zona?</h4>
             <p className="text-xs text-slate-500 font-medium mb-8 leading-relaxed">Esta acción afectará la segmentación de reportes para todos los empleados asignados a <span className="font-black text-slate-900">"{confirmDeleteId}"</span>.</p>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setConfirmDeleteId(null)} className="py-3 bg-slate-100 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                <button onClick={handleDeleteConfirmed} className="py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-100">Eliminar</button>
             </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black italic">{editingDept ? 'Ajustar Área' : 'Nueva Estructura'}</h3>
              <button onClick={closeModal} className="hover:rotate-90 transition-transform"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">ID Sistema</label><input disabled type="text" className="w-full bg-slate-100 border rounded-2xl px-6 py-4 font-black text-indigo-400" value={nextId} /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nombre Descriptivo</label><input required type="text" className="w-full bg-slate-50 border rounded-2xl px-6 py-4 font-bold text-slate-700 focus:border-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({name: e.target.value})} autoFocus /></div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3">
                <Check className="w-5 h-5" /> {editingDept ? 'Actualizar' : 'Registrar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;
