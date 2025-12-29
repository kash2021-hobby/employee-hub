import { cn } from '@/lib/utils';
import type { EmployeeStatus, AttendanceStatus, LeaveType } from '@/types/employee';

interface StatusBadgeProps {
  status: EmployeeStatus | AttendanceStatus | LeaveType | 'pending' | 'approved' | 'rejected';
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Employee Status
  active: { label: 'Active', className: 'status-active' },
  'on-leave': { label: 'On Leave', className: 'status-on-leave' },
  inactive: { label: 'Inactive', className: 'status-inactive' },
  
  // Attendance Status
  present: { label: 'Present', className: 'status-present' },
  late: { label: 'Late', className: 'status-late' },
  absent: { label: 'Absent', className: 'status-absent' },
  
  // Leave Types
  planned: { label: 'Planned', className: 'bg-info/10 text-info' },
  happy: { label: 'Happy Leave', className: 'bg-accent/10 text-accent' },
  medical: { label: 'Medical', className: 'bg-destructive/10 text-destructive' },
  
  // Request Status
  pending: { label: 'Pending', className: 'status-pending' },
  approved: { label: 'Approved', className: 'status-active' },
  rejected: { label: 'Rejected', className: 'status-absent' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
