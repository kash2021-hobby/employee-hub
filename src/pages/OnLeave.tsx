import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/StatCard';
import { Input } from '@/components/ui/input';
import { useMockData } from '@/context/MockDataContext';
import type { EmployeeOnLeave } from '@/types/employee';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { Search, Calendar, CalendarDays, Users } from 'lucide-react';

export default function OnLeave() {
  const { employeesOnLeave } = useMockData();
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
            <span className="text-warning font-medium">
              {item.employeeName.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{item.employeeName}</p>
            <p className="text-sm text-muted-foreground">{item.department}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'leaveType',
      header: 'Leave Type',
      render: (item: EmployeeOnLeave) => <StatusBadge status={item.leaveType} />,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (item: EmployeeOnLeave) =>
        format(parseISO(item.startDate), 'MMM dd, yyyy'),
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (item: EmployeeOnLeave) =>
        format(parseISO(item.endDate), 'MMM dd, yyyy'),
    },
    {
      key: 'totalDays',
      header: 'Total Days',
      render: (item: EmployeeOnLeave) => (
        <span className="font-medium">{item.totalDays} day(s)</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Employees On Leave"
        description="View employees currently on leave"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total On Leave"
          value={stats.total}
          icon={Users}
          variant="warning"
        />
        <StatCard
          title="Planned Leave"
          value={stats.planned}
          icon={Calendar}
          variant="info"
        />
        <StatCard
          title="Medical Leave"
          value={stats.medical}
          icon={CalendarDays}
          variant="default"
        />
        <StatCard
          title="Happy Leave"
          value={stats.happy}
          icon={CalendarDays}
          variant="success"
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Date Range:</span>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[150px]"
            placeholder="Start"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[150px]"
            placeholder="End"
          />
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
