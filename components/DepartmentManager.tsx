
import React, { useState, useMemo } from 'react';
import { Department } from '../types';
import { 
  Building2, Plus, Edit2, Trash2, X, Search, 
  Layers, MapPin, Hash, Check 
} from 'lucide-react';

interface DepartmentManagerProps {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
}

const DepartmentManager: React.FC<DepartmentManagerProps> = ({ departments, setDepartments }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica para generar el próximo ID profesional
  const nextId = useMemo(() => {
    if (editingDept) return editingDept.id;
    
    const ids = departments
      .map(d => parseInt(d.id.split('-')[1] || '0'))
      .filter(id => !isNaN(id));
      
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const nextNum = maxId + 1;
    return `DEP-${nextNum.toString().padStart(3, '0')}`;
  }, [departments, editingDept]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      setDepartments(prev => prev.map(d => 
        d.id === editingDept.id ? { ...d, name: formData.name } : d
      ));
    } else {
      const newDept: Department = {
        id: nextId,
        name: formData.name
      };
      setDepartments(prev => [...prev, newDept]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setFormData({ name: '' });
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ name: dept.name });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(`¿Eliminar el departamento "${id}"? Esta acción podría afectar a los empleados asignados.`)) {
      setDepartments(prev => prev.filter(d => d.id !== id));
    }
  };

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Gestión de Departamentos</h2>
          <p className="text-slate-500 font-medium">Define las áreas operativas para segmentar la asistencia y reportes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nuevo Departamento
        </button>
      </header>

      {/* BARRA DE BÚSQUEDA Y KPI RÁPIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 group focus-within:border-indigo-500 transition-all">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500" />
          <input 
            type="text" 
            placeholder="Filtrar por nombre o identificador..." 
            className="flex-1 outline-none text-sm font-bold text-slate-700 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-indigo-900 p-6 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-indigo-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Total Áreas</p>
            <p className="text-3xl font-black italic">{departments.length}</p>
          </div>
          <Layers className="w-8 h-8 opacity-20" />
        </div>
      </div>

      {/* TABLA DE DEPARTAMENTOS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identificador / ID</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nombre del Área</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((dept) => (
              <tr key={dept.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      <Hash className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-widest">{dept.id}</span>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-800 text-lg">{dept.name}</p>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => handleEdit(dept)}
                      className="p-3 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(dept.id)}
                      className="p-3 hover:bg-rose-50 text-rose-300 hover:text-rose-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-10 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Building2 className="w-16 h-16" />
                    <p className="text-sm font-black uppercase tracking-widest">No se encontraron departamentos</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL PARA CREAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black italic">{editingDept ? 'Editar Departamento' : 'Nuevo Departamento'}</h3>
              </div>
              <button onClick={closeModal} className="hover:rotate-90 transition-transform p-2 bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Identificador del Área</label>
                  <div className="relative group">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      disabled
                      type="text" 
                      className="w-full bg-slate-100 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 outline-none font-black text-indigo-400 tracking-widest cursor-not-allowed opacity-70" 
                      value={nextId} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nombre Descriptivo</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      required 
                      type="text" 
                      placeholder="Ej: Logística, Gerencia..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 transition-colors font-bold text-slate-700" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      autoFocus
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95">
                <Check className="w-5 h-5" /> {editingDept ? 'Actualizar Área' : 'Registrar Área'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;
