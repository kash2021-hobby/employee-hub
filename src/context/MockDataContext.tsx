import { createContext, useContext, useState, ReactNode } from 'react';
import type {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  NewEmployeeRequest,
  Holiday,
  EmployeeOnLeave,
} from '@/types/employee';
import { format, differenceInDays, parseISO, isWithinInterval } from 'date-fns';

// Mock data for demonstration - In production, all data comes from backend APIs
const initialEmployees: Employee[] = [
  {
    id: '1',
    fullName: 'Sarah Johnson',
    dateOfBirth: '1990-05-15',
    joiningDate: '2022-01-10',
    employmentType: 'weekly',
    workRate: { value: 2500, unit: 'week' },
    position: 'Senior Developer',
    department: 'Engineering',
    shift: 'morning',
    workHours: { start: '09:00', end: '17:00' },
    phoneNumber: '+1 555-0101',
    idProofType: 'passport',
    idProofNumber: 'AB1234567',
    allowedLeaves: 20,
    takenLeaves: 5,
    latestSignIn: '2024-12-29T09:05:00',
    latestSignOut: null,
    status: 'active',
  },
  {
    id: '2',
    fullName: 'Michael Chen',
    dateOfBirth: '1988-11-22',
    joiningDate: '2021-06-15',
    employmentType: 'weekly',
    workRate: { value: 2800, unit: 'week' },
    position: 'Product Manager',
    department: 'Product',
    shift: 'morning',
    workHours: { start: '09:00', end: '18:00' },
    phoneNumber: '+1 555-0102',
    idProofType: 'driving-license',
    idProofNumber: 'DL789456',
    allowedLeaves: 22,
    takenLeaves: 8,
    latestSignIn: '2024-12-29T08:45:00',
    latestSignOut: null,
    status: 'active',
  },
  {
    id: '3',
    fullName: 'Emily Rodriguez',
    dateOfBirth: '1995-03-08',
    joiningDate: '2023-03-01',
    employmentType: 'hourly',
    workRate: { value: 45, unit: 'hour' },
    position: 'UI/UX Designer',
    department: 'Design',
    shift: 'morning',
    workHours: { start: '10:00', end: '18:00' },
    phoneNumber: '+1 555-0103',
    idProofType: 'national-id',
    idProofNumber: 'NID456789',
    allowedLeaves: 18,
    takenLeaves: 2,
    latestSignIn: null,
    latestSignOut: null,
    status: 'on-leave',
  },
  {
    id: '4',
    fullName: 'David Kim',
    dateOfBirth: '1992-07-19',
    joiningDate: '2020-09-01',
    employmentType: 'daily',
    workRate: { value: 350, unit: 'day' },
    position: 'DevOps Engineer',
    department: 'Engineering',
    shift: 'evening',
    workHours: { start: '14:00', end: '22:00' },
    phoneNumber: '+1 555-0104',
    idProofType: 'passport',
    idProofNumber: 'CD9876543',
    allowedLeaves: 20,
    takenLeaves: 12,
    latestSignIn: '2024-12-29T14:15:00',
    latestSignOut: null,
    status: 'active',
  },
  {
    id: '5',
    fullName: 'Jessica Williams',
    dateOfBirth: '1993-12-03',
    joiningDate: '2022-08-15',
    employmentType: 'weekly',
    workRate: { value: 2200, unit: 'week' },
    position: 'Marketing Specialist',
    department: 'Marketing',
    shift: 'morning',
    workHours: { start: '09:00', end: '17:00' },
    phoneNumber: '+1 555-0105',
    idProofType: 'driving-license',
    idProofNumber: 'DL123789',
    allowedLeaves: 18,
    takenLeaves: 6,
    latestSignIn: '2024-12-29T09:30:00',
    latestSignOut: null,
    status: 'active',
  },
];

const initialAttendance: AttendanceRecord[] = [
  {
    id: 'a1',
    employeeId: '1',
    employeeName: 'Sarah Johnson',
    department: 'Engineering',
    date: '2024-12-29',
    signInTime: '2024-12-29T09:05:00',
    signOutTime: null,
    totalWorkingHours: null,
    status: 'present',
  },
  {
    id: 'a2',
    employeeId: '2',
    employeeName: 'Michael Chen',
    department: 'Product',
    date: '2024-12-29',
    signInTime: '2024-12-29T08:45:00',
    signOutTime: null,
    totalWorkingHours: null,
    status: 'present',
  },
  {
    id: 'a3',
    employeeId: '3',
    employeeName: 'Emily Rodriguez',
    department: 'Design',
    date: '2024-12-29',
    signInTime: null,
    signOutTime: null,
    totalWorkingHours: null,
    status: 'on-leave',
  },
  {
    id: 'a4',
    employeeId: '4',
    employeeName: 'David Kim',
    department: 'Engineering',
    date: '2024-12-29',
    signInTime: '2024-12-29T14:15:00',
    signOutTime: null,
    totalWorkingHours: null,
    status: 'late',
  },
  {
    id: 'a5',
    employeeId: '5',
    employeeName: 'Jessica Williams',
    department: 'Marketing',
    date: '2024-12-29',
    signInTime: '2024-12-29T09:30:00',
    signOutTime: null,
    totalWorkingHours: null,
    status: 'late',
  },
];

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'l1',
    employeeId: '1',
    employeeName: 'Sarah Johnson',
    department: 'Engineering',
    leaveType: 'planned',
    startDate: '2025-01-06',
    endDate: '2025-01-10',
    reason: 'Family vacation',
    status: 'pending',
    createdAt: '2024-12-28T10:00:00',
  },
  {
    id: 'l2',
    employeeId: '4',
    employeeName: 'David Kim',
    department: 'Engineering',
    leaveType: 'medical',
    startDate: '2025-01-02',
    endDate: '2025-01-03',
    reason: 'Medical appointment',
    status: 'pending',
    createdAt: '2024-12-27T14:30:00',
  },
  {
    id: 'l3',
    employeeId: '5',
    employeeName: 'Jessica Williams',
    department: 'Marketing',
    leaveType: 'happy',
    startDate: '2025-01-15',
    endDate: '2025-01-15',
    reason: 'Birthday',
    status: 'pending',
    createdAt: '2024-12-26T09:00:00',
  },
];

const initialNewEmployeeRequests: NewEmployeeRequest[] = [
  {
    id: 'ne1',
    employeeData: {
      fullName: 'Alex Thompson',
      dateOfBirth: '1994-08-12',
      joiningDate: '2025-01-15',
      employmentType: 'weekly',
      workRate: { value: 2000, unit: 'week' },
      position: 'Junior Developer',
      department: 'Engineering',
      shift: 'morning',
      workHours: { start: '09:00', end: '17:00' },
      phoneNumber: '+1 555-0201',
      idProofType: 'passport',
      idProofNumber: 'EF5678901',
      allowedLeaves: 15,
    },
    status: 'pending',
    createdAt: '2024-12-28T11:00:00',
  },
  {
    id: 'ne2',
    employeeData: {
      fullName: 'Maria Garcia',
      dateOfBirth: '1991-02-28',
      joiningDate: '2025-01-20',
      employmentType: 'hourly',
      workRate: { value: 35, unit: 'hour' },
      position: 'Content Writer',
      department: 'Marketing',
      shift: 'morning',
      workHours: { start: '10:00', end: '18:00' },
      phoneNumber: '+1 555-0202',
      idProofType: 'national-id',
      idProofNumber: 'NID987654',
      allowedLeaves: 12,
    },
    status: 'pending',
    createdAt: '2024-12-27T16:00:00',
  },
];

const initialHolidays: Holiday[] = [
  { id: 'h1', name: "New Year's Day", date: '2025-01-01', description: 'Celebrate the new year' },
  { id: 'h2', name: 'Martin Luther King Jr. Day', date: '2025-01-20', description: 'Federal holiday' },
  { id: 'h3', name: "Presidents' Day", date: '2025-02-17', description: 'Federal holiday' },
  { id: 'h4', name: 'Memorial Day', date: '2025-05-26', description: 'Federal holiday' },
  { id: 'h5', name: 'Independence Day', date: '2025-07-04', description: 'National holiday' },
];

interface MockDataContextType {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  newEmployeeRequests: NewEmployeeRequest[];
  holidays: Holiday[];
  employeesOnLeave: EmployeeOnLeave[];
  
  // Actions
  approveLeave: (id: string) => void;
  rejectLeave: (id: string) => void;
  approveNewEmployee: (id: string) => void;
  rejectNewEmployee: (id: string) => void;
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  updateHoliday: (id: string, holiday: Partial<Holiday>) => void;
  deleteHoliday: (id: string) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [attendance] = useState(initialAttendance);
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [newEmployeeRequests, setNewEmployeeRequests] = useState(initialNewEmployeeRequests);
  const [holidays, setHolidays] = useState(initialHolidays);

  // Calculate employees currently on leave
  const employeesOnLeave: EmployeeOnLeave[] = employees
    .filter((emp) => emp.status === 'on-leave')
    .map((emp) => {
      const leaveRequest = leaveRequests.find(
        (lr) => lr.employeeId === emp.id && lr.status === 'approved'
      );
      return {
        id: `ol-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        department: emp.department,
        leaveType: leaveRequest?.leaveType || 'planned',
        startDate: leaveRequest?.startDate || format(new Date(), 'yyyy-MM-dd'),
        endDate: leaveRequest?.endDate || format(new Date(), 'yyyy-MM-dd'),
        totalDays: leaveRequest
          ? differenceInDays(parseISO(leaveRequest.endDate), parseISO(leaveRequest.startDate)) + 1
          : 1,
      };
    });

  // Add Emily's current leave
  if (employees.find((e) => e.id === '3' && e.status === 'on-leave')) {
    const existingLeave = employeesOnLeave.find((ol) => ol.employeeId === '3');
    if (!existingLeave) {
      employeesOnLeave.push({
        id: 'ol-3',
        employeeId: '3',
        employeeName: 'Emily Rodriguez',
        department: 'Design',
        leaveType: 'planned',
        startDate: '2024-12-27',
        endDate: '2024-12-31',
        totalDays: 5,
      });
    }
  }

  const approveLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === id ? { ...lr, status: 'approved' as const } : lr))
    );
    
    const request = leaveRequests.find((lr) => lr.id === id);
    if (request) {
      const today = new Date();
      const startDate = parseISO(request.startDate);
      const endDate = parseISO(request.endDate);
      
      if (isWithinInterval(today, { start: startDate, end: endDate })) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === request.employeeId
              ? { ...emp, status: 'on-leave' as const, takenLeaves: emp.takenLeaves + differenceInDays(endDate, startDate) + 1 }
              : emp
          )
        );
      }
    }
  };

  const rejectLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === id ? { ...lr, status: 'rejected' as const } : lr))
    );
  };

  const approveNewEmployee = (id: string) => {
    const request = newEmployeeRequests.find((r) => r.id === id);
    if (request) {
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        ...request.employeeData,
        status: 'active',
        takenLeaves: 0,
        latestSignIn: null,
        latestSignOut: null,
      };
      setEmployees((prev) => [...prev, newEmployee]);
      setNewEmployeeRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r))
      );
    }
  };

  const rejectNewEmployee = (id: string) => {
    setNewEmployeeRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r))
    );
  };

  const addHoliday = (holiday: Omit<Holiday, 'id'>) => {
    setHolidays((prev) => [
      ...prev,
      { ...holiday, id: `h-${Date.now()}` },
    ]);
  };

  const updateHoliday = (id: string, holiday: Partial<Holiday>) => {
    setHolidays((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...holiday } : h))
    );
  };

  const deleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...data } : emp))
    );
  };

  return (
    <MockDataContext.Provider
      value={{
        employees,
        attendance,
        leaveRequests,
        newEmployeeRequests,
        holidays,
        employeesOnLeave,
        approveLeave,
        rejectLeave,
        approveNewEmployee,
        rejectNewEmployee,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        updateEmployee,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within MockDataProvider');
  }
  return context;
}
