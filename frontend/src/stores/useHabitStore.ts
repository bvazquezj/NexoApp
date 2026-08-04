import { create } from 'zustand'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

interface HabitStore {
  /** YYYY-MM-DD selected for "today" view */
  selectedDate: string
  /** Day of week (0=Sun..6=Sat) currently being edited in routine views */
  activeRoutineDay: number

  setSelectedDate: (date: string) => void
  setActiveRoutineDay: (day: number) => void
}

export const useHabitStore = create<HabitStore>((set) => ({
  selectedDate: todayIso(),
  activeRoutineDay: new Date().getDay(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setActiveRoutineDay: (activeRoutineDay) => set({ activeRoutineDay }),
}))
