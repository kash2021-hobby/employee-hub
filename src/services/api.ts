import { supabase } from '@/lib/supabase'
import type {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  NewEmployeeRequest,
  Holiday,
  EmployeeOnLeave,
} from '@/types/employee'

/* =========================
   EMPLOYEES
========================= */
export const employeeApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Employee[]
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Employee
  },

  create: async (data: Omit<Employee, 'id'>) => {
    const { data: result, error } = await supabase
      .from('employees')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result as Employee
  },

  update: async (id: string, data: Partial<Employee>) => {
    const { data: result, error } = await supabase
      .from('employees')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result as Employee
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

/* =========================
   ATTENDANCE
========================= */
export const attendanceApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, employees(full_name, department)')

    if (error) throw error
    return data as AttendanceRecord[]
  },

  clockIn: async (employee_id: string) => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id,
        date: today,
        sign_in: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data as AttendanceRecord
  },

  clockOut: async (employee_id: string) => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('attendance')
      .update({
        sign_out: new Date().toISOString(),
      })
      .eq('employee_id', employee_id)
      .eq('date', today)
      .select()
      .single()

    if (error) throw error
    return data as AttendanceRecord
  },
}

/* =========================
   LEAVES
========================= */
export const leaveApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*, employees(full_name, department)')

    if (error) throw error
    return data as LeaveRequest[]
  },

  create: async (data: Omit<LeaveRequest, 'id' | 'status'>) => {
    const { data: result, error } = await supabase
      .from('leave_requests')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result as LeaveRequest
  },

  updateStatus: async (id: string, status: 'approved' | 'rejected') => {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as LeaveRequest
  },
}

/* =========================
   HOLIDAYS
========================= */
export const holidayApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .order('date')

    if (error) throw error
    return data as Holiday[]
  },

  create: async (data: Omit<Holiday, 'id'>) => {
    const { data: result, error } = await supabase
      .from('holidays')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result as Holiday
  },

  update: async (id: string, data: Partial<Holiday>) => {
    const { data: result, error } = await supabase
      .from('holidays')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result as Holiday
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('holidays')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

/* =========================
   NEW EMPLOYEES / MEMBERS
========================= */
export const newEmployeeApi = {
  getAll: async (status?: 'pending' | 'approved' | 'rejected') => {
    let query = supabase
      .from('new_members')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data as NewEmployeeRequest[]
  },

  approve: async (id: string) => {
    const { data, error } = await supabase
      .from('new_members')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  reject: async (id: string) => {
    const { data, error } = await supabase
      .from('new_members')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('new_members')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
