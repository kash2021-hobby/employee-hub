import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { useLeaveRequests, useUpdateLeaveStatus } from '@/hooks/useLeaves';
import { useNewEmployeeRequests, useRejectNewEmployee } from '@/hooks/useNewEmployees';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import type { LeaveRequest, NewEmployeeRequest } from '@/types/employee';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Check, X, Calendar, Loader2, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApproveEmployeeModal } from '@/components/modals/ApproveEmployeeModal';

export default function Notifications() {
  const isMobile = useIsMobile();
  const { data: leaveRequests = [], isLoading: leavesLoading, error: leavesError } = useLeaveRequests();
  const { data: newEmployeeRequests = [], isLoading: employeesLoading, error: employeesError } = useNewEmployeeRequests('pending');
  const updateLeaveStatus = useUpdateLeaveStatus();
  const rejectNewEmployee = useRejectNewEmployee();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<NewEmployeeRequest | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const pendingEmployeeRequests = newEmployeeRequests.filter((r) => r.status === 'pending');

  const handleApproveLeave = async (id: string, employeeId: string, employeeName: string) => {
    try {
      await updateLeaveStatus.mutateAsync({ id, status: 'approved' });
      toast({ title: 'Leave Approved', description: `Leave request for ${employeeName} has been approved.` });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleRejectLeave = async (id: string, employeeId: string, employeeName: string) => {
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
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-medium text-xs sm:text-sm">{item.employeeName.split(' ').map((n) => n[0]).join('')}</span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{item.employeeName}</p>
            <p className="text-xs text-muted-foreground truncate">{item.department}</p>
          </div>
        </div>
      ),
    },
    { key: 'leaveType', header: 'Type', render: (item: LeaveRequest) => <StatusBadge status={item.leaveType} /> },
    ...(isMobile ? [] : [{
      key: 'dates',
      header: 'Duration',
      render: (item: LeaveRequest) => {
        const days = differenceInDays(parseISO(item.endDate), parseISO(item.startDate)) + 1;
        return (
          <div>
            <p className="font-medium text-sm">{format(parseISO(item.startDate), 'MMM dd')} - {format(parseISO(item.endDate), 'MMM dd')}</p>
            <p className="text-xs text-muted-foreground">{days} day(s)</p>
          </div>
        );
      },
    }]),
    {
      key: 'actions',
      header: 'Actions',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-1 sm:gap-2">
          <Button size="sm" className="h-8 px-2 sm:px-3" onClick={(e) => { e.stopPropagation(); handleApproveLeave(item.id, item.employeeId, item.employeeName); }} disabled={updateLeaveStatus.isPending}>
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Approve</span>
          </Button>
          <Button size="sm" variant="destructive" className="h-8 px-2 sm:px-3" onClick={(e) => { e.stopPropagation(); handleRejectLeave(item.id, item.employeeId, item.employeeName); }} disabled={updateLeaveStatus.isPending}>
            <X className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Reject</span>
          </Button>
        </div>
      ),
    },
  ];

  const employeeRequestColumns = [
    {
      key: 'applicantName',
      header: 'Name',
      render: (item: NewEmployeeRequest) => (
        <span className="font-medium text-foreground text-sm">{item.employeeData.fullName}</span>
      ),
    },
    ...(isMobile ? [] : [{ 
      key: 'phone', 
      header: 'Phone', 
      render: (item: NewEmployeeRequest) => <span className="text-sm">{item.employeeData.phoneNumber || '-'}</span> 
    }]),
    {
      key: 'actions',
      header: 'Actions',
      render: (item: NewEmployeeRequest) => (
        <div className="flex items-center gap-1 sm:gap-2">
          <Button size="sm" className="h-8 px-2 sm:px-3" onClick={(e) => { e.stopPropagation(); handleApproveNewEmployee(item); }}>
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Approve</span>
          </Button>
          <Button size="sm" variant="destructive" className="h-8 px-2 sm:px-3" onClick={(e) => { e.stopPropagation(); handleRejectNewEmployee(item.id, item.employeeData.fullName); }}>
            <X className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Reject</span>
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
      <PageHeader title="Notifications" description="Review and manage pending approvals" />
      <Tabs defaultValue="leaves" className="w-full">
        <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-2 sm:flex">
          <TabsTrigger value="leaves" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Leaves</span>
            {pendingLeaves.length > 0 && <span className="px-1.5 sm:px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{pendingLeaves.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Employees</span>
            {pendingEmployeeRequests.length > 0 && <span className="px-1.5 sm:px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{pendingEmployeeRequests.length}</span>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaves">
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Pending Leave Requests</h2>
            <DataTable columns={leaveColumns} data={pendingLeaves} keyExtractor={(item) => item.id} emptyMessage="No pending leave requests" />
          </div>
        </TabsContent>
        <TabsContent value="employees">
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Pending Employee Applications</h2>
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
