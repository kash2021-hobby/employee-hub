import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Employee } from '@/types/employee';
import { useUpdateEmployee } from '@/hooks/useEmployees';
import { toast } from 'sonner';

interface EmployeeEditModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeEditModal({
  employee,
  open,
  onOpenChange,
}: EmployeeEditModalProps) {
  const updateEmployee = useUpdateEmployee();
  const [formData, setFormData] = useState<Partial<Employee>>({});

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
    }
  }, [employee]);

  if (!employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    try {
      await updateEmployee.mutateAsync({ id: formData.id, data: formData });
      toast.success('Employee updated successfully');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update employee');
    }
  };

  const handleChange = (field: keyof Employee, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWorkRateChange = (field: 'value' | 'unit', value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      workRate: {
        ...prev.workRate,
        value: field === 'value' ? Number(value) : prev.workRate?.value || 0,
        unit: field === 'unit' ? String(value) : prev.workRate?.unit || '/hr',
      },
    }));
  };

  const handleWorkHoursChange = (field: 'start' | 'end', value: string) => {
    setFormData((prev) => ({
      ...prev,
      workHours: {
        ...prev.workHours,
        start: field === 'start' ? value : prev.workHours?.start || '',
        end: field === 'end' ? value : prev.workHours?.end || '',
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName || ''}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* ID Proof */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">ID Proof</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idProofType">ID Proof Type</Label>
                <Select
                  value={formData.idProofType}
                  onValueChange={(value) => handleChange('idProofType', value)}
                >
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
                <Label htmlFor="idProofNumber">ID Proof Number</Label>
                <Input
                  id="idProofNumber"
                  value={formData.idProofNumber || ''}
                  onChange={(e) => handleChange('idProofNumber', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Employment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position || ''}
                  onChange={(e) => handleChange('position', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department || ''}
                  onChange={(e) => handleChange('department', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={formData.joiningDate || ''}
                  onChange={(e) => handleChange('joiningDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) => handleChange('employmentType', value)}
                >
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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Salary / Work Rate */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Salary / Work Rate</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workRateValue">Rate Amount ($)</Label>
                <Input
                  id="workRateValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.workRate?.value || 0}
                  onChange={(e) => handleWorkRateChange('value', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workRateUnit">Rate Unit</Label>
                <Select
                  value={formData.workRate?.unit || '/hr'}
                  onValueChange={(value) => handleWorkRateChange('unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/hr">/hr (Per Hour)</SelectItem>
                    <SelectItem value="/day">/day (Per Day)</SelectItem>
                    <SelectItem value="/week">/week (Per Week)</SelectItem>
                    <SelectItem value="/month">/month (Per Month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Work Schedule */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Work Schedule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select
                  value={formData.shift}
                  onValueChange={(value) => handleChange('shift', value)}
                >
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
                <Label htmlFor="workHoursStart">Work Start Time</Label>
                <Input
                  id="workHoursStart"
                  type="time"
                  value={formData.workHours?.start || ''}
                  onChange={(e) => handleWorkHoursChange('start', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workHoursEnd">Work End Time</Label>
                <Input
                  id="workHoursEnd"
                  type="time"
                  value={formData.workHours?.end || ''}
                  onChange={(e) => handleWorkHoursChange('end', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Leave Management */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Leave Management</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allowedLeaves">Allowed Leaves (per year)</Label>
                <Input
                  id="allowedLeaves"
                  type="number"
                  min="0"
                  value={formData.allowedLeaves || 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowedLeaves: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="takenLeaves">Taken Leaves</Label>
                <Input
                  id="takenLeaves"
                  type="number"
                  min="0"
                  value={formData.takenLeaves || 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      takenLeaves: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateEmployee.isPending}>
              {updateEmployee.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
