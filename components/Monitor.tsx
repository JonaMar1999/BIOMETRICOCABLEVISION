import React from 'react';
import { AttendanceLog } from '../types';
import { Clock, ArrowRightCircle, ArrowLeftCircle, Monitor as MonitorIcon } from 'lucide-react';

interface MonitorProps {
  logs: AttendanceLog[];
}

const Monitor: React.FC<MonitorProps> = ({ logs }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Monitor de Asistencia</h2>
          <p className="text-slate-500 font-medium">Marcaciones en tiempo real recibidas por el sistema.</p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200">
          <MonitorIcon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Live View</span>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enroll ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tipo</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hora</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dispositivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {log.first_name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-700">{log.first_name}</span>
                  </div>
                </td>
                <td className="px-8 py-5 font-mono text-xs font-bold text-slate-400">{log.enroll_number}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${log.status === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {log.status === 0 ? <ArrowRightCircle className="w-3 h-3" /> : <ArrowLeftCircle className="w-3 h-3" />}
                    {log.status === 0 ? 'Entrada' : 'Salida'}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    {new Date(log.att_time).toLocaleString()}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-500 uppercase">{log.device_id || 'ZK-T88'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Monitor;