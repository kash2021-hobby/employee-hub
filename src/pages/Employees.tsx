import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmployeeDetailsModal } from '@/components/modals/EmployeeDetailsModal';
import { EmployeeEditModal } from '@/components/modals/EmployeeEditModal';
import { AddEmployeeModal } from '@/components/modals/AddEmployeeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees';
import type { Employee } from '@/types/employee';
import { Search, Eye, Pencil, Filter, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Employees() {
  const { data: employees = [], isLoading, error } = useEmployees();
  const deleteEmployeeMutation = useDeleteEmployee();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const isMobile = useIsMobile();

  // Get unique departments
  const departments = [...new Set(employees.map((e) => e.department))].filter(Boolean) as string[];

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
    setIsViewModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      await deleteEmployeeMutation.mutateAsync(employee.id);
      toast({
        title: 'Employee Deleted',
        description: `${employee.fullName} has been removed.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete employee',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Employee',
      render: (employee: Employee) => (
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-medium text-xs sm:text-sm">
              {employee.fullName.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm sm:text-base truncate">
              {employee.fullName}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {employee.position}
            </p>
          </div>
        </div>
      ),
    },
    ...(isMobile
      ? []
      : [
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
              `$${employee.workRate.value}${employee.workRate.unit}`,
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
        ]),
    {
      key: 'status',
      header: 'Status',
      render: (employee: Employee) => <StatusBadge status={employee.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (employee: Employee) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewEmployee(employee);
            }}
            className="h-8 px-2 sm:px-3"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">View</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditEmployee(employee);
            }}
            className="h-8 px-2 sm:px-3"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEmployee(employee);
            }}
            className="h-8 px-2 sm:px-3 text-destructive hover:text-destructive"
            disabled={deleteEmployeeMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Delete</span>
          </Button>
        </div>
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load employees</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Please check your API connection'}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader
          title="Employee Master Data"
          description="Manage and view all employee records"
        />
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, position, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
            <SelectTrigger className="w-full sm:w-[180px]">
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
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
      />

      {/* Employee Edit Modal */}
      <EmployeeEditModal
        employee={selectedEmployee}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}
