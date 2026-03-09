import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, employeeApi, breakApi, type BreakRecord } from '@/services/api';
import type { AttendanceRecord, AttendanceStatus, Employee } from '@/types/employee';
import { getShiftSettings, parseTimeToMinutes, getDateMinutes } from '@/lib/shiftSettings';

export interface AttendanceWithBreaks extends AttendanceRecord {
  breakHours: number;
  availableHours: number | null;
  workingHours: number | null;
  breakInTime: string | null;
  breakOutTime: string | null;
  lateMinutes: number;
  overtimeMinutes: number;
}

/**
 * Smart status determination:
 * - on-leave / absent kept if already set
 * - No sign-in → absent
 * - Clock-in late + clock-out late enough to compensate → present
 * - Clock-in late + NOT compensated → late
 * - Clock-in on time + clock-out after shift end → overtime
 * - Otherwise → present
 */
function determineSmartStatus(
  signIn: string | null,
  signOut: string | null,
  existingStatus: string
): { status: AttendanceStatus; lateMinutes: number; overtimeMinutes: number } {
  if (existingStatus === 'on-leave') {
    return { status: 'on-leave', lateMinutes: 0, overtimeMinutes: 0 };
  }
  if (!signIn) {
    return { status: existingStatus === 'absent' ? 'absent' : 'absent', lateMinutes: 0, overtimeMinutes: 0 };
  }

  const shift = getShiftSettings();
  const shiftStartMin = parseTimeToMinutes(shift.startTime);
  const shiftEndMin = parseTimeToMinutes(shift.endTime);

  const signInDate = new Date(signIn);
  const signInMin = getDateMinutes(signInDate);
  const lateMinutes = Math.max(0, signInMin - shiftStartMin);

  let overtimeMinutes = 0;
  let status: AttendanceStatus = 'present';

  if (signOut) {
    const signOutDate = new Date(signOut);
    const signOutMin = getDateMinutes(signOutDate);
    const extraMinutes = Math.max(0, signOutMin - shiftEndMin);

    if (lateMinutes > 0) {
      // Late clock-in: did they compensate by staying late?
      if (extraMinutes >= lateMinutes) {
        status = 'present'; // compensated
        overtimeMinutes = Math.max(0, extraMinutes - lateMinutes);
      } else {
        status = 'late';
      }
    } else {
      // On-time clock-in
      if (extraMinutes > 0) {
        status = 'overtime';
        overtimeMinutes = extraMinutes;
      } else {
        status = 'present';
      }
    }
  } else {
    // No sign-out yet — just mark based on clock-in
    status = lateMinutes > 0 ? 'late' : 'present';
  }

  return { status, lateMinutes, overtimeMinutes };
}

// Transform snake_case API response to camelCase frontend type
function transformAttendance(data: any): AttendanceRecord & { lateMinutes: number; overtimeMinutes: number } {
  const signIn = data.sign_in;
  const signOut = data.sign_out;
  const { status, lateMinutes, overtimeMinutes } = determineSmartStatus(signIn, signOut, data.status || '');

  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.Employee?.full_name || 'Unknown',
    department: data.Employee?.department || '',
    date: data.date,
    signInTime: signIn,
    signOutTime: signOut,
    totalWorkingHours: data.total_hours ? parseFloat(data.total_hours) : null,
    status,
    lateMinutes,
    overtimeMinutes,
  };
}

// Map shift type to default start time
function getShiftStartTime(shift: string | null): string | null {
  if (!shift) return null;
  const shiftMap: Record<string, string> = {
    morning: '09:00',
    evening: '14:00',
    night: '22:00',
  };
  return shiftMap[shift.toLowerCase()] || null;
}

// Transform employee API response
function transformEmployee(data: any): Employee {
  const shiftStart = getShiftStartTime(data.shift);
  return {
    id: data.id,
    fullName: data.full_name,
    dateOfBirth: data.date_of_birth || data.dob,
    joiningDate: data.joining_date,
    employmentType: data.employment_type,
    workRate: {
      value: parseFloat(data.work_rate) || 0,
      unit: data.work_rate_unit || 'hour',
    },
    position: data.position,
    department: data.department,
    shift: data.shift,
    workHours: {
      start: data.work_hours_start || shiftStart,
      end: data.work_hours_end,
    },
    phoneNumber: data.phone_number || data.phone,
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

function getBreakMinutes(b: BreakRecord): number {
  if (typeof b.duration_minutes === 'number' && b.duration_minutes > 0) return b.duration_minutes;
  if (b.start_time && b.end_time) {
    const diffMs = new Date(b.end_time).getTime() - new Date(b.start_time).getTime();
    return Math.max(0, diffMs / 60000);
  }
  return 0;
}

export function useAttendance() {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: async (): Promise<AttendanceWithBreaks[]> => {
      const [attendanceData, employeesData, breaksData] = await Promise.all([
        attendanceApi.getAll(),
        employeeApi.getAll(),
        breakApi.getAll().catch(() => [] as BreakRecord[]),
      ]);

      const employeesMap = new Map<string, Employee>();
      const rawEmployees = Array.isArray(employeesData) ? employeesData : (employeesData as any)?.data ?? [];
      rawEmployees.forEach((emp: any) => {
        const transformed = transformEmployee(emp);
        employeesMap.set(transformed.id, transformed);
      });

      const breaksByEmployeeDate = new Map<string, { total: number; firstIn: string | null; lastOut: string | null }>();
      breaksData.forEach((breakRecord: BreakRecord) => {
        const key = `${breakRecord.employee_id}_${breakRecord.date}`;
        const existing = breaksByEmployeeDate.get(key) || { total: 0, firstIn: null, lastOut: null };
        const breakMinutes = getBreakMinutes(breakRecord);
        existing.total += breakMinutes / 60;
        if (breakRecord.start_time && (!existing.firstIn || breakRecord.start_time < existing.firstIn)) {
          existing.firstIn = breakRecord.start_time;
        }
        if (breakRecord.end_time && (!existing.lastOut || breakRecord.end_time > existing.lastOut)) {
          existing.lastOut = breakRecord.end_time;
        }
        breaksByEmployeeDate.set(key, existing);
      });

      return attendanceData.map((record: any) => {
        const baseRecord = transformAttendance(record);
        // Override employee name from our map if available
        const employee = employeesMap.get(baseRecord.employeeId);
        if (employee) {
          baseRecord.employeeName = employee.fullName || baseRecord.employeeName;
          baseRecord.department = employee.department || baseRecord.department;
        }

        const key = `${record.employee_id}_${record.date}`;
        const breakInfo = breaksByEmployeeDate.get(key) || { total: 0, firstIn: null, lastOut: null };

        const availableHours =
          baseRecord.signInTime && baseRecord.signOutTime
            ? Math.max(0, (new Date(baseRecord.signOutTime).getTime() - new Date(baseRecord.signInTime).getTime()) / 3600000)
            : null;

        const workingHours = availableHours === null ? null : Math.max(0, availableHours - breakInfo.total);

        return {
          ...baseRecord,
          breakHours: breakInfo.total,
          availableHours,
          workingHours,
          breakInTime: breakInfo.firstIn,
          breakOutTime: breakInfo.lastOut,
        };
      });
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
