export type EmploymentType = 'hourly' | 'daily' | 'weekly';
export type ShiftType = 'morning' | 'evening' | 'night' | 'custom';
export type EmployeeStatus = 'active' | 'on-leave' | 'inactive';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'on-leave';
export type LeaveType = 'planned' | 'happy' | 'medical';
export type IdProofType = 'passport' | 'national-id' | 'driving-license' | 'other';

export interface Employee {
  id: string;
  fullName: string;
  dateOfBirth: string;
  joiningDate: string;
  employmentType: EmploymentType;
  workRate: {
    value: number;
    unit: string;
  };
  position: string;
  department: string;
  shift: ShiftType;
  workHours: {
    start: string;
    end: string;
  };
  phoneNumber: string;
  idProofType: IdProofType;
  idProofNumber: string;
  allowedLeaves: number;
  takenLeaves: number;
  latestSignIn: string | null;
  latestSignOut: string | null;
  status: EmployeeStatus;
  email?: string;
  address?: string;
  profileImage?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  signInTime: string | null;
  signOutTime: string | null;
  totalWorkingHours: number | null;
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface NewEmployeeRequest {
  id: string;
  employeeData: Omit<Employee, 'id' | 'status' | 'latestSignIn' | 'latestSignOut' | 'takenLeaves'>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
}

export interface EmployeeOnLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
}
