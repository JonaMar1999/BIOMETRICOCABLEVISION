
export interface User {
  username: string;
  full_name: string;
  role: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Employee {
  id: number;
  enroll_number: string;
  first_name: string;
  last_name: string | null;
  department: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface AttendanceLog {
  id: number;
  enroll_number: string;
  first_name: string;
  att_time: string;
  status: number; // 0: IN, 1: OUT
  device_id: string;
  department: string;
}

// Fix: Adding missing ReportItem interface used in components/Reports.tsx
export interface ReportItem {
  date: string;
  enroll_number: string;
  first_name: string;
  last_name: string | null;
  in: string | null;
  out: string | null;
  hours_worked: string | number;
}

export interface DashboardStats {
  total_employees: number;
  today_attendance: number;
  late_arrivals: number;
}

export const PERMISSIONS = [
  { id: 'view_monitor', label: 'Ver Monitor en Vivo' },
  { id: 'view_reports', label: 'Ver Reportes' },
  { id: 'export_data', label: 'Exportar Datos (PDF/CSV)' },
  { id: 'edit_personal', label: 'Gestionar Personal (CRUD)' },
  { id: 'config_system', label: 'Configurar Sistema' },
  { id: 'manage_users', label: 'Gestionar Usuarios y Roles' },
];
