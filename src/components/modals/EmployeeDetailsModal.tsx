import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAttendance } from '@/hooks/useAttendance';
import type { Employee } from '@/types/employee';
import { format, parseISO, differenceInMinutes, startOfMonth, endOfMonth } from 'date-fns';
import {
  User,
  Calendar,
  Briefcase,
  Clock,
  Phone,
  CreditCard,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { data: attendance = [] } = useAttendance();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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

  // Get attendance records for the selected month
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  
  const monthlyAttendance = attendance.filter((record) => {
    if (record.employeeId !== employee.id) return false;
    const recordDate = parseISO(record.date);
    return recordDate >= monthStart && recordDate <= monthEnd;
  });

  // Calculate daily pay for a record
  const calculateDailyPay = (signIn: string | null, signOut: string | null) => {
    if (!signIn || !signOut) return 0;
    const minutes = differenceInMinutes(parseISO(signOut), parseISO(signIn));
    const hours = minutes / 60;

    let pay = 0;
    switch (employee.employmentType) {
      case 'hourly':
        pay = hours * employee.workRate.value;
        break;
      case 'daily':
        pay = hours >= 4 ? employee.workRate.value : (hours / 8) * employee.workRate.value;
        break;
      case 'weekly':
        const dailyRate = employee.workRate.value / 5;
        pay = (hours / 8) * dailyRate;
        break;
    }
    return pay;
  };

  // Calculate monthly stats
  const monthlyStats = {
    present: monthlyAttendance.filter((a) => a.status === 'present').length,
    late: monthlyAttendance.filter((a) => a.status === 'late').length,
    absent: monthlyAttendance.filter((a) => a.status === 'absent').length,
    onLeave: monthlyAttendance.filter((a) => a.status === 'on-leave').length,
    totalPay: monthlyAttendance.reduce((sum, record) => {
      return sum + calculateDailyPay(record.signInTime, record.signOutTime);
    }, 0),
    totalHours: monthlyAttendance.reduce((sum, record) => {
      if (!record.signInTime || !record.signOutTime) return sum;
      return sum + differenceInMinutes(parseISO(record.signOutTime), parseISO(record.signInTime)) / 60;
    }, 0),
  };

  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

          {/* Monthly Attendance Summary */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Monthly Attendance
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {format(selectedMonth, 'MMMM yyyy')}
                </span>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Monthly Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{monthlyStats.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{monthlyStats.late}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{monthlyStats.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{monthlyStats.onLeave}</p>
                <p className="text-xs text-muted-foreground">On Leave</p>
              </div>
            </div>

            {/* Pay Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </div>
                <p className="text-xl font-bold text-foreground">{monthlyStats.totalHours.toFixed(1)}h</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-muted-foreground">Total Pay</p>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">${monthlyStats.totalPay.toFixed(2)}</p>
              </div>
            </div>

            {/* Daily Breakdown */}
            <ScrollArea className="h-[200px] rounded-lg border border-border">
              <div className="p-3">
                {monthlyAttendance.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No attendance records for this month</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">In</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Out</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyAttendance.map((record) => {
                        const pay = calculateDailyPay(record.signInTime, record.signOutTime);
                        return (
                          <tr key={record.id} className="border-b border-border last:border-0">
                            <td className="py-2">{format(parseISO(record.date), 'MMM dd')}</td>
                            <td className="py-2">{record.signInTime ? format(parseISO(record.signInTime), 'hh:mm a') : '-'}</td>
                            <td className="py-2">{record.signOutTime ? format(parseISO(record.signOutTime), 'hh:mm a') : '-'}</td>
                            <td className="py-2"><StatusBadge status={record.status} /></td>
                            <td className="py-2 text-right font-medium text-green-600 dark:text-green-400">
                              {pay > 0 ? `$${pay.toFixed(2)}` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Latest Attendance */}
          <div className="mt-6">
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
