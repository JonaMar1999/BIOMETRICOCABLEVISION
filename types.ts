
export interface User {
  username: string;
  full_name: string;
  role: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  allowed_departments?: string[];
  allowed_devices?: string[];
}

export interface Department {
  id: string;
  name: string;
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

export interface DashboardStats {
  total_employees: number;
  today_attendance: number;
  late_arrivals: number;
}

export const PERMISSIONS = [
  // Módulos
  { id: 'view_monitor', label: 'Ver Monitor en Vivo', group: 'ACCESO' },
  { id: 'view_reports', label: 'Ver Reportes', group: 'ACCESO' },
  { id: 'export_data', label: 'Exportar Datos', group: 'ACCESO' },
  { id: 'config_system', label: 'Configurar Sistema', group: 'ACCESO' },
  { id: 'manage_users', label: 'Gestionar Usuarios/Roles', group: 'ACCESO' },
  
  // Acciones Personal
  { id: 'create_employee', label: 'Personal: Crear', group: 'ACCIÓN CRUD' },
  { id: 'edit_employee', label: 'Personal: Editar', group: 'ACCIÓN CRUD' },
  { id: 'delete_employee', label: 'Personal: Eliminar', group: 'ACCIÓN CRUD' },
  
  // Acciones Departamentos
  { id: 'create_dept', label: 'Deptos: Crear', group: 'ACCIÓN CRUD' },
  { id: 'edit_dept', label: 'Deptos: Editar', group: 'ACCIÓN CRUD' },
  { id: 'delete_dept', label: 'Deptos: Eliminar', group: 'ACCIÓN CRUD' },
];
