
import React, { useState, useMemo } from 'react';
import { AttendanceLog, Employee, Department } from '../types';
import { 
  Calendar, Users, Building2, FileText, AlertCircle, CheckCircle2, 
  Clock, Eye, X, MapPin, ChevronDown, Check, Cpu, Search, 
  Download, History, TrendingUp, AlertTriangle
} from 'lucide-react';

interface ReportsProps {
  logs: AttendanceLog[];
  employees: Employee[];
  departments: Department[];
}

const Reports: React.FC<ReportsProps> = ({ logs, employees, departments }) => {
  const [filters, setFilters] = useState({
    start: '2024-05-20',
    end: '2024-05-20',
    device: 'all',
    department: 'all',
    search: ''
  });

  const [activeView, setActiveView] = useState<'all' | 'ok' | 'incidences'>('all');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [historyModal, setHistoryModal] = useState<{ isOpen: boolean; data: AttendanceLog[] | null; name: string; date: string }>({
    isOpen: false,
    data: null,
    name: '',
    date: ''
  });

  const availableDevices = useMemo(() => {
    const devices = logs.map(l => l.device_id).filter(Boolean);
    return Array.from(new Set(devices));
  }, [logs]);

  // PROCESAMIENTO DE DATOS MAESTROS (Cálculo de Jornadas)
  const masterData = useMemo(() => {
    const data: any[] = [];
    const startDate = new Date(filters.start + 'T00:00:00');
    const endDate = new Date(filters.end + 'T23:59:59');
    
    // 1. Filtrar empleados base
    const auditedEmployees = employees.filter(emp => {
      const matchesDept = filters.department === 'all' || emp.department === filters.department;
      const fullName = `${emp.first_name} ${emp.last_name || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(filters.search.toLowerCase()) || emp.enroll_number.includes(filters.search);
      const matchesMulti = selectedEmployees.length === 0 || selectedEmployees.includes(emp.enroll_number);
      return matchesDept && matchesSearch && matchesMulti;
    });

    // 2. Iterar por rango de fechas
    let currentDay = new Date(startDate);
    while (currentDay <= endDate) {
      const dateStr = currentDay.toISOString().split('T')[0];
      
      auditedEmployees.forEach(emp => {
        let dayLogs = logs.filter(l => l.enroll_number === emp.enroll_number && l.att_time.startsWith(dateStr));
        
        if (filters.device !== 'all') {
          dayLogs = dayLogs.filter(l => l.device_id === filters.device);
        }

        // Si estamos filtrando por dispositivo y no hay marcas, saltamos
        if (filters.device !== 'all' && dayLogs.length === 0) return;
        // Si no hay marcas en general para este empleado este día, solo lo mostramos si el rango es un solo día
        if (dayLogs.length === 0 && filters.start !== filters.end) return;

        const entryLog = dayLogs.find(l => l.status === 0);
        const exitLog = dayLogs.slice().reverse().find(l => l.status === 1);

        const entry = entryLog?.att_time || null;
        const exit = exitLog?.att_time || null;
        
        let hours = 0;
        if (entry && exit) {
          const diff = (new Date(exit).getTime() - new Date(entry).getTime()) / (1000 * 60 * 60);
          hours = Math.max(0, parseFloat(diff.toFixed(2)));
        }

        data.push({
          date: dateStr,
          enroll: emp.enroll_number,
          name: emp.first_name,
          lastName: emp.last_name,
          deptId: emp.department,
          device: dayLogs[0]?.device_id || 'ZK-T88-MAIN',
          in: entry,
          out: exit,
          total: hours,
          allLogs: dayLogs
        });
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }
    return data;
  }, [logs, employees, filters, selectedEmployees]);

  // KPIs CON LÓGICA DE UNICIDAD (DISTINCT) Y ACUMULADOS
  const stats = useMemo(() => {
    // Conteo de personas únicas en el set de datos actual
    const uniquePersons = new Set(masterData.map(d => d.enroll));
    
    // Asistencias OK (Personas únicas que tienen al menos un registro completo en el periodo)
    const okPersons = new Set(masterData.filter(d => d.in && d.out).map(d => d.enroll));
    
    // Incidencias (Personas únicas que tienen al menos una marca incompleta en el periodo)
    const incidencePersons = new Set(masterData.filter(d => !d.in || !d.out).map(d => d.enroll));
    
    // Horas acumuladas totales de los registros visibles
    const totalHours = masterData.reduce((acc, curr) => acc + curr.total, 0);

    return { 
      total: uniquePersons.size, 
      complete: okPersons.size, 
      incidences: incidencePersons.size,
      accumulatedHours: totalHours.toFixed(1)
    };
  }, [masterData]);

  // DATA FILTRADA PARA LA TABLA SEGÚN LA TARJETA SELECCIONADA
  const tableData = useMemo(() => {
    let result = [...masterData];
    if (activeView === 'ok') {
      result = result.filter(item => item.in && item.out);
    } else if (activeView === 'incidences') {
      result = result.filter(item => !item.in || !item.out);
    }
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [masterData, activeView]);

  const toggleEmployee = (enroll: string) => {
    setSelectedEmployees(prev => 
      prev.includes(enroll) ? prev.filter(e => e !== enroll) : [...prev, enroll]
    );
  };

  const openHistory = (row: any) => {
    setHistoryModal({
      isOpen: true,
      data: row.allLogs,
      name: `${row.name} ${row.lastName === '(Pendiente de Revisión)' ? '' : (row.lastName || '')}`,
      date: row.date
    });
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Reportes de Auditoría</h2>
          <p className="text-slate-500 font-medium text-sm italic">Cómputo de horas y validación de marcas SDK.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="bg-rose-500 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 shadow-xl shadow-rose-100 transition-all active:scale-95">
            <FileText className="w-4 h-4" /> Exportar PDF
          </button>
          <button className="bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95">
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </header>

      {/* DASHBOARD DE KPI (FILTROS DE ESTADO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveView('all')}
          className={`p-6 rounded-[2rem] border text-left transition-all relative overflow-hidden ${activeView === 'all' ? 'bg-indigo-600 border-indigo-400 shadow-xl text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${activeView === 'all' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
            <Users className="w-5 h-5" />
          </div>
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${activeView === 'all' ? 'text-indigo-200' : 'text-slate-400'}`}>Personal (Únicos)</p>
          <p className="text-3xl font-black italic">{stats.total}</p>
        </button>

        <button 
          onClick={() => setActiveView('ok')}
          className={`p-6 rounded-[2rem] border text-left transition-all relative overflow-hidden ${activeView === 'ok' ? 'bg-emerald-600 border-emerald-400 shadow-xl text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${activeView === 'ok' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${activeView === 'ok' ? 'text-emerald-200' : 'text-slate-400'}`}>Asistencias OK</p>
          <p className="text-3xl font-black italic">{stats.complete}</p>
        </button>

        <button 
          onClick={() => setActiveView('incidences')}
          className={`p-6 rounded-[2rem] border text-left transition-all relative overflow-hidden ${activeView === 'incidences' ? 'bg-rose-600 border-rose-400 shadow-xl text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${activeView === 'incidences' ? 'bg-white/20' : 'bg-rose-50 text-rose-500'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${activeView === 'incidences' ? 'text-rose-200' : 'text-slate-400'}`}>Incidencias</p>
          <p className="text-3xl font-black italic">{stats.incidences}</p>
        </button>

        <div className="p-6 rounded-[2rem] border bg-slate-900 border-slate-800 text-white shadow-xl relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400">Horas Acumuladas</p>
          <p className="text-3xl font-black italic text-indigo-400">{stats.accumulatedHours} <span className="text-xs font-bold uppercase">HRS</span></p>
          <TrendingUp className="absolute -bottom-4 -right-4 w-20 h-20 opacity-5" />
        </div>
      </div>

      {/* FILTROS DE AUDITORÍA */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">Desde</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-bold text-sm" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">Hasta</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-bold text-sm" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} />
          </div>
          <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">Zona</label>
             <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-black text-slate-700 text-sm appearance-none" value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
                <option value="all">Todas las Áreas</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
             </select>
          </div>
          <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">Equipo SDK</label>
             <select className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 outline-none font-black text-indigo-700 text-sm appearance-none" value={filters.device} onChange={e => setFilters({...filters, device: e.target.value})}>
                <option value="all">Todos los Equipos</option>
                {availableDevices.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">Auditoría Individual</label>
            <button onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-left flex items-center justify-between group">
              <span className="text-sm font-bold text-slate-700">{selectedEmployees.length === 0 ? 'Planilla Completa' : `${selectedEmployees.length} Seleccionados`}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {isEmployeeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-30 max-h-64 overflow-y-auto p-4 animate-in zoom-in duration-150 custom-scrollbar">
                {employees.map(emp => (
                  <button key={emp.enroll_number} onClick={() => toggleEmployee(emp.enroll_number)} className={`flex items-center justify-between w-full p-3 rounded-xl mb-1 ${selectedEmployees.includes(emp.enroll_number) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedEmployees.includes(emp.enroll_number) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200'}`}>
                        {selectedEmployees.includes(emp.enroll_number) && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-bold">{emp.first_name} {emp.last_name || ''}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">Búsqueda Rápida</label>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" placeholder="Enroll ID o Nombre..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 outline-none font-bold text-sm" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-100/50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zona</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Semáforo (IN / OUT)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hrs Calculadas</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Audit Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest">Sin registros disponibles</td>
                </tr>
              ) : (
                tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="font-mono text-[11px] font-black text-slate-400 italic">{row.date}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-slate-800">{row.name} {row.lastName || ''}</span>
                        <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Enroll: {row.enroll}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        <span className="text-[10px] font-black text-slate-500 uppercase">{departments.find(d => d.id === row.deptId)?.name || 'S/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-md text-[10px] font-black ${row.in ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                          IN: {row.in ? new Date(row.in).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                        </div>
                        <div className={`px-3 py-1 rounded-md text-[10px] font-black ${row.out ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                          OUT: {row.out ? new Date(row.out).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`px-4 py-2 rounded-2xl text-[11px] font-black inline-flex items-center gap-2 ${row.total > 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-rose-400'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {row.total > 0 ? `${row.total} HRS` : 'PENDIENTE'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button onClick={() => openHistory(row)} className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE AUDIT TRAIL */}
      {historyModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-900 p-8 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black italic flex items-center gap-2 tracking-tight">
                  <History className="w-5 h-5 text-indigo-400" /> Audit Trail SDK
                </h3>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">{historyModal.name} • {historyModal.date}</p>
              </div>
              <button onClick={() => setHistoryModal({...historyModal, isOpen: false})} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 italic">Secuencia Cruda Detectada</p>
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {historyModal.data && historyModal.data.length > 0 ? (
                      historyModal.data.map((log, lIdx) => (
                        <div key={lIdx} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:translate-x-1">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${log.status === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {log.status === 0 ? 'IN' : 'OUT'}
                              </div>
                              <div>
                                 <p className="font-black text-slate-800 text-sm">{new Date(log.att_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Cpu className="w-2.5 h-2.5" />{log.device_id}</p>
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-slate-300 font-black uppercase text-[10px]">Sin marcaciones crudas</p>
                    )}
                  </div>
               </div>
               <button onClick={() => setHistoryModal({...historyModal, isOpen: false})} className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all">Cerrar Auditoría</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
