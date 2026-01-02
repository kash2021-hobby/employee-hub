import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { holidayApi } from '@/services/api';
import type { Holiday } from '@/types/employee';

// Transform snake_case API response to camelCase frontend type
function transformHoliday(data: any): Holiday {
  return {
    id: data.id,
    name: data.name,
    date: data.date,
    description: data.description,
  };
}

export function useHolidays() {
  return useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const data = await holidayApi.getAll();
      return data.map(transformHoliday);
    },
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Holiday, 'id'>) => holidayApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Holiday> }) =>
      holidayApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => holidayApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}
