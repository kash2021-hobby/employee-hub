import type {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  NewEmployeeRequest,
  Holiday,
  EmployeeOnLeave,
} from '@/types/employee';

// Base API URL - should be configured via environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Employee API
export const employeeApi = {
  getAll: () => fetchApi<Employee[]>('/employees'),
  
  getById: (id: string) => fetchApi<Employee>(`/employees/${id}`),
  
  create: (data: Omit<Employee, 'id'>) =>
    fetchApi<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Employee>) =>
    fetchApi<Employee>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/employees/${id}`, {
      method: 'DELETE',
    }),
};

// Attendance API
export const attendanceApi = {
  getAll: (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return fetchApi<AttendanceRecord[]>(`/attendance${query}`);
  },
  
  getByEmployee: (employeeId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return fetchApi<AttendanceRecord[]>(`/attendance/employee/${employeeId}${query}`);
  },
  
  signIn: (employeeId: string) =>
    fetchApi<AttendanceRecord>('/attendance/sign-in', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    }),
  
  signOut: (employeeId: string) =>
    fetchApi<AttendanceRecord>('/attendance/sign-out', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    }),
};

// Leave Request API
export const leaveApi = {
  getAll: (status?: 'pending' | 'approved' | 'rejected') => {
    const query = status ? `?status=${status}` : '';
    return fetchApi<LeaveRequest[]>(`/leaves${query}`);
  },
  
  getByEmployee: (employeeId: string) =>
    fetchApi<LeaveRequest[]>(`/leaves/employee/${employeeId}`),
  
  create: (data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) =>
    fetchApi<LeaveRequest>('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  approve: (id: string) =>
    fetchApi<LeaveRequest>(`/leaves/${id}/approve`, {
      method: 'POST',
    }),
  
  reject: (id: string) =>
    fetchApi<LeaveRequest>(`/leaves/${id}/reject`, {
      method: 'POST',
    }),
};

// New Employee Request API
export const newEmployeeApi = {
  getAll: (status?: 'pending' | 'approved' | 'rejected') => {
    const query = status ? `?status=${status}` : '';
    return fetchApi<NewEmployeeRequest[]>(`/new-employees${query}`);
  },
  
  approve: (id: string) =>
    fetchApi<Employee>(`/new-employees/${id}/approve`, {
      method: 'POST',
    }),
  
  reject: (id: string) =>
    fetchApi<void>(`/new-employees/${id}/reject`, {
      method: 'POST',
    }),
};

// Holiday API
export const holidayApi = {
  getAll: () => fetchApi<Holiday[]>('/holidays'),
  
  create: (data: Omit<Holiday, 'id'>) =>
    fetchApi<Holiday>('/holidays', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Holiday>) =>
    fetchApi<Holiday>(`/holidays/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/holidays/${id}`, {
      method: 'DELETE',
    }),
};

// Employees on Leave API
export const employeesOnLeaveApi = {
  getAll: (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return fetchApi<EmployeeOnLeave[]>(`/employees-on-leave${query}`);
  },
};

// Dashboard Stats API
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  pendingNewEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}

export const dashboardApi = {
  getStats: () => fetchApi<DashboardStats>('/dashboard/stats'),
};
