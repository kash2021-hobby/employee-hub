import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { useMockData } from '@/context/MockDataContext';
import { useToast } from '@/hooks/use-toast';
import type { LeaveRequest, NewEmployeeRequest } from '@/types/employee';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Check, X, Calendar, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Notifications() {
  const {
    leaveRequests,
    newEmployeeRequests,
    approveLeave,
    rejectLeave,
    approveNewEmployee,
    rejectNewEmployee,
  } = useMockData();
  const { toast } = useToast();

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const pendingNewEmployees = newEmployeeRequests.filter((n) => n.status === 'pending');

  const handleApproveLeave = (id: string, employeeName: string) => {
    approveLeave(id);
    toast({
      title: 'Leave Approved',
      description: `Leave request for ${employeeName} has been approved.`,
    });
  };

  const handleRejectLeave = (id: string, employeeName: string) => {
    rejectLeave(id);
    toast({
      title: 'Leave Rejected',
      description: `Leave request for ${employeeName} has been rejected.`,
      variant: 'destructive',
    });
  };

  const handleApproveNewEmployee = (id: string, employeeName: string) => {
    approveNewEmployee(id);
    toast({
      title: 'Employee Approved',
      description: `${employeeName} has been added to the employee list.`,
    });
  };

  const handleRejectNewEmployee = (id: string, employeeName: string) => {
    rejectNewEmployee(id);
    toast({
      title: 'Employee Rejected',
      description: `Request for ${employeeName} has been rejected.`,
      variant: 'destructive',
    });
  };

  const leaveColumns = [
    {
      key: 'employeeName',
      header: 'Employee',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">
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
      render: (item: LeaveRequest) => <StatusBadge status={item.leaveType} />,
    },
    {
      key: 'dates',
      header: 'Duration',
      render: (item: LeaveRequest) => {
        const days = differenceInDays(parseISO(item.endDate), parseISO(item.startDate)) + 1;
        return (
          <div>
            <p className="font-medium">
              {format(parseISO(item.startDate), 'MMM dd')} -{' '}
              {format(parseISO(item.endDate), 'MMM dd, yyyy')}
            </p>
            <p className="text-sm text-muted-foreground">{days} day(s)</p>
          </div>
        );
      },
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item: LeaveRequest) => (
        <p className="max-w-[200px] truncate">{item.reason || '-'}</p>
      ),
    },
    {
      key: 'createdAt',
      header: 'Requested On',
      render: (item: LeaveRequest) =>
        format(parseISO(item.createdAt), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              handleApproveLeave(item.id, item.employeeName);
            }}
          >
            <Check className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleRejectLeave(item.id, item.employeeName);
            }}
          >
            <X className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const newEmployeeColumns = [
    {
      key: 'fullName',
      header: 'Employee',
      render: (item: NewEmployeeRequest) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-accent font-medium">
              {item.employeeData.fullName.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{item.employeeData.fullName}</p>
            <p className="text-sm text-muted-foreground">{item.employeeData.position}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (item: NewEmployeeRequest) => item.employeeData.department,
    },
    {
      key: 'employmentType',
      header: 'Type',
      render: (item: NewEmployeeRequest) => (
        <span className="capitalize">{item.employeeData.employmentType}</span>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Joining Date',
      render: (item: NewEmployeeRequest) =>
        format(parseISO(item.employeeData.joiningDate), 'MMM dd, yyyy'),
    },
    {
      key: 'createdAt',
      header: 'Requested On',
      render: (item: NewEmployeeRequest) =>
        format(parseISO(item.createdAt), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: NewEmployeeRequest) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              handleApproveNewEmployee(item.id, item.employeeData.fullName);
            }}
          >
            <Check className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleRejectNewEmployee(item.id, item.employeeData.fullName);
            }}
          >
            <X className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notifications Center"
        description="Review and manage pending approvals"
      />

      <Tabs defaultValue="leaves" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="leaves" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Leave Requests
            {pendingLeaves.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                {pendingLeaves.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            New Employees
            {pendingNewEmployees.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">
                {pendingNewEmployees.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaves">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Leave Requests</h2>
            <DataTable
              columns={leaveColumns}
              data={pendingLeaves}
              keyExtractor={(item) => item.id}
              emptyMessage="No pending leave requests"
            />
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Employee Approvals</h2>
            <DataTable
              columns={newEmployeeColumns}
              data={pendingNewEmployees}
              keyExtractor={(item) => item.id}
              emptyMessage="No pending employee approvals"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
