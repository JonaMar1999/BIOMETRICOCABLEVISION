
import React, { useState, useMemo } from 'react';
import { AttendanceLog, Employee, ReportItem, Department } from '../types';
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

  // Obtener lista única de dispositivos para el filtro
  const availableDevices = useMemo(() => {
    const devices = logs.map(l => l.device_id).filter(id => id);
    return Array.from(new Set(devices));
  }, [logs]);

  // --- MOTOR DE GENERACIÓN DE HISTORIAL CRONOLÓGICO ---
  const fullReportData = useMemo(() => {
    const data: any[] = [];
    
    // Normalizar fechas para asegurar el ciclo completo día por día
    const startDate = new Date(filters.start + 'T00:00:00');
    const endDate = new Date(filters.end + 'T00:00:00');
    
    // Identificar empleados bajo auditoría (anclados o filtrados por búsqueda)
    const employeesToAudit = selectedEmployeeIds.length > 0 
      ? employees.filter(e => selectedEmployeeIds.includes(e.enroll_number))
      : (filters.search ? employees.filter(emp => {
          const fullName = `${emp.first_name} ${emp.last_name || ''}`.toLowerCase();
          return fullName.includes(filters.search.toLowerCase()) || emp.enroll_number.includes(filters.search);
        }) : employees);

    // Bucle Cronológico: Generamos una fila por cada día del rango para cada empleado
    let currentDay = new Date(startDate);
    while (currentDay <= endDate) {
      const dateStr = currentDay.toISOString().split('T')[0];
      
      employeesToAudit.forEach(emp => {
        // Filtro de Departamento (Segmentación operativa)
        if (filters.department !== 'all' && emp.department !== filters.department) return;

        // Extraer logs del empleado en esta fecha específica
        let dayLogs = logs.filter(l => 
          l.enroll_number === emp.enroll_number && 
          l.att_time.startsWith(dateStr)
        );

        // Aplicar filtro de equipo biométrico
        if (filters.device !== 'all') {
          dayLogs = dayLogs.filter(l => l.device_id === filters.device);
        }

        // Determinar Primera Entrada y Última Salida del día
        let entry = dayLogs.find(l => l.status === 0)?.att_time || null;
        let exit = dayLogs.slice().reverse().find(l => l.status === 1)?.att_time || null;
        const deviceUsed = dayLogs.length > 0 ? dayLogs[0].device_id : '--';

        // Lógica de cálculo de horas para auditoría de nómina
        let totalHrs = 0;
        let extraHrs = 0;
        if (entry && exit) {
          const diff = (new Date(exit).getTime() - new Date(entry).getTime()) / (1000 * 60 * 60);
          if (diff > 8) {
            extraHrs = parseFloat((diff - 8).toFixed(2));
            totalHrs = 8;
          } else {
            totalHrs = parseFloat(diff.toFixed(2));
          }
        }

        // Definición de Estados de Auditoría
        let status = 'INASISTENCIA';
        if (entry && exit) status = 'PRESENTE';
        else if (entry && !exit) status = 'SALIDA PENDIENTE';

        data.push({
          date: dateStr,
          enroll_number: emp.enroll_number,
          first_name: emp.first_name,
          last_name: emp.last_name,
          department: emp.department,
          device_id: deviceUsed,
          in: entry,
          out: exit,
          hours_worked: totalHrs,
          extra_hours: extraHrs,
          status: status
        });
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    return data;
  }, [logs, employees, filters, selectedEmployeeIds]);

  const displayedData = useMemo(() => {
    let data = [...fullReportData];
    if (activeStatusFilter !== 'all') {
      data = data.filter(item => item.status === activeStatusFilter);
    }
    return data.sort((a, b) => b.date.localeCompare(a.date));
  }, [fullReportData, activeStatusFilter]);

  // Totales Individuales (Solo visibles en auditoría de 1 empleado)
  const individualTotals = useMemo(() => {
    if (selectedEmployeeIds.length !== 1) return null;
    return displayedData.reduce((acc, curr) => ({
      hours: acc.hours + curr.hours_worked,
      extra: acc.extra + curr.extra_hours,
      inasistencias: acc.inasistencias + (curr.status === 'INASISTENCIA' ? 1 : 0)
    }), { hours: 0, extra: 0, inasistencias: 0 });
  }, [displayedData, selectedEmployeeIds]);

  const stats = useMemo(() => {
    return {
      inasistencias: fullReportData.filter(i => i.status === 'INASISTENCIA').length,
      pendientes: fullReportData.filter(i => i.status === 'SALIDA PENDIENTE').length,
      presentes: fullReportData.filter(i => i.status === 'PRESENTE').length,
      horas_totales: fullReportData.reduce((acc, curr) => acc + (curr.hours_worked || 0), 0).toFixed(1)
    };
  }, [fullReportData]);

  const toggleEmployeeSelection = (id: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleStatusFilter = (status: 'INASISTENCIA' | 'SALIDA PENDIENTE' | 'PRESENTE') => {
    setActiveStatusFilter(prev => prev === status ? 'all' : status);
  };

  const handleExportCSV = () => {
    const headers = "Fecha,Enroll ID,Empleado,Departamento,Entrada,Salida,Estado,Horas,Extra,Equipo\n";
    const csv = displayedData.map(i => {
      const deptName = departments.find(d => d.id === i.department)?.name || i.department;
      return `${i.date},${i.enroll_number},${i.first_name} ${i.last_name || ''},${deptName},${i.in || ''},${i.out || ''},${i.status},${i.hours_worked},${i.extra_hours},${i.device_id}`;
    }).join('\n');
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_completa_${filters.start}_${filters.end}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Cálculo de Horas y Reportes</h2>
          <p className="text-slate-500 font-medium">Auditoría cronológica diaria para validación de pre-nómina.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <TableIcon className="w-4 h-4 text-emerald-500" /> Exportar Auditoría
          </button>
          <button onClick={() => alert("Función PDF habilitada en entorno de producción.")} className="bg-rose-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100">
            <FileDown className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </header>

      {/* PANEL DE FILTROS DE AUDITORÍA */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Parámetros de Auditoría</span>
          </div>
          {(activeStatusFilter !== 'all' || selectedEmployeeIds.length > 0 || filters.device !== 'all') && (
            <button 
              onClick={() => { setActiveStatusFilter('all'); setSelectedEmployeeIds([]); setFilters(prev => ({...prev, device: 'all'})); }}
              className="text-[9px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-lg hover:bg-rose-100 transition-colors"
            >
              Limpiar Todos los Filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rango Desde</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rango Hasta</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} />
          </div>
          
          <div className="lg:col-span-1 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Auditar Empleado(s)</label>
            <div className="relative">
              <button 
                onClick={() => setIsEmployeeSelectorOpen(!isEmployeeSelectorOpen)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 outline-none font-bold text-left flex items-center justify-between group overflow-hidden"
              >
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <span className={`truncate text-sm ${selectedEmployeeIds.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {selectedEmployeeIds.length === 0 ? 'Seleccionar...' : `${selectedEmployeeIds.length} seleccionado(s)`}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-300 shrink-0" />
              </button>

              {isEmployeeSelectorOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 p-2 animate-in fade-in slide-in-from-top-2">
                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {employees.map(emp => (
                      <button 
                        key={emp.enroll_number}
                        onClick={() => toggleEmployeeSelection(emp.enroll_number)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-xs font-bold ${selectedEmployeeIds.includes(emp.enroll_number) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="truncate w-[140px] text-left">{emp.first_name} {emp.last_name}</span>
                          <span className="text-[9px] opacity-50 uppercase tracking-tighter">ID: {emp.enroll_number}</span>
                        </div>
                        {selectedEmployeeIds.includes(emp.enroll_number) && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t mt-2">
                    <button onClick={() => setIsEmployeeSelectorOpen(false)} className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Anclar Selección</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Filtrar por Equipo</label>
            <div className="relative">
              <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none font-bold text-slate-700 text-sm cursor-pointer appearance-none"
                value={filters.device}
                onChange={e => setFilters({...filters, device: e.target.value})}
              >
                <option value="all">Todos los equipos</option>
                {availableDevices.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Zona / Depto</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold cursor-pointer text-sm" value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
              <option value="all">Cualquier Zona</option>
              {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TARJETAS KPI DE AUDITORÍA */}
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => toggleStatusFilter('INASISTENCIA')}
          className={`group flex-1 min-w-[200px] border px-6 py-4 rounded-[1.5rem] flex items-center gap-4 transition-all duration-300 ${activeStatusFilter === 'INASISTENCIA' ? 'bg-rose-500 border-rose-600 shadow-xl shadow-rose-200 -translate-y-1 scale-[1.02]' : 'bg-rose-50 border-rose-100 hover:bg-rose-100 shadow-sm'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${activeStatusFilter === 'INASISTENCIA' ? 'bg-white text-rose-500' : 'bg-rose-500 text-white shadow-rose-200'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${activeStatusFilter === 'INASISTENCIA' ? 'text-rose-100' : 'text-rose-400'}`}>Inasistencias</p>
            <p className={`text-xl font-black ${activeStatusFilter === 'INASISTENCIA' ? 'text-white' : 'text-rose-600'}`}>{stats.inasistencias}</p>
          </div>
        </button>

        <button 
          onClick={() => toggleStatusFilter('SALIDA PENDIENTE')}
          className={`group flex-1 min-w-[200px] border px-6 py-4 rounded-[1.5rem] flex items-center gap-4 transition-all duration-300 ${activeStatusFilter === 'SALIDA PENDIENTE' ? 'bg-orange-500 border-orange-600 shadow-xl shadow-orange-200 -translate-y-1 scale-[1.02]' : 'bg-orange-50 border-orange-100 hover:bg-orange-100 shadow-sm'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${activeStatusFilter === 'SALIDA PENDIENTE' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white shadow-orange-200'}`}>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${activeStatusFilter === 'SALIDA PENDIENTE' ? 'text-orange-100' : 'text-orange-400'}`}>Salidas Pendientes</p>
            <p className={`text-xl font-black ${activeStatusFilter === 'SALIDA PENDIENTE' ? 'text-white' : 'text-orange-600'}`}>{stats.pendientes}</p>
          </div>
        </button>

        <button 
          onClick={() => toggleStatusFilter('PRESENTE')}
          className={`group flex-1 min-w-[200px] border px-6 py-4 rounded-[1.5rem] flex items-center gap-4 transition-all duration-300 ${activeStatusFilter === 'PRESENTE' ? 'bg-indigo-500 border-indigo-600 shadow-xl shadow-indigo-200 -translate-y-1 scale-[1.02]' : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100 shadow-sm'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${activeStatusFilter === 'PRESENTE' ? 'bg-white text-indigo-500' : 'bg-indigo-500 text-white shadow-indigo-200'}`}>
             <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${activeStatusFilter === 'PRESENTE' ? 'text-indigo-100' : 'text-indigo-400'}`}>Total Presentes</p>
            <p className={`text-xl font-black ${activeStatusFilter === 'PRESENTE' ? 'text-white' : 'text-indigo-600'}`}>{stats.presentes}</p>
          </div>
        </button>
      </div>

      {/* TABLA DE AUDITORÍA DIARIA COMPLETA */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Empleado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zona</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entrada</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Salida</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Horas</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Extra</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Equipo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado Auditoría</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedData.map((item, idx) => (
                <tr key={idx} className={`transition-colors ${item.status === 'INASISTENCIA' ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'hover:bg-slate-50'}`}>
                  <td className="px-8 py-5 font-bold text-slate-600 text-xs whitespace-nowrap italic">{item.date}</td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-800 text-sm leading-tight">{item.first_name} {item.last_name}</p>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">ID: {item.enroll_number}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      {departments.find(d => d.id === item.department)?.name || item.department}
                    </span>
                  </td>
                  <td className={`px-8 py-5 font-bold text-xs ${item.in ? 'text-emerald-600' : 'text-slate-300'}`}>
                    {item.in ? new Date(item.in).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                  </td>
                  <td className={`px-8 py-5 font-bold text-xs ${item.out ? 'text-orange-600' : 'text-slate-300'}`}>
                    {item.out ? new Date(item.out).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full font-black text-[10px] ${item.hours_worked > 0 ? 'bg-indigo-50 text-indigo-600' : 'text-slate-200'}`}>
                      {item.hours_worked}h
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {item.extra_hours > 0 ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-black text-[10px]">
                        +{item.extra_hours}h
                      </span>
                    ) : <span className="text-slate-200 font-bold">-</span>}
                  </td>
                  <td className="px-8 py-5 font-mono text-[10px] font-black text-slate-400 uppercase">{item.device_id}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${
                         item.status === 'PRESENTE' ? 'bg-emerald-500' : 
                         item.status === 'SALIDA PENDIENTE' ? 'bg-orange-500 animate-pulse' : 'bg-rose-500 shadow-sm shadow-rose-200'
                       }`}></div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${
                         item.status === 'PRESENTE' ? 'text-emerald-600' : 
                         item.status === 'SALIDA PENDIENTE' ? 'text-orange-600' : 'text-rose-600'
                       }`}>
                         {item.status}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => setSelectedDetailItem(item)}
                      className="p-2.5 hover:bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200 group"
                    >
                      <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {individualTotals && (
              <tfoot className="bg-slate-900 text-white">
                <tr>
                  <td colSpan={5} className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px]">Resumen Individual Quincenal / Mensual</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">Ordinarias</span>
                      <span className="text-lg font-black italic">{individualTotals.hours.toFixed(2)}h</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Extra Acumuladas</span>
                      <span className="text-lg font-black italic">{individualTotals.extra.toFixed(2)}h</span>
                    </div>
                  </td>
                  <td colSpan={3} className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-rose-400 text-[9px] font-black uppercase tracking-widest">Inasistencias / Faltas</span>
                      <span className="text-lg font-black italic text-rose-500">{individualTotals.inasistencias} Días</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {displayedData.length === 0 && (
          <div className="p-20 text-center space-y-4">
             <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
               <Info className="w-10 h-10" />
             </div>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Sin datos para mostrar con el filtro actual</p>
          </div>
        )}
      </div>

      {/* MODAL DE DETALLE DEL DÍA */}
      {selectedDetailItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-xl"><Fingerprint className="w-7 h-7" /></div>
                <div>
                  <h3 className="text-xl font-black italic">Auditoría de Marcaciones</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedDetailItem.date} • {selectedDetailItem.first_name} {selectedDetailItem.last_name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDetailItem(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:rotate-90"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estatus del Día</p>
                  <p className={`font-black text-lg ${selectedDetailItem.status === 'PRESENTE' ? 'text-emerald-600' : selectedDetailItem.status === 'SALIDA PENDIENTE' ? 'text-orange-600' : 'text-rose-600'}`}>{selectedDetailItem.status}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cómputo Total</p>
                  <p className="font-black text-lg text-slate-900">{selectedDetailItem.hours_worked}h {selectedDetailItem.extra_hours > 0 ? `(+${selectedDetailItem.extra_hours}h Extra)` : ''}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-indigo-500" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cronología Registrada</span></div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {logs.filter(l => l.enroll_number === selectedDetailItem.enroll_number && l.att_time.startsWith(selectedDetailItem.date)).length > 0 ? 
                    logs.filter(l => l.enroll_number === selectedDetailItem.enroll_number && l.att_time.startsWith(selectedDetailItem.date)).map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl group">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs ${log.status === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{log.status === 0 ? 'ENTRADA' : 'SALIDA'}</div>
                        <div>
                          <p className="font-black text-slate-800 text-base">{new Date(log.att_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                          <div className="flex items-center gap-2 mt-1"><MapPin className="w-3 h-3 text-slate-300" /><span className="text-[10px] text-slate-400 font-bold uppercase">{log.device_id}</span></div>
                        </div>
                      </div>
                      <div className="text-right"><span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">ID #{log.id}</span></div>
                    </div>
                  )) : (
                    <div className="p-10 text-center bg-rose-50 border border-rose-100 rounded-3xl">
                       <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Sin marcaciones detectadas</p>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedDetailItem(null)} className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3">Finalizar Revisión</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
