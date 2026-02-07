import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/StatCard';
import { Input } from '@/components/ui/input';
import { useAttendance, type AttendanceWithBreaks } from '@/hooks/useAttendance';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeaveRequests } from '@/hooks/useLeaves';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, parseISO, differenceInMinutes, isWithinInterval } from 'date-fns';
import {
  Search,
  Calendar,
  UserCheck,
  AlertTriangle,
  UserX,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Attendance() {
  const isMobile = useIsMobile();
  const { data: attendance = [], isLoading, error } = useAttendance();
  const { data: employees = [] } = useEmployees();
  const { data: leaveRequests = [] } = useLeaveRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter attendance
  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDate = record.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats - late employees are also counted as present
  const lateCount = filteredAttendance.filter((a) => a.status === 'late').length;
  const presentOnTimeCount = filteredAttendance.filter((a) => a.status === 'present').length;
  const presentCount = presentOnTimeCount + lateCount;

  // Calculate on-leave for selected date from approved leave requests
  const selectedDateObj = parseISO(selectedDate);
  const onLeaveCount = leaveRequests.filter((leave) => {
    if (leave.status !== 'approved') return false;
    const start = parseISO(leave.startDate);
    const end = parseISO(leave.endDate);
    return isWithinInterval(selectedDateObj, { start, end });
  }).length;

  // Calculate absent: active employees - present - on leave
  const activeEmployees = employees.filter((e) => e.status === 'active').length;
  const absentCount = Math.max(0, activeEmployees - presentCount - onLeaveCount);

  const stats = {
    present: presentCount,
    late: lateCount,
    absent: absentCount,
    onLeave: onLeaveCount,
  };

  const formatHours = (hours: number | null) => {
    if (hours === null) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };
  const calculateDailyPay = (record: AttendanceWithBreaks) => {
    const employee = employees.find((e) => e.id === record.employeeId);
    if (!employee || !record.signInTime || !record.signOutTime) return null;

    const minutes = differenceInMinutes(new Date(record.signOutTime), new Date(record.signInTime));
    const hours = minutes / 60;

    let pay = 0;
    switch (employee.employmentType) {
      case 'hourly':
        pay = hours * employee.workRate.value;
        break;
      case 'daily':
        pay = hours >= 4 ? employee.workRate.value : (hours / 8) * employee.workRate.value;
        break;
      case 'weekly':
        const dailyRate = employee.workRate.value / 5;
        pay = (hours / 8) * dailyRate;
        break;
    }
    return pay;
  };

  const columns = [
    {
      key: 'employeeName',
      header: 'Employee',
      render: (record: AttendanceWithBreaks) => (
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-medium text-xs sm:text-sm">
              {record.employeeName.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{record.employeeName}</p>
            <p className="text-xs text-muted-foreground truncate">{record.department}</p>
          </div>
        </div>
      ),
    },
    ...(isMobile ? [] : [{
      key: 'date',
      header: 'Date',
      render: (record: AttendanceWithBreaks) => format(parseISO(record.date), 'MMM dd'),
    }]),
    {
      key: 'signInTime',
      header: 'In',
      render: (record: AttendanceWithBreaks) =>
        record.signInTime ? format(new Date(record.signInTime), 'h:mm a') : '-',
    },
    {
      key: 'signOutTime',
      header: 'Out',
      render: (record: AttendanceWithBreaks) =>
        record.signOutTime ? format(new Date(record.signOutTime), 'h:mm a') : '-',
    },
    ...(isMobile ? [] : [
      {
        key: 'workingHours',
        header: 'Hours',
        render: (record: AttendanceWithBreaks) => formatHours(record.workingHours),
      },
    ]),
    {
      key: 'status',
      header: 'Status',
      render: (record: AttendanceWithBreaks) => <StatusBadge status={record.status} />,
    },
    ...(isMobile ? [] : [{
      key: 'dailyPay',
      header: 'Pay',
      render: (record: AttendanceWithBreaks) => {
        const pay = calculateDailyPay(record);
        if (pay === null) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="font-semibold text-green-600 dark:text-green-400">
            ${pay.toFixed(2)}
          </span>
        );
      },
    }]),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load attendance data</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Please check your API connection'}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Attendance Monitoring"
        description="Track daily employee attendance and working hours"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard title="Present" value={stats.present} icon={UserCheck} variant="success" />
        <StatCard title="Late" value={stats.late} icon={AlertTriangle} variant="warning" />
        <StatCard title="Absent" value={stats.absent} icon={UserX} variant="default" />
        <StatCard title="On Leave" value={stats.onLeave} icon={Calendar} variant="info" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 w-full sm:w-[180px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredAttendance.length} records for{' '}
        {format(parseISO(selectedDate), 'MMMM dd, yyyy')}
      </p>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredAttendance}
        keyExtractor={(record) => record.id}
        emptyMessage="No attendance records found for the selected date"
      />
    </div>
  );
}
