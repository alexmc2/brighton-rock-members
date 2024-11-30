// lib/stores/calendar-store.ts

import { create } from 'zustand';

interface CalendarStore {
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),
})); 