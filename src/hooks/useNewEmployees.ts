import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newEmployeeApi, employeeApi } from '@/services/api';
import type { NewEmployeeRequest, Employee } from '@/types/employee';

// Transform snake_case API response to camelCase frontend type
function transformNewEmployeeRequest(data: any): NewEmployeeRequest {
  return {
    id: data.id,
    employeeData: {
      fullName: data.name || data.full_name || '',
      dateOfBirth: data.dob || '',
      joiningDate: data.joining_date || '',
      employmentType: data.employment_type,
      workRate: {
        value: parseFloat(data.work_rate) || 0,
        unit: data.employment_type === 'hourly' ? 'hour' : data.employment_type === 'daily' ? 'day' : 'week',
      },
      position: data.position || '',
      department: data.department || '',
      shift: data.shift || 'morning',
      workHours: {
        start: data.work_hours_start || '09:00',
        end: data.work_hours_end || '17:00',
      },
      phoneNumber: data.number || data.phone || '',
      idProofType: data.id_proof_type || 'national-id',
      idProofNumber: data.id_proof_number || '',
      allowedLeaves: data.allowed_leaves || 12,
    },
    status: data.status || 'pending',
    createdAt: data.created_at,
  };
}

export function useNewEmployeeRequests(status?: 'pending' | 'approved' | 'rejected') {
  return useQuery({
    queryKey: ['new-employees', status],
    queryFn: async () => {
      const data = await newEmployeeApi.getAll(status);
      return data.map(transformNewEmployeeRequest);
    },
  });
}

export function useApproveNewEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      // Backend handles creating employee and deleting member in one call
      return newEmployeeApi.approve(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useRejectNewEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => newEmployeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-employees'] });
    },
  });
}
