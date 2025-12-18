
export interface User {
  username: string;
  full_name: string;
  role: 'SuperAdmin' | 'RRHH' | 'Visualizador';
}

export interface Employee {
  id: number;
  enroll_number: string;
  first_name: string;
  last_name: string | null;
  department: string | null;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface AttendanceLog {
  enroll_number: string;
  first_name: string;
  att_time: string;
  type: 'IN' | 'OUT';
  device_id: string;
}

export interface ReportItem {
  date: string;
  employee_id: number;
  first_name: string;
  last_name: string;
  department: string;
  entry_time: string | null;
  exit_time: string | null;
  hours_worked: number;
  device_id: string;
}

export interface DashboardStats {
  total_employees: number;
  today_attendance: number;
  late_arrivals: number;
}
