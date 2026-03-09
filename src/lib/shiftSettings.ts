import type { ShiftSettings } from '@/types/employee';

const SHIFT_SETTINGS_KEY = 'shift_settings';

const DEFAULT_SHIFT: ShiftSettings = {
  startTime: '09:00',
  endTime: '18:00',
};

export function getShiftSettings(): ShiftSettings {
  try {
    const stored = localStorage.getItem(SHIFT_SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_SHIFT;
}

export function saveShiftSettings(settings: ShiftSettings): void {
  localStorage.setItem(SHIFT_SETTINGS_KEY, JSON.stringify(settings));
}

/** Parse "HH:mm" to total minutes from midnight */
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Get minutes from a Date object (hours*60 + minutes) */
export function getDateMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}
