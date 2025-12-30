import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMockData } from '@/context/MockDataContext';
import { useToast } from '@/hooks/use-toast';
import type { EmploymentType, ShiftType, IdProofType } from '@/types/employee';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  fullName: string;
  dateOfBirth: string;
  joiningDate: string;
  employmentType: EmploymentType;
  workRateValue: number;
  position: string;
  department: string;
  shift: ShiftType;
  workHoursStart: string;
  workHoursEnd: string;
  phoneNumber: string;
  idProofType: IdProofType;
  idProofNumber: string;
  allowedLeaves: number;
  email: string;
  address: string;
}

const initialFormData: FormData = {
  fullName: '',
  dateOfBirth: '',
  joiningDate: '',
  employmentType: 'weekly',
  workRateValue: 0,
  position: '',
  department: '',
  shift: 'morning',
  workHoursStart: '09:00',
  workHoursEnd: '17:00',
  phoneNumber: '',
  idProofType: 'national-id',
  idProofNumber: '',
  allowedLeaves: 15,
  email: '',
  address: '',
};

export function AddEmployeeModal({ open, onOpenChange }: AddEmployeeModalProps) {
  const { addEmployee } = useMockData();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const getWorkRateUnit = (type: EmploymentType) => {
    switch (type) {
      case 'hourly': return 'hour';
      case 'daily': return 'day';
      case 'weekly': return 'week';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName.trim()) {
      toast({ title: 'Error', description: 'Full name is required', variant: 'destructive' });
      return;
    }
    if (!formData.dateOfBirth) {
      toast({ title: 'Error', description: 'Date of birth is required', variant: 'destructive' });
      return;
    }
    if (!formData.joiningDate) {
      toast({ title: 'Error', description: 'Joining date is required', variant: 'destructive' });
      return;
    }
    if (!formData.position.trim()) {
      toast({ title: 'Error', description: 'Position is required', variant: 'destructive' });
      return;
    }
    if (!formData.department.trim()) {
      toast({ title: 'Error', description: 'Department is required', variant: 'destructive' });
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast({ title: 'Error', description: 'Phone number is required', variant: 'destructive' });
      return;
    }
    if (!formData.idProofNumber.trim()) {
      toast({ title: 'Error', description: 'ID proof number is required', variant: 'destructive' });
      return;
    }

    addEmployee({
      fullName: formData.fullName.trim(),
      dateOfBirth: formData.dateOfBirth,
      joiningDate: formData.joiningDate,
      employmentType: formData.employmentType,
      workRate: {
        value: formData.workRateValue,
        unit: getWorkRateUnit(formData.employmentType),
      },
      position: formData.position.trim(),
      department: formData.department.trim(),
      shift: formData.shift,
      workHours: {
        start: formData.workHoursStart,
        end: formData.workHoursEnd,
      },
      phoneNumber: formData.phoneNumber.trim(),
      idProofType: formData.idProofType,
      idProofNumber: formData.idProofNumber.trim(),
      allowedLeaves: formData.allowedLeaves,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
    });

    toast({ title: 'Success', description: 'Employee added successfully' });
    setFormData(initialFormData);
    onOpenChange(false);
  };

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    placeholder="+1 555-0100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter address"
                  />
                </div>
              </div>
            </div>

            {/* ID Proof */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">ID Proof</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idProofType">ID Proof Type *</Label>
                  <Select value={formData.idProofType} onValueChange={(value) => handleChange('idProofType', value as IdProofType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="national-id">National ID</SelectItem>
                      <SelectItem value="driving-license">Driving License</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idProofNumber">ID Proof Number *</Label>
                  <Input
                    id="idProofNumber"
                    value={formData.idProofNumber}
                    onChange={(e) => handleChange('idProofNumber', e.target.value)}
                    placeholder="Enter ID number"
                  />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Employment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date *</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => handleChange('joiningDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    placeholder="Enter position"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <Select value={formData.employmentType} onValueChange={(value) => handleChange('employmentType', value as EmploymentType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workRateValue">
                    Work Rate ($ per {getWorkRateUnit(formData.employmentType)}) *
                  </Label>
                  <Input
                    id="workRateValue"
                    type="number"
                    min="0"
                    value={formData.workRateValue}
                    onChange={(e) => handleChange('workRateValue', parseFloat(e.target.value) || 0)}
                    placeholder="Enter rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedLeaves">Allowed Leaves (Annual) *</Label>
                  <Input
                    id="allowedLeaves"
                    type="number"
                    min="0"
                    value={formData.allowedLeaves}
                    onChange={(e) => handleChange('allowedLeaves', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Work Schedule */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Work Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shift">Shift *</Label>
                  <Select value={formData.shift} onValueChange={(value) => handleChange('shift', value as ShiftType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workHoursStart">Work Hours Start *</Label>
                  <Input
                    id="workHoursStart"
                    type="time"
                    value={formData.workHoursStart}
                    onChange={(e) => handleChange('workHoursStart', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workHoursEnd">Work Hours End *</Label>
                  <Input
                    id="workHoursEnd"
                    type="time"
                    value={formData.workHoursEnd}
                    onChange={(e) => handleChange('workHoursEnd', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Add Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
