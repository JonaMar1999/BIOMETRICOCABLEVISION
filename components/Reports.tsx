
import React, { useState, useMemo } from 'react';
import { AttendanceLog, Employee, ReportItem, Department } from '../types';
import { Calendar, FileText, Filter, Users, Table as TableIcon, Monitor as DeviceIcon, Building2, FileDown } from 'lucide-react';

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

  // Cálculo de reporte procesando marcas locales (Mock Logic)
  const reportData: ReportItem[] = useMemo(() => {
    // Filtrado inicial por fecha, dispositivo y departamento
    const filteredLogs = logs.filter(log => {
      const dateStr = log.att_time.split('T')[0];
      const matchDate = dateStr >= filters.start && dateStr <= filters.end;
      const matchDevice = filters.device === 'all' || log.device_id.includes(filters.device);
      const matchDept = filters.department === 'all' || log.department === filters.department;
      const matchSearch = log.first_name.toLowerCase().includes(filters.search.toLowerCase()) || log.enroll_number.includes(filters.search);
      return matchDate && matchDevice && matchDept && matchSearch;
    });

    // Agrupación por empleado y día para calcular IN/OUT
    const grouped: { [key: string]: ReportItem } = {};

    filteredLogs.forEach(log => {
      const dateKey = log.att_time.split('T')[0];
      const key = `${log.enroll_number}-${dateKey}`;

      if (!grouped[key]) {
        grouped[key] = {
          date: dateKey,
          enroll_number: log.enroll_number,
          first_name: log.first_name,
          last_name: '',
          department: log.department,
          device_id: log.device_id,
          in: null,
          out: null,
          hours_worked: 0
        };
      }

      if (log.status === 0) {
        if (!grouped[key].in || log.att_time < grouped[key].in!) grouped[key].in = log.att_time;
      } else {
        if (!grouped[key].out || log.att_time > grouped[key].out!) grouped[key].out = log.att_time;
      }
    });

    // Cálculo final de horas
    return Object.values(grouped).map(item => {
      if (item.in && item.out) {
        const diff = new Date(item.out).getTime() - new Date(item.in).getTime();
        item.hours_worked = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
      }
      return item;
    });
  }, [logs, filters]);

  const handleExportCSV = () => {
    const headers = "Fecha,Enroll ID,Nombre,Departamento,Entrada,Salida,Biométrico,Horas\n";
    const csv = reportData.map(i => {
      const deptName = departments.find(d => d.id === i.department)?.name || i.department;
      return `${i.date},${i.enroll_number},${i.first_name},${deptName},${i.in || ''},${i.out || ''},${i.device_id},${i.hours_worked}`;
    }).join('\n');
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bioaccess_report_${filters.start}_to_${filters.end}.csv`;
    a.click();
  };

  const handleExportPDF = () => {
    alert("Generando documento PDF... Esta función requiere la librería jsPDF. El motor de BioAccess está procesando los datos para la descarga.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Cálculo de Horas y Reportes</h2>
          <p className="text-slate-500 font-medium">Motor de análisis offline con filtrado avanzado multidimensional.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV} 
            className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <TableIcon className="w-4 h-4 text-emerald-500" /> Exportar CSV
          </button>
          <button 
            onClick={handleExportPDF} 
            className="bg-rose-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100"
          >
            <FileDown className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </header>

      {/* FILTRO AVANZADO */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Panel de Filtros Avanzados</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-end">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rango Inicio</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none font-bold" 
                value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rango Fin</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none font-bold" 
                value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Biométrico / Device</label>
            <div className="relative">
              <DeviceIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none font-bold cursor-pointer" 
                value={filters.device} onChange={e => setFilters({...filters, device: e.target.value})}>
                <option value="all">Todos los equipos</option>
                <option value="T88">ZK-T88 (Principal)</option>
                <option value="F22">ZK-F22 (Laboratorio)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Zona / Depto</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none font-bold cursor-pointer" 
                value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
                <option value="all">Toda la empresa</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscador rápido..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none font-bold" 
              value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Empleado</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Departamento</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entrada</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Salida</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Biométrico</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Horas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reportData.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5 font-bold text-slate-600 text-sm whitespace-nowrap">{item.date}</td>
                <td className="px-8 py-5">
                  <p className="font-bold text-slate-800">{item.first_name}</p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">ID: {item.enroll_number}</span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                    {departments.find(d => d.id === item.department)?.name || item.department}
                  </span>
                </td>
                <td className="px-8 py-5 text-emerald-600 font-bold text-sm">{item.in ? new Date(item.in).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</td>
                <td className="px-8 py-5 text-orange-600 font-bold text-sm">{item.out ? new Date(item.out).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-black text-indigo-500 uppercase bg-indigo-50 px-3 py-1 rounded-lg">
                    {item.device_id.split('-')[0]}
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className={`px-4 py-1.5 rounded-full font-black text-xs ${parseFloat(item.hours_worked as string) > 8 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                    {item.hours_worked}h
                  </span>
                </td>
              </tr>
            ))}
            {reportData.length === 0 && (
              <tr><td colSpan={7} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Sin registros para el filtro aplicado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
