import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/StatCard';
import { Input } from '@/components/ui/input';
import { useEmployeesOnLeave } from '@/hooks/useLeaves';
import { useIsMobile } from '@/hooks/use-mobile';
import type { EmployeeOnLeave } from '@/types/employee';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { Search, Calendar, CalendarDays, Users, Loader2 } from 'lucide-react';

export default function OnLeave() {
  const isMobile = useIsMobile();
  const { data: employeesOnLeave = [], isLoading } = useEmployeesOnLeave();
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter employees on leave
  const filteredEmployees = employeesOnLeave.filter((employee) => {
    const matchesSearch =
      employee.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDateRange = true;
    if (startDate && endDate) {
      const leaveStart = parseISO(employee.startDate);
      const leaveEnd = parseISO(employee.endDate);
      const filterStart = parseISO(startDate);
      const filterEnd = parseISO(endDate);

      // Check if leave period overlaps with filter range
      matchesDateRange =
        isWithinInterval(leaveStart, { start: filterStart, end: filterEnd }) ||
        isWithinInterval(leaveEnd, { start: filterStart, end: filterEnd }) ||
        isWithinInterval(filterStart, { start: leaveStart, end: leaveEnd });
    }

    return matchesSearch && matchesDateRange;
  });

  // Calculate stats by leave type
  const stats = {
    total: filteredEmployees.length,
    planned: filteredEmployees.filter((e) => e.leaveType === 'planned').length,
    medical: filteredEmployees.filter((e) => e.leaveType === 'medical').length,
    happy: filteredEmployees.filter((e) => e.leaveType === 'happy').length,
  };

  // Get unique departments
  const departmentBreakdown = filteredEmployees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const columns = [
    {
      key: 'employeeName',
      header: 'Employee',
      render: (item: EmployeeOnLeave) => (
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
            <span className="text-warning font-medium text-xs sm:text-sm">
              {item.employeeName.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{item.employeeName}</p>
            <p className="text-xs text-muted-foreground truncate">{item.department}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'leaveType',
      header: 'Type',
      render: (item: EmployeeOnLeave) => <StatusBadge status={item.leaveType} />,
    },
    ...(isMobile ? [] : [
      {
        key: 'startDate',
        header: 'Start',
        render: (item: EmployeeOnLeave) => format(parseISO(item.startDate), 'MMM dd'),
      },
      {
        key: 'endDate',
        header: 'End',
        render: (item: EmployeeOnLeave) => format(parseISO(item.endDate), 'MMM dd'),
      },
    ]),
    {
      key: 'totalDays',
      header: 'Days',
      render: (item: EmployeeOnLeave) => (
        <span className="font-medium text-sm">{item.totalDays}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Employees On Leave"
        description="View employees currently on leave"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard title="On Leave" value={stats.total} icon={Users} variant="warning" />
        <StatCard title="Planned" value={stats.planned} icon={Calendar} variant="info" />
        <StatCard title="Medical" value={stats.medical} icon={CalendarDays} variant="default" />
        <StatCard title="Happy" value={stats.happy} icon={CalendarDays} variant="success" />
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-sm text-muted-foreground">Date Range:</span>
          <div className="flex items-center gap-2 flex-1">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 sm:w-[140px] sm:flex-none"
              placeholder="Start"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 sm:w-[140px] sm:flex-none"
              placeholder="End"
            />
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      {Object.keys(departmentBreakdown).length > 0 && (
        <div className="mb-6 p-4 bg-card rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            BY DEPARTMENT
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(departmentBreakdown).map(([dept, count]) => (
              <div
                key={dept}
                className="px-3 py-1.5 bg-muted rounded-full text-sm"
              >
                <span className="font-medium">{dept}:</span>{' '}
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredEmployees.length} employee(s) on leave
      </p>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredEmployees}
        keyExtractor={(item) => item.id}
        emptyMessage="No employees currently on leave"
      />
    </div>
  );
}
