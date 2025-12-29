import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMockData } from '@/context/MockDataContext';
import type { AttendanceRecord } from '@/types/employee';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { DollarSign } from 'lucide-react';
import {
  Search,
  Calendar,
  Clock,
  UserCheck,
  AlertTriangle,
  UserX,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Attendance() {
  const { attendance, employees } = useMockData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState('2024-12-29');

  // Filter attendance
  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDate = record.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats
  const stats = {
    present: filteredAttendance.filter((a) => a.status === 'present').length,
    late: filteredAttendance.filter((a) => a.status === 'late').length,
    absent: filteredAttendance.filter((a) => a.status === 'absent').length,
    onLeave: filteredAttendance.filter((a) => a.status === 'on-leave').length,
  };

  const calculateWorkingHours = (signIn: string | null, signOut: string | null) => {
    if (!signIn || !signOut) return '-';
    const minutes = differenceInMinutes(parseISO(signOut), parseISO(signIn));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateDailyPay = (record: AttendanceRecord) => {
    const employee = employees.find((e) => e.id === record.employeeId);
    if (!employee || !record.signInTime || !record.signOutTime) return null;

    const minutes = differenceInMinutes(parseISO(record.signOutTime), parseISO(record.signInTime));
    const hours = minutes / 60;

    let pay = 0;
    switch (employee.employmentType) {
      case 'hourly':
        pay = hours * employee.workRate.value;
        break;
      case 'daily':
        // Full day rate if worked at least 4 hours, otherwise prorated
        pay = hours >= 4 ? employee.workRate.value : (hours / 8) * employee.workRate.value;
        break;
      case 'weekly':
        // Daily rate = weekly / 5, then prorate by hours
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
      render: (record: AttendanceRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">
              {record.employeeName.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{record.employeeName}</p>
            <p className="text-sm text-muted-foreground">{record.department}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (record: AttendanceRecord) => format(parseISO(record.date), 'MMM dd, yyyy'),
    },
    {
      key: 'signInTime',
      header: 'Sign In',
      render: (record: AttendanceRecord) =>
        record.signInTime ? format(parseISO(record.signInTime), 'hh:mm a') : '-',
    },
    {
      key: 'signOutTime',
      header: 'Sign Out',
      render: (record: AttendanceRecord) =>
        record.signOutTime ? format(parseISO(record.signOutTime), 'hh:mm a') : '-',
    },
    {
      key: 'totalWorkingHours',
      header: 'Working Hours',
      render: (record: AttendanceRecord) =>
        calculateWorkingHours(record.signInTime, record.signOutTime),
    },
    {
      key: 'status',
      header: 'Status',
      render: (record: AttendanceRecord) => <StatusBadge status={record.status} />,
    },
    {
      key: 'dailyPay',
      header: 'Daily Pay',
      render: (record: AttendanceRecord) => {
        const pay = calculateDailyPay(record);
        if (pay === null) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="font-semibold text-green-600 dark:text-green-400">
            ${pay.toFixed(2)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Attendance Monitoring"
        description="Track daily employee attendance and working hours"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Present"
          value={stats.present}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Late"
          value={stats.late}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Absent"
          value={stats.absent}
          icon={UserX}
          variant="default"
        />
        <StatCard
          title="On Leave"
          value={stats.onLeave}
          icon={Calendar}
          variant="info"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10 w-[180px]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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
