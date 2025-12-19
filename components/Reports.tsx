
import React, { useState, useMemo } from 'react';
import { AttendanceLog, Employee, ReportItem, Department } from '../types';
import { 
  Calendar, Filter, Users, Table as TableIcon, 
  Monitor as DeviceIcon, Building2, FileDown, 
  AlertCircle, CheckCircle, Clock, Eye, Info 
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

  // Generar reporte avanzado (Cruce de Empleados vs Días)
  const reportData = useMemo(() => {
    const data: any[] = [];
    const startDate = new Date(filters.start);
    const endDate = new Date(filters.end);
    
    // Iterar por cada día del rango
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Para cada día, verificar a todos los empleados
      employees.forEach(emp => {
        // Filtro por departamento en la fuente
        if (filters.department !== 'all' && emp.department !== filters.department) return;
        
        // Filtro por búsqueda de nombre/id
        const fullName = `${emp.first_name} ${emp.last_name || ''}`.toLowerCase();
        if (filters.search && !fullName.includes(filters.search.toLowerCase()) && !emp.enroll_number.includes(filters.search)) return;

        // Buscar logs de este empleado en esta fecha
        const dayLogs = logs.filter(l => 
          l.enroll_number === emp.enroll_number && 
          l.att_time.startsWith(dateStr)
        );

        let entry = dayLogs.find(l => l.status === 0)?.att_time || null;
        let exit = dayLogs.slice().reverse().find(l => l.status === 1)?.att_time || null;
        
        // Dispositivo usado (el primero que aparezca en el día)
        const deviceUsed = dayLogs.length > 0 ? dayLogs[0].device_id : '--';

        // Calcular Horas
        let totalHrs = 0;
        let extraHrs = 0;
        if (entry && exit) {
          totalHrs = parseFloat(((new Date(exit).getTime() - new Date(entry).getTime()) / (1000 * 60 * 60)).toFixed(2));
          if (totalHrs > 8) {
            extraHrs = parseFloat((totalHrs - 8).toFixed(2));
            totalHrs = 8;
          }
        }

        // Determinar Estado
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
    }

    return data.sort((a, b) => b.date.localeCompare(a.date));
  }, [logs, employees, filters]);

  // KPIs del reporte actual
  const stats = useMemo(() => {
    return {
      inasistencias: reportData.filter(i => i.status === 'INASISTENCIA').length,
      pendientes: reportData.filter(i => i.status === 'SALIDA PENDIENTE').length,
      horas_totales: reportData.reduce((acc, curr) => acc + (curr.hours_worked || 0), 0).toFixed(1)
    };
  }, [reportData]);

  const handleExportCSV = () => {
    const headers = "Fecha,Enroll ID,Empleado,Departamento,Entrada,Salida,Estado,Horas,Extra\n";
    const csv = reportData.map(i => {
      const deptName = departments.find(d => d.id === i.department)?.name || i.department;
      return `${i.date},${i.enroll_number},${i.first_name} ${i.last_name || ''},${deptName},${i.in || ''},${i.out || ''},${i.status},${i.hours_worked},${i.extra_hours}`;
    }).join('\n');
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_asistencia_${filters.start}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Cálculo de Horas y Reportes</h2>
          <p className="text-slate-500 font-medium">Motor de análisis multidimensional para pre-nómina.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <TableIcon className="w-4 h-4 text-emerald-500" /> Exportar CSV
          </button>
          <button onClick={() => alert("Función PDF habilitada en entorno de producción.")} className="bg-rose-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100">
            <FileDown className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </header>

      {/* FILTROS AVANZADOS */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Filtros de Búsqueda</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-end">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Desde</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hasta</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Depto / Zona</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none font-bold cursor-pointer" value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
              <option value="all">Toda la empresa</option>
              {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2 relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscador por Nombre o ID..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none font-bold" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          </div>
        </div>
      </div>

      {/* RESUMEN DE INCIDENCIAS */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-rose-50 border border-rose-100 px-6 py-4 rounded-[1.5rem] flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none">Inasistencias</p>
            <p className="text-xl font-black text-rose-600">{stats.inasistencias}</p>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-100 px-6 py-4 rounded-[1.5rem] flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none">Salidas Pendientes</p>
            <p className="text-xl font-black text-orange-600">{stats.pendientes}</p>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-6 py-4 rounded-[1.5rem] flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
             <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Horas Totales</p>
            <p className="text-xl font-black text-indigo-600">{stats.horas_totales}h</p>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL ACTUALIZADA */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Empleado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Departamento</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entrada</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Salida</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Horas</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Extra</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado / Incidencia</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((item, idx) => (
                <tr key={idx} className={`transition-colors ${item.status === 'INASISTENCIA' ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50'}`}>
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
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${
                         item.status === 'PRESENTE' ? 'bg-emerald-500' : 
                         item.status === 'SALIDA PENDIENTE' ? 'bg-orange-500 animate-pulse' : 'bg-rose-500'
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
                    <button className="p-2.5 hover:bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200 group">
                      <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reportData.length === 0 && (
          <div className="p-20 text-center space-y-4">
             <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
               <Info className="w-10 h-10" />
             </div>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No hay datos para procesar con los filtros actuales</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
