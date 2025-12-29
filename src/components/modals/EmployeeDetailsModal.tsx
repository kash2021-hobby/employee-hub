import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Employee } from '@/types/employee';
import { format, parseISO } from 'date-fns';
import {
  User,
  Calendar,
  Briefcase,
  Clock,
  Phone,
  CreditCard,
  CalendarDays,
} from 'lucide-react';

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value || '-'}</p>
      </div>
    </div>
  );
}

export function EmployeeDetailsModal({
  employee,
  open,
  onOpenChange,
}: EmployeeDetailsModalProps) {
  if (!employee) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    try {
      return format(parseISO(timeString), 'hh:mm a');
    } catch {
      return timeString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{employee.fullName}</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {employee.position} • {employee.department}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-6">
            <StatusBadge status={employee.status} />
            <span className="text-sm text-muted-foreground">
              Joined {formatDate(employee.joiningDate)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Personal Information
              </h3>
              <DetailRow
                icon={Calendar}
                label="Date of Birth"
                value={formatDate(employee.dateOfBirth)}
              />
              <DetailRow
                icon={Phone}
                label="Phone Number"
                value={employee.phoneNumber}
              />
              <DetailRow
                icon={CreditCard}
                label={`ID Proof (${employee.idProofType.replace('-', ' ')})`}
                value={employee.idProofNumber}
              />
            </div>

            {/* Work Information */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Work Information
              </h3>
              <DetailRow
                icon={Briefcase}
                label="Employment Type"
                value={`${employee.employmentType.charAt(0).toUpperCase() + employee.employmentType.slice(1)} - $${employee.workRate.value}/${employee.workRate.unit}`}
              />
              <DetailRow
                icon={Clock}
                label="Shift & Hours"
                value={`${employee.shift.charAt(0).toUpperCase() + employee.shift.slice(1)} (${employee.workHours.start} - ${employee.workHours.end})`}
              />
              <DetailRow
                icon={CalendarDays}
                label="Leave Balance"
                value={`${employee.takenLeaves}/${employee.allowedLeaves} used`}
              />
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Latest Attendance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Last Sign In</p>
                <p className="font-semibold text-foreground mt-1">
                  {formatTime(employee.latestSignIn)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Last Sign Out</p>
                <p className="font-semibold text-foreground mt-1">
                  {formatTime(employee.latestSignOut)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
