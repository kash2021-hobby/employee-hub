import type {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  NewEmployeeRequest,
  Holiday,
  EmployeeOnLeave,
} from '@/types/employee';

// Base API URL
const API_BASE_URL = 'https://const-backend.onrender.com';

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
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
  getAll: () => fetchApi<Employee[]>('/api/employees'),
  
  getById: (id: string) => fetchApi<Employee>(`/api/employees/${id}`),
  
  create: (data: Omit<Employee, 'id'>) =>
    fetchApi<{ message: string; data: Employee }>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Employee>) =>
    fetchApi<{ message: string; data: Employee }>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/api/employees/${id}`, {
      method: 'DELETE',
    }),
};

// Attendance API
export const attendanceApi = {
  getAll: () => fetchApi<AttendanceRecord[]>('/api/attendance'),
  
  clockIn: (employee_id: string) =>
    fetchApi<{ message: string; data: AttendanceRecord }>('/api/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify({ employee_id }),
    }),
  
  clockOut: (employee_id: string) =>
    fetchApi<{ message: string; total_hours: string; data: AttendanceRecord }>('/api/attendance/clock-out', {
      method: 'PUT',
      body: JSON.stringify({ employee_id }),
    }),
};

// Leave Request API
export const leaveApi = {
  getAll: () => fetchApi<LeaveRequest[]>('/api/leaves'),
  
  create: (data: {
    employee_id: string;
    leave_type: 'planned' | 'happy' | 'medical';
    start_date: string;
    end_date: string;
    reason?: string;
  }) =>
    fetchApi<{ message: string; data: LeaveRequest }>('/api/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateStatus: (id: string, status: 'approved' | 'rejected') =>
    fetchApi<{ message: string; data: LeaveRequest }>(`/api/leaves/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// New Member API - fetches from /api/members endpoint
export const newEmployeeApi = {
  getAll: (status?: 'pending' | 'approved' | 'rejected') => {
    const query = status ? `?status=${status}` : '';
    return fetchApi<NewEmployeeRequest[]>(`/api/members${query}`);
  },
  
  approve: (id: string) =>
    fetchApi<Employee>(`/api/members/${id}/approve`, {
      method: 'POST',
    }),
  
  reject: (id: string) =>
    fetchApi<void>(`/api/members/${id}/reject`, {
      method: 'POST',
    }),
  
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/api/members/${id}`, {
      method: 'DELETE',
    }),
};

// Holiday API
export const holidayApi = {
  getAll: () => fetchApi<Holiday[]>('/api/holidays'),
  
  create: (data: Omit<Holiday, 'id'>) =>
    fetchApi<{ message: string; data: Holiday }>('/api/holidays', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Holiday>) =>
    fetchApi<{ message: string; data: Holiday }>(`/api/holidays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/api/holidays/${id}`, {
      method: 'DELETE',
    }),
};

// Employees on Leave API (derived from leave requests)
export const employeesOnLeaveApi = {
  getAll: () => fetchApi<EmployeeOnLeave[]>('/api/leaves?status=approved'),
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
