import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { HolidayFormModal } from '@/components/modals/HolidayFormModal';
import { useHolidays, useCreateHoliday, useUpdateHoliday, useDeleteHoliday } from '@/hooks/useHolidays';
import { useToast } from '@/hooks/use-toast';
import type { Holiday } from '@/types/employee';
import { format, parseISO, isPast, isFuture, isToday } from 'date-fns';
import { Plus, Pencil, Trash2, Calendar, CalendarCheck, CalendarX, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Holidays() {
  const { data: holidays = [], isLoading, error } = useHolidays();
  const createHoliday = useCreateHoliday();
  const updateHoliday = useUpdateHoliday();
  const deleteHolidayMutation = useDeleteHoliday();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  // Sort holidays by date
  const sortedHolidays = [...holidays].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );

  // Stats
  const upcomingCount = holidays.filter((h) => isFuture(parseISO(h.date))).length;
  const pastCount = holidays.filter((h) => isPast(parseISO(h.date)) && !isToday(parseISO(h.date))).length;
  const todayCount = holidays.filter((h) => isToday(parseISO(h.date))).length;

  const handleAddHoliday = () => {
    setSelectedHoliday(null);
    setIsFormOpen(true);
  };

  const handleEditHoliday = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: Omit<Holiday, 'id'>) => {
    try {
      if (selectedHoliday) {
        await updateHoliday.mutateAsync({ id: selectedHoliday.id, data });
        toast({
          title: 'Holiday Updated',
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        await createHoliday.mutateAsync(data);
        toast({
          title: 'Holiday Added',
          description: `${data.name} has been added to the calendar.`,
        });
      }
      setIsFormOpen(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedHoliday) {
      try {
        await deleteHolidayMutation.mutateAsync(selectedHoliday.id);
        toast({
          title: 'Holiday Deleted',
          description: `${selectedHoliday.name} has been removed.`,
          variant: 'destructive',
        });
        setIsDeleteOpen(false);
        setSelectedHoliday(null);
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to delete holiday',
          variant: 'destructive',
        });
      }
    }
  };

  const getHolidayStatus = (date: string) => {
    const holidayDate = parseISO(date);
    if (isToday(holidayDate)) return 'today';
    if (isFuture(holidayDate)) return 'upcoming';
    return 'past';
  };

  const columns = [
    {
      key: 'name',
      header: 'Holiday Name',
      render: (item: Holiday) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              getHolidayStatus(item.date) === 'today'
                ? 'bg-success/10'
                : getHolidayStatus(item.date) === 'upcoming'
                ? 'bg-primary/10'
                : 'bg-muted'
            }`}
          >
            <Calendar
              className={`w-5 h-5 ${
                getHolidayStatus(item.date) === 'today'
                  ? 'text-success'
                  : getHolidayStatus(item.date) === 'upcoming'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            {item.description && (
              <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (item: Holiday) => (
        <div>
          <p className="font-medium">{format(parseISO(item.date), 'EEEE')}</p>
          <p className="text-sm text-muted-foreground">
            {format(parseISO(item.date), 'MMMM dd, yyyy')}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Holiday) => {
        const status = getHolidayStatus(item.date);
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              status === 'today'
                ? 'bg-success/10 text-success'
                : status === 'upcoming'
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {status === 'today' && <CalendarCheck className="w-3 h-3" />}
            {status === 'upcoming' && <Calendar className="w-3 h-3" />}
            {status === 'past' && <CalendarX className="w-3 h-3" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Holiday) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleEditHoliday(item);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(item);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load holidays</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Please check your API connection'}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Holiday Management"
        description="Manage company holidays and observances"
        actions={
          <Button onClick={handleAddHoliday}>
            <Plus className="w-4 h-4 mr-2" />
            Add Holiday
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingCount}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-success/10 rounded-lg">
              <CalendarCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayCount}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-muted rounded-lg">
              <CalendarX className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pastCount}</p>
              <p className="text-sm text-muted-foreground">Past</p>
            </div>
          </div>
        </div>
      </div>

      {/* Holiday List */}
      <div className="bg-card rounded-xl border border-border p-6">
        <DataTable
          columns={columns}
          data={sortedHolidays}
          keyExtractor={(item) => item.id}
          emptyMessage="No holidays configured. Add your first holiday!"
        />
      </div>

      {/* Form Modal */}
      <HolidayFormModal
        holiday={selectedHoliday}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        loading={createHoliday.isPending || updateHoliday.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedHoliday?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteHolidayMutation.isPending}
            >
              {deleteHolidayMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
