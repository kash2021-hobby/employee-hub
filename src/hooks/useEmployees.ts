import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '@/services/api';
import type { Employee } from '@/types/employee';

// Transform snake_case API response to camelCase frontend type
function transformEmployee(data: any): Employee {
  return {
    id: data.id,
    fullName: data.full_name,
    dateOfBirth: data.dob || '',
    joiningDate: data.joining_date,
    employmentType: data.employment_type,
    workRate: {
      value: parseFloat(data.work_rate) || 0,
      unit: data.employment_type === 'hourly' ? '/hour' : data.employment_type === 'daily' ? '/day' : '/week',
    },
    position: data.position || '',
    department: data.department || '',
    shift: data.shift || 'morning',
    workHours: {
      start: data.work_hours_start || '09:00',
      end: data.work_hours_end || '17:00',
    },
    phoneNumber: data.phone || '',
    idProofType: data.id_proof_type || 'national-id',
    idProofNumber: data.id_proof_number || '',
    allowedLeaves: data.allowed_leaves || 12,
    takenLeaves: data.taken_leaves || 0,
    latestSignIn: data.latest_sign_in || null,
    latestSignOut: data.latest_sign_out || null,
    status: data.status || 'active',
    email: data.email,
    address: data.address,
    profileImage: data.profile_image,
  };
}

// Transform camelCase frontend data to snake_case for API
function transformToApi(data: Partial<Employee>): any {
  const result: any = {};
  if (data.fullName !== undefined) result.full_name = data.fullName;
  if (data.dateOfBirth !== undefined) result.dob = data.dateOfBirth;
  if (data.joiningDate !== undefined) result.joining_date = data.joiningDate;
  if (data.employmentType !== undefined) result.employment_type = data.employmentType;
  if (data.workRate !== undefined) {
    result.work_rate = data.workRate.value;
    result.work_rate_unit = data.workRate.unit;
  }
  if (data.position !== undefined) result.position = data.position;
  if (data.department !== undefined) result.department = data.department;
  if (data.shift !== undefined) result.shift = data.shift;
  if (data.workHours !== undefined) {
    result.work_hours_start = data.workHours.start;
    result.work_hours_end = data.workHours.end;
  }
  if (data.phoneNumber !== undefined) result.phone = data.phoneNumber;
  if (data.idProofType !== undefined) result.id_proof_type = data.idProofType;
  if (data.idProofNumber !== undefined) result.id_proof_number = data.idProofNumber;
  if (data.allowedLeaves !== undefined) result.allowed_leaves = data.allowedLeaves;
  if (data.takenLeaves !== undefined) result.taken_leaves = data.takenLeaves;
  if (data.status !== undefined) result.status = data.status;
  if (data.email !== undefined) result.email = data.email;
  if (data.address !== undefined) result.address = data.address;
  return result;
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const data = await employeeApi.getAll();
      return data.map(transformEmployee);
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Employee, 'id'>) => {
      const apiData = transformToApi(data);
      return employeeApi.create(apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Employee> }) => {
      const apiData = transformToApi(data);
      return employeeApi.update(id, apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
