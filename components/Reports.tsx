
import React, { useState, useMemo } from 'react';
import { AttendanceLog, Employee, Department } from '../types';
import { 
  Calendar, Filter, Users, Table as TableIcon, 
  Monitor as DeviceIcon, Building2, FileDown, 
  AlertCircle, CheckCircle, Clock, Eye, Info, X, MapPin, Fingerprint, ChevronDown, Check, Cpu
} from 'lucide-react';

interface ReportsProps {
  logs: AttendanceLog[];
  employees: Employee[];
  departments: Department[];
}

const Reports: React.FC<ReportsProps> = ({ logs, employees, departments }) => {
  const [filters, setFilters] = useState({
    start: '2024-05-20',
    end: '2024-05-21',
    device: 'all',
    department: 'all',
    search: ''
  });

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isEmployeeSelectorOpen, setIsEmployeeSelectorOpen] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'INASISTENCIA' | 'SALIDA PENDIENTE' | 'PRESENTE'>('all');
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);

  const availableDevices = useMemo(() => {
    const devices = logs.map(l => l.device_id).filter(id => id);
    return Array.from(new Set(devices));
  }, [logs]);

  const fullReportData = useMemo(() => {
    const data: any[] = [];
    const startDate = new Date(filters.start + 'T00:00:00');
    const endDate = new Date(filters.end + 'T00:00:00');
    
    const employeesToAudit = selectedEmployeeIds.length > 0 
      ? employees.filter(e => selectedEmployeeIds.includes(e.enroll_number))
      : (filters.search ? employees.filter(emp => {
          const fullName = `${emp.first_name} ${emp.last_name || ''}`.toLowerCase();
          return fullName.includes(filters.search.toLowerCase()) || emp.enroll_number.includes(filters.search);
        }) : employees);

    let currentDay = new Date(startDate);
    while (currentDay <= endDate) {
      const dateStr = currentDay.toISOString().split('T')[0];
      employeesToAudit.forEach(emp => {
        if (filters.department !== 'all' && emp.department !== filters.department) return;
        let dayLogs = logs.filter(l => l.enroll_number === emp.enroll_number && l.att_time.startsWith(dateStr));
        if (filters.device !== 'all') dayLogs = dayLogs.filter(l => l.device_id === filters.device);
        
        let entry = dayLogs.find(l => l.status === 0)?.att_time || null;
        let exit = dayLogs.slice().reverse().find(l => l.status === 1)?.att_time || null;
        const deviceUsed = dayLogs.length > 0 ? dayLogs[0].device_id : '--';
        
        let totalHrs = 0;
        let extraHrs = 0;
        if (entry && exit) {
          const diff = (new Date(exit).getTime() - new Date(entry).getTime()) / (1000 * 60 * 60);
          if (diff > 8) { extraHrs = parseFloat((diff - 8).toFixed(2)); totalHrs = 8; } 
          else totalHrs = parseFloat(diff.toFixed(2));
        }
        
        let status = 'INASISTENCIA';
        if (entry && exit) status = 'PRESENTE';
        else if (entry && !exit) status = 'SALIDA PENDIENTE';

        data.push({ date: dateStr, enroll_number: emp.enroll_number, first_name: emp.first_name, last_name: emp.last_name, department: emp.department, device_id: deviceUsed, in: entry, out: exit, hours_worked: totalHrs, extra_hours: extraHrs, status: status });
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }
    return data;
  }, [logs, employees, filters, selectedEmployeeIds]);

  const displayedData = useMemo(() => {
    let data = [...fullReportData];
    if (activeStatusFilter !== 'all') data = data.filter(item => item.status === activeStatusFilter);
    return data.sort((a, b) => b.date.localeCompare(a.date));
  }, [fullReportData, activeStatusFilter]);

  const stats = useMemo(() => ({
    inasistencias: fullReportData.filter(i => i.status === 'INASISTENCIA').length,
    pendientes: fullReportData.filter(i => i.status === 'SALIDA PENDIENTE').length,
    presentes: fullReportData.filter(i => i.status === 'PRESENTE').length,
  }), [fullReportData]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic leading-tight">Cómputo de Horas</h2>
          <p className="text-slate-500 font-medium text-sm">Auditoría cronológica diaria para validación de nómina.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => {}} className="bg-white border border-slate-200 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest text-slate-700 shadow-sm hover:bg-slate-50">
            <TableIcon className="w-4 h-4 text-emerald-500" /> <span className="sm:hidden">Exportar</span> CSV
          </button>
          <button className="bg-rose-600 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-100">
            <FileDown className="w-4 h-4" /> <span className="sm:hidden">Generar</span> PDF
          </button>
        </div>
      </header>

      {/* KPIs Responsivos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'INASISTENCIA', label: 'Inasistencias', val: stats.inasistencias, color: 'rose' },
          { id: 'SALIDA PENDIENTE', label: 'Pendientes', val: stats.pendientes, color: 'orange' },
          { id: 'PRESENTE', label: 'Presentes', val: stats.presentes, color: 'indigo' }
        ].map(kpi => (
          <button 
            key={kpi.id}
            onClick={() => setActiveStatusFilter(activeStatusFilter === kpi.id ? 'all' : kpi.id as any)}
            className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all ${
              activeStatusFilter === kpi.id 
              ? `bg-${kpi.color}-600 border-${kpi.color}-700 shadow-lg text-white` 
              : `bg-white border-slate-200 text-slate-600 hover:border-${kpi.color}-200`
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeStatusFilter === kpi.id ? 'bg-white/20' : `bg-${kpi.color}-50 text-${kpi.color}-600`}`}>
              {kpi.id === 'INASISTENCIA' ? <AlertCircle className="w-5 h-5" /> : kpi.id === 'PRESENTE' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <p className={`text-[9px] font-black uppercase tracking-widest ${activeStatusFilter === kpi.id ? 'text-white/70' : 'text-slate-400'}`}>{kpi.label}</p>
              <p className="text-xl font-black">{kpi.val}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Grid de Filtros con Equipo Restaurado */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 items-end">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Rango Inicial</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold text-sm" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Rango Final</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold text-sm" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} />
          </div>
          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Empleado(s)</label>
            <button onClick={() => setIsEmployeeSelectorOpen(!isEmployeeSelectorOpen)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-left font-bold text-sm flex items-center justify-between">
              <span className="truncate">{selectedEmployeeIds.length === 0 ? 'Todos' : `${selectedEmployeeIds.length} Selecc.`}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {isEmployeeSelectorOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border p-2 z-50 max-h-48 overflow-y-auto">
                {employees.map(e => (
                  <button key={e.id} onClick={() => setSelectedEmployeeIds(prev => prev.includes(e.enroll_number) ? prev.filter(id => id !== e.enroll_number) : [...prev, e.enroll_number])} className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between ${selectedEmployeeIds.includes(e.enroll_number) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'}`}>
                    <span>{e.first_name}</span> {selectedEmployeeIds.includes(e.enroll_number) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Zona</label>
             <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold text-sm cursor-pointer" value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
                <option value="all">Todas</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
             </select>
          </div>
          {/* RESTAURADO: FILTRO POR EQUIPO */}
          <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1 flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Equipo</label>
             <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold text-sm cursor-pointer" value={filters.device} onChange={e => setFilters({...filters, device: e.target.value})}>
                <option value="all">Todos los Biométricos</option>
                {availableDevices.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrada</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Salida</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horas</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-500 text-[11px] italic whitespace-nowrap">{item.date}</td>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 text-xs">{item.first_name} {item.last_name}</p>
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-tighter">ID: {item.enroll_number}</span>
                  </td>
                  <td className={`px-8 py-5 font-bold text-xs ${item.in ? 'text-emerald-600' : 'text-slate-300'}`}>
                    {item.in ? new Date(item.in).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                  </td>
                  <td className={`px-8 py-5 font-bold text-xs ${item.out ? 'text-orange-600' : 'text-slate-300'}`}>
                    {item.out ? new Date(item.out).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px]">{item.hours_worked}h</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'PRESENTE' ? 'text-emerald-600' : item.status === 'SALIDA PENDIENTE' ? 'text-orange-600' : 'text-rose-600'}`}>{item.status}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button onClick={() => setSelectedDetailItem(item)} className="p-2 text-slate-400 hover:text-indigo-600"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
