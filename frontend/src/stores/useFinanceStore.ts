import { create } from 'zustand'
import type { FinanceCurrency, TransactionFilterState } from '../types/finance.types'

interface FinanceStore {
  // Currency toggle
  currency: FinanceCurrency
  setCurrency: (c: FinanceCurrency) => void

  // Month/year navigator
  activeMonth: number   // 1-12
  activeYear: number
  setActiveMonth: (month: number) => void
  setActiveYear: (year: number) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void

  // Transaction filters
  txFilters: TransactionFilterState
  setTxFilters: (f: Partial<TransactionFilterState>) => void
  resetTxFilters: () => void
}

// Initialize with current month/year
const now = new Date()

export const useFinanceStore = create<FinanceStore>((set) => ({
  currency: 'MXN',
  setCurrency: (currency) => set({ currency }),

  activeMonth: now.getMonth() + 1,
  activeYear: now.getFullYear(),
  setActiveMonth: (activeMonth) => set({ activeMonth }),
  setActiveYear: (activeYear) => set({ activeYear }),
  goToPrevMonth: () => set((s) => {
    if (s.activeMonth === 1) return { activeMonth: 12, activeYear: s.activeYear - 1 }
    return { activeMonth: s.activeMonth - 1 }
  }),
  goToNextMonth: () => set((s) => {
    if (s.activeMonth === 12) return { activeMonth: 1, activeYear: s.activeYear + 1 }
    return { activeMonth: s.activeMonth + 1 }
  }),

  txFilters: { from: null, to: null, categoryId: null, type: null },
  setTxFilters: (f) => set((s) => ({ txFilters: { ...s.txFilters, ...f } })),
  resetTxFilters: () => set({ txFilters: { from: null, to: null, categoryId: null, type: null } }),
}))
