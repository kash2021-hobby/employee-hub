import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmployeeDetailsModal } from '@/components/modals/EmployeeDetailsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMockData } from '@/context/MockDataContext';
import type { Employee } from '@/types/employee';
import { format, parseISO } from 'date-fns';
import { Search, Eye, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Employees() {
  const { employees } = useMockData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get unique departments
  const departments = [...new Set(employees.map((e) => e.department))];

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment =
      departmentFilter === 'all' || employee.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Employee',
      render: (employee: Employee) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">
              {employee.fullName.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{employee.fullName}</p>
            <p className="text-sm text-muted-foreground">{employee.position}</p>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Department' },
    {
      key: 'employmentType',
      header: 'Type',
      render: (employee: Employee) => (
        <span className="capitalize">{employee.employmentType}</span>
      ),
    },
    {
      key: 'workRate',
      header: 'Rate',
      render: (employee: Employee) =>
        `$${employee.workRate.value}/${employee.workRate.unit}`,
    },
    {
      key: 'shift',
      header: 'Shift',
      render: (employee: Employee) => (
        <span className="capitalize">{employee.shift}</span>
      ),
    },
    {
      key: 'leaveBalance',
      header: 'Leave Balance',
      render: (employee: Employee) =>
        `${employee.allowedLeaves - employee.takenLeaves}/${employee.allowedLeaves}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (employee: Employee) => <StatusBadge status={employee.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (employee: Employee) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewEmployee(employee);
          }}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Employee Master Data"
        description="Manage and view all employee records"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, position, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredEmployees.length} of {employees.length} employees
      </p>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredEmployees}
        keyExtractor={(employee) => employee.id}
        emptyMessage="No employees found matching your criteria"
      />

      {/* Employee Details Modal */}
      <EmployeeDetailsModal
        employee={selectedEmployee}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
