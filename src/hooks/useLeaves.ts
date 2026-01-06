import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi, employeeApi } from '@/services/api';
import type { LeaveRequest, EmployeeOnLeave } from '@/types/employee';

// Transform snake_case API response to camelCase frontend type
function transformLeaveRequest(data: any): LeaveRequest {
  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.Employee?.full_name || 'Unknown',
    department: data.Employee?.department || '',
    leaveType: data.leave_type,
    startDate: data.start_date,
    endDate: data.end_date,
    reason: data.reason,
    status: data.status,
    createdAt: data.created_at,
  };
}

function transformToEmployeeOnLeave(data: any): EmployeeOnLeave {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.Employee?.full_name || 'Unknown',
    department: data.Employee?.department || '',
    leaveType: data.leave_type,
    startDate: data.start_date,
    endDate: data.end_date,
    totalDays,
  };
}

export function useLeaveRequests() {
  return useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const data = await leaveApi.getAll();
      return data.map(transformLeaveRequest);
    },
  });
}

export function useEmployeesOnLeave() {
  return useQuery({
    queryKey: ['leaves', 'on-leave'],
    queryFn: async () => {
      const data = await leaveApi.getAll();
      // Filter only approved leaves
      const approvedLeaves = data.filter((leave: any) => leave.status === 'approved');
      return approvedLeaves.map(transformToEmployeeOnLeave);
    },
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      employee_id: string;
      leave_type: 'planned' | 'happy' | 'medical';
      start_date: string;
      end_date: string;
      reason?: string;
    }) => leaveApi.create(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });
}

export function useUpdateLeaveStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, employeeId }: { id: string; status: 'approved' | 'rejected'; employeeId: string }) => {
      // Update leave status
      const result = await leaveApi.updateStatus(id, status);
      
      // Update employee status via PUT /api/employees/:id
      if (status === 'approved') {
        await employeeApi.update(employeeId, { status: 'on-leave' });
      }
      
      return result;
    },
    onSuccess: () => {
      // Invalidate leaves to update "On Leave" section
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      // Invalidate employees to update employee status
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
