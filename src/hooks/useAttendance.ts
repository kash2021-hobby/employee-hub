import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, employeeApi } from '@/services/api';
import type { AttendanceRecord, AttendanceStatus, Employee } from '@/types/employee';

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
function transformAttendance(data: any, employeesMap: Map<string, Employee>): AttendanceRecord {
  const employee = employeesMap.get(data.employee_id);
  const shiftStart = employee?.workHours?.start || null;
  const signIn = data.sign_in;
  const status = determineStatus(signIn, shiftStart, data.status || '');
  
  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.Employee?.full_name || employee?.fullName || 'Unknown',
    department: data.Employee?.department || employee?.department || '',
    date: data.date,
    signInTime: signIn,
    signOutTime: data.sign_out,
    totalWorkingHours: data.total_hours ? parseFloat(data.total_hours) : null,
    status,
  };
}

// Transform employee API response
function transformEmployee(data: any): Employee {
  return {
    id: data.id,
    fullName: data.full_name,
    dateOfBirth: data.date_of_birth,
    joiningDate: data.joining_date,
    employmentType: data.employment_type,
    workRate: {
      value: parseFloat(data.work_rate_value) || 0,
      unit: data.work_rate_unit || 'hour',
    },
    position: data.position,
    department: data.department,
    shift: data.shift,
    workHours: {
      start: data.work_hours_start,
      end: data.work_hours_end,
    },
    phoneNumber: data.phone_number,
    idProofType: data.id_proof_type,
    idProofNumber: data.id_proof_number,
    allowedLeaves: data.allowed_leaves || 0,
    takenLeaves: data.taken_leaves || 0,
    latestSignIn: data.latest_sign_in,
    latestSignOut: data.latest_sign_out,
    status: data.status || 'active',
    email: data.email,
    address: data.address,
    profileImage: data.profile_image,
  };
}

export function useAttendance() {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      // Fetch both attendance and employees in parallel
      const [attendanceData, employeesData] = await Promise.all([
        attendanceApi.getAll(),
        employeeApi.getAll(),
      ]);
      
      // Create a map of employee ID to employee for quick lookup
      const employeesMap = new Map<string, Employee>();
      employeesData.forEach((emp: any) => {
        const transformed = transformEmployee(emp);
        employeesMap.set(transformed.id, transformed);
      });
      
      return attendanceData.map((record: any) => transformAttendance(record, employeesMap));
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
