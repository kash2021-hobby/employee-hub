import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { useLeaveRequests, useUpdateLeaveStatus } from '@/hooks/useLeaves';
import { useNewEmployeeRequests, useRejectNewEmployee } from '@/hooks/useNewEmployees';
import { useToast } from '@/hooks/use-toast';
import type { LeaveRequest, NewEmployeeRequest } from '@/types/employee';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Check, X, Calendar, Loader2, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApproveEmployeeModal } from '@/components/modals/ApproveEmployeeModal';

export default function Notifications() {
  const { data: leaveRequests = [], isLoading: leavesLoading, error: leavesError } = useLeaveRequests();
  const { data: newEmployeeRequests = [], isLoading: employeesLoading, error: employeesError } = useNewEmployeeRequests('pending');
  const updateLeaveStatus = useUpdateLeaveStatus();
  const rejectNewEmployee = useRejectNewEmployee();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<NewEmployeeRequest | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const pendingEmployeeRequests = newEmployeeRequests.filter((r) => r.status === 'pending');

  const handleApproveLeave = async (id: string, employeeName: string) => {
    try {
      await updateLeaveStatus.mutateAsync({ id, status: 'approved' });
      toast({ title: 'Leave Approved', description: `Leave request for ${employeeName} has been approved.` });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleRejectLeave = async (id: string, employeeName: string) => {
    try {
      await updateLeaveStatus.mutateAsync({ id, status: 'rejected' });
      toast({ title: 'Leave Rejected', description: `Leave request for ${employeeName} has been rejected.`, variant: 'destructive' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to reject', variant: 'destructive' });
    }
  };

  const handleApproveNewEmployee = (request: NewEmployeeRequest) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const handleRejectNewEmployee = async (id: string, name: string) => {
    try {
      await rejectNewEmployee.mutateAsync(id);
      toast({ title: 'Request Rejected', description: `Application from ${name} has been rejected.`, variant: 'destructive' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to reject', variant: 'destructive' });
    }
  };

  const leaveColumns = [
    {
      key: 'employeeName',
      header: 'Employee',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">{item.employeeName.split(' ').map((n) => n[0]).join('')}</span>
          </div>
          <div>
            <p className="font-medium text-foreground">{item.employeeName}</p>
            <p className="text-sm text-muted-foreground">{item.department}</p>
          </div>
        </div>
      ),
    },
    { key: 'leaveType', header: 'Leave Type', render: (item: LeaveRequest) => <StatusBadge status={item.leaveType} /> },
    {
      key: 'dates',
      header: 'Duration',
      render: (item: LeaveRequest) => {
        const days = differenceInDays(parseISO(item.endDate), parseISO(item.startDate)) + 1;
        return (
          <div>
            <p className="font-medium">{format(parseISO(item.startDate), 'MMM dd')} - {format(parseISO(item.endDate), 'MMM dd, yyyy')}</p>
            <p className="text-sm text-muted-foreground">{days} day(s)</p>
          </div>
        );
      },
    },
    { key: 'reason', header: 'Reason', render: (item: LeaveRequest) => <p className="max-w-[200px] truncate">{item.reason || '-'}</p> },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={(e) => { e.stopPropagation(); handleApproveLeave(item.id, item.employeeName); }} disabled={updateLeaveStatus.isPending}>
            <Check className="w-4 h-4 mr-1" />Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleRejectLeave(item.id, item.employeeName); }} disabled={updateLeaveStatus.isPending}>
            <X className="w-4 h-4 mr-1" />Reject
          </Button>
        </div>
      ),
    },
  ];

  const employeeRequestColumns = [
    {
      key: 'applicantName',
      header: 'Applicant',
      render: (item: NewEmployeeRequest) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">{item.employeeData.fullName.split(' ').map((n) => n[0]).join('')}</span>
          </div>
          <div>
            <p className="font-medium text-foreground">{item.employeeData.fullName}</p>
            <p className="text-sm text-muted-foreground">{item.employeeData.position}</p>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Department', render: (item: NewEmployeeRequest) => <span>{item.employeeData.department}</span> },
    { key: 'employmentType', header: 'Type', render: (item: NewEmployeeRequest) => <span className="capitalize">{item.employeeData.employmentType}</span> },
    { key: 'createdAt', header: 'Applied', render: (item: NewEmployeeRequest) => <span>{format(parseISO(item.createdAt), 'MMM dd, yyyy')}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: NewEmployeeRequest) => (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={(e) => { e.stopPropagation(); handleApproveNewEmployee(item); }}>
            <Check className="w-4 h-4 mr-1" />Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleRejectNewEmployee(item.id, item.employeeData.fullName); }}>
            <X className="w-4 h-4 mr-1" />Reject
          </Button>
        </div>
      ),
    },
  ];

  const isLoading = leavesLoading || employeesLoading;
  const error = leavesError || employeesError;

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error) return <div className="flex flex-col items-center justify-center h-64 gap-4"><p className="text-destructive">Failed to load data</p></div>;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Notifications Center" description="Review and manage pending approvals" />
      <Tabs defaultValue="leaves" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="leaves" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />Leave Requests
            {pendingLeaves.length > 0 && <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{pendingLeaves.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />New Employees
            {pendingEmployeeRequests.length > 0 && <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{pendingEmployeeRequests.length}</span>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaves">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Leave Requests</h2>
            <DataTable columns={leaveColumns} data={pendingLeaves} keyExtractor={(item) => item.id} emptyMessage="No pending leave requests" />
          </div>
        </TabsContent>
        <TabsContent value="employees">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Employee Applications</h2>
            <DataTable columns={employeeRequestColumns} data={pendingEmployeeRequests} keyExtractor={(item) => item.id} emptyMessage="No pending employee applications" />
          </div>
        </TabsContent>
      </Tabs>
      <ApproveEmployeeModal
        request={selectedRequest}
        open={approveModalOpen}
        onOpenChange={setApproveModalOpen}
      />
    </div>
  );
}
