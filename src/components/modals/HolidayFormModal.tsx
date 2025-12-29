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
import type { Holiday } from '@/types/employee';
import { Loader2 } from 'lucide-react';

interface HolidayFormModalProps {
  holiday?: Holiday | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Holiday, 'id'>) => Promise<void>;
  loading?: boolean;
}

export function HolidayFormModal({
  holiday,
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: HolidayFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
  });

  useEffect(() => {
    if (holiday) {
      setFormData({
        name: holiday.name,
        date: holiday.date,
        description: holiday.description || '',
      });
    } else {
      setFormData({
        name: '',
        date: '',
        description: '',
      });
    }
  }, [holiday, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {holiday ? 'Edit Holiday' : 'Add New Holiday'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Holiday Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., New Year's Day"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {holiday ? 'Update Holiday' : 'Add Holiday'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
