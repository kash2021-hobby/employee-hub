import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/services/api';
import type { AttendanceRecord } from '@/types/employee';

// Transform snake_case API response to camelCase frontend type
function transformAttendance(data: any): AttendanceRecord {
  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.Employee?.full_name || 'Unknown',
    department: data.Employee?.department || '',
    date: data.date,
    signInTime: data.sign_in,
    signOutTime: data.sign_out,
    totalWorkingHours: data.total_hours ? parseFloat(data.total_hours) : null,
    status: data.status || 'present',
  };
}

export function useAttendance() {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const data = await attendanceApi.getAll();
      return data.map(transformAttendance);
    },
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (employeeId: string) => attendanceApi.clockIn(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (employeeId: string) => attendanceApi.clockOut(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}
