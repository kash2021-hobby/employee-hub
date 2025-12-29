import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useMockData } from '@/context/MockDataContext';
import {
  Users,
  UserCheck,
  CalendarDays,
  Bell,
  Clock,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { LeaveRequest, AttendanceRecord } from '@/types/employee';

export default function Dashboard() {
  const {
    employees,
    attendance,
    leaveRequests,
    newEmployeeRequests,
    employeesOnLeave,
  } = useMockData();

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((e) => e.status === 'active').length,
    onLeaveToday: employeesOnLeave.length,
    pendingLeaveRequests: leaveRequests.filter((l) => l.status === 'pending').length,
    pendingNewEmployees: newEmployeeRequests.filter((n) => n.status === 'pending').length,
    presentToday: attendance.filter((a) => a.status === 'present').length,
    lateToday: attendance.filter((a) => a.status === 'late').length,
    absentToday: attendance.filter((a) => a.status === 'absent').length,
  };

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending').slice(0, 5);
  const todayAttendance = attendance.slice(0, 5);

  const leaveColumns = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'department', header: 'Department' },
    {
      key: 'leaveType',
      header: 'Type',
      render: (item: LeaveRequest) => <StatusBadge status={item.leaveType} />,
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (item: LeaveRequest) =>
        `${format(parseISO(item.startDate), 'MMM dd')} - ${format(parseISO(item.endDate), 'MMM dd')}`,
    },
  ];

  const attendanceColumns = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'department', header: 'Department' },
    {
      key: 'signInTime',
      header: 'Sign In',
      render: (item: AttendanceRecord) =>
        item.signInTime ? format(parseISO(item.signInTime), 'hh:mm a') : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AttendanceRecord) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description={`Overview for ${format(new Date(), 'EEEE, MMMM dd, yyyy')}`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Active Today"
          value={stats.activeEmployees}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="On Leave"
          value={stats.onLeaveToday}
          icon={CalendarDays}
          variant="warning"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingLeaveRequests + stats.pendingNewEmployees}
          icon={Bell}
          variant="info"
        />
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon={Clock}
          variant="success"
        />
        <StatCard
          title="Late Today"
          value={stats.lateToday}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Absent Today"
          value={stats.absentToday}
          icon={UserX}
          variant="default"
        />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Leave Requests</h2>
            <span className="text-sm text-muted-foreground">
              {stats.pendingLeaveRequests} pending
            </span>
          </div>
          <DataTable
            columns={leaveColumns}
            data={pendingLeaves}
            keyExtractor={(item) => item.id}
            emptyMessage="No pending leave requests"
          />
        </div>

        {/* Today's Attendance */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Attendance</h2>
            <span className="text-sm text-muted-foreground">
              {format(new Date(), 'MMM dd, yyyy')}
            </span>
          </div>
          <DataTable
            columns={attendanceColumns}
            data={todayAttendance}
            keyExtractor={(item) => item.id}
            emptyMessage="No attendance records"
          />
        </div>
      </div>
    </div>
  );
}
