
import React, { useState } from 'react';
import { Employee, Department } from '../types';
import { 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Search, 
  UserPlus, 
  ShieldAlert, 
  AlertCircle, 
  RefreshCw, 
  Cpu, 
  Tag, 
  UserCheck,
  Edit as EditIcon, 
  RefreshCw as RefreshIcon, 
  Cpu as DeviceIcon 
} from 'lucide-react';

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
    }
    closeModal();
  };

  const closeModal = () => { 
    setIsModalOpen(false); 
    setEditingEmployee(null); 
    setFormData({ enroll_number: '', first_name: '', last_name: '', department: '' }); 
  };

  const filtered = employees.filter(e => 
    e.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    e.enroll_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic leading-none">Limpieza de Personal</h2>
          <p className="text-slate-500 font-medium text-sm mt-2">Corrija nombres provenientes del SDK ZK.</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-600 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-sm">
          <RefreshIcon className="w-4 h-4 animate-spin-slow" /> Integración SDK v4.0 OK
        </div>
      </header>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
        <Search className="w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Buscar por ID o Nombre (ej: Ricardo, 39)..." className="flex-1 outline-none text-sm font-bold text-slate-700 bg-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Enroll (Mestro)</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado / Nombre</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Apellido</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origen Hardware</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => {
                // LOGICA: Si el apellido está vacío o contiene puntos/barras del SDK, es "Pendiente de Limpieza"
                const isDirty = !emp.last_name || emp.first_name.includes('.') || emp.first_name.includes('/') || emp.last_name.includes('Revisión');
                
                return (
                  <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${isDirty ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">{emp.enroll_number}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        {isDirty ? (
                          <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter">
                            <AlertCircle className="w-3 h-3" /> Pendiente
                          </div>
                        ) : (
                          <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-md"><UserCheck className="w-3.5 h-3.5" /></div>
                        )}
                        <span className={`font-bold text-sm ${isDirty ? 'text-amber-700 italic' : 'text-slate-800'}`}>{emp.first_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-sm text-slate-700">
                      {emp.last_name || '--'}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                        <DeviceIcon className="w-3.5 h-3.5" />
                        {emp.origin_device || 'Sincronización SDK'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { 
                            setEditingEmployee(emp); 
                            setFormData({ 
                              enroll_number: emp.enroll_number, 
                              first_name: emp.first_name, 
                              last_name: emp.last_name === '(Pendiente de Revisión)' ? '' : (emp.last_name || ''), 
                              department: emp.department 
                            }); 
                            setIsModalOpen(true); 
                          }} 
                          className={`p-2 rounded-xl flex items-center gap-2 transition-all ${isDirty ? 'bg-amber-600 text-white shadow-lg' : 'text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <EditIcon className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-tighter">{isDirty ? 'Limpiar Ahora' : 'Editar'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-[95%] sm:w-full sm:max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black italic tracking-tight">Curación de Datos</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Procedencia: {editingEmployee?.origin_device || 'ZK SDK'}</p>
              </div>
              <button onClick={closeModal} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* ID ENROLL: REGLA DE ORO - SOLO LECTURA */}
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ID Enroll Maestro (Constante)</label>
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                </div>
                <input 
                  disabled 
                  type="text" 
                  className="w-full bg-slate-200 border-none rounded-xl px-4 py-3 outline-none font-black text-slate-500 text-sm cursor-not-allowed" 
                  value={formData.enroll_number} 
                />
                <p className="text-[9px] text-rose-400 mt-3 font-bold leading-tight uppercase italic">* Este ID no es editable para no romper el historial de la API.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block ml-2">Nombre Limpio</label>
                  <input required type="text" placeholder="Ej: Jonathan" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 outline-none font-bold text-sm focus:border-indigo-500 transition-all shadow-inner" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block ml-2">Apellido Limpio</label>
                  <input required type="text" placeholder="Ej: Martinez" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 outline-none font-bold text-sm focus:border-indigo-500 transition-all shadow-inner" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block ml-2">Zona Asignada</label>
                  <select required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 outline-none font-bold text-sm focus:border-indigo-500 transition-all appearance-none cursor-pointer" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                    <option value="">- Seleccionar Área -</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Save className="w-5 h-5" /> Aplicar Limpieza
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
