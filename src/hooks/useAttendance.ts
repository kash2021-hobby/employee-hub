import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/services/api';
import type { AttendanceRecord, AttendanceStatus } from '@/types/employee';

// Determine if employee is late based on sign-in time vs shift start
function determineStatus(signIn: string | null, shiftStart: string | null, existingStatus: string): AttendanceStatus {
  // If already marked as on-leave or absent, keep that status
  if (existingStatus === 'on-leave' || existingStatus === 'absent') {
    return existingStatus as AttendanceStatus;
  }
  
  // No sign-in means absent (unless on-leave)
  if (!signIn) {
    return 'absent';
  }
  
  // If we have shift start time, compare with sign-in
  if (shiftStart) {
    const signInDate = new Date(signIn);
    const signInTime = signInDate.getHours() * 60 + signInDate.getMinutes();
    
    // Parse shift start (format: "HH:mm" or "HH:mm:ss")
    const [hours, minutes] = shiftStart.split(':').map(Number);
    const shiftStartMinutes = hours * 60 + minutes;
    
    // If signed in after shift start, mark as late
    if (signInTime > shiftStartMinutes) {
      return 'late';
    }
  }
  
  return 'present';
}

// Transform snake_case API response to camelCase frontend type
function transformAttendance(data: any): AttendanceRecord {
  const shiftStart = data.Employee?.work_hours_start || null;
  const signIn = data.sign_in;
  const status = determineStatus(signIn, shiftStart, data.status || '');
  
  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.Employee?.full_name || 'Unknown',
    department: data.Employee?.department || '',
    date: data.date,
    signInTime: signIn,
    signOutTime: data.sign_out,
    totalWorkingHours: data.total_hours ? parseFloat(data.total_hours) : null,
    status,
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
