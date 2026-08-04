import { create } from 'zustand'

interface SyncState {
  pendingCount: number
  processingCount: number
  failedCount: number
  lastSyncedAt: string | null
  lastError: string | null
  setQueueSnapshot(snapshot: {
    pendingCount: number
    processingCount: number
    failedCount: number
    lastSyncedAt?: string | null
    lastError?: string | null
  }): void
  clearError(): void
}

export const useSyncStore = create<SyncState>((set) => ({
  pendingCount: 0,
  processingCount: 0,
  failedCount: 0,
  lastSyncedAt: null,
  lastError: null,

  setQueueSnapshot: (snapshot) =>
    set({
      pendingCount: snapshot.pendingCount,
      processingCount: snapshot.processingCount,
      failedCount: snapshot.failedCount,
      lastSyncedAt: snapshot.lastSyncedAt ?? null,
      lastError: snapshot.lastError ?? null,
    }),

  clearError: () => set({ lastError: null }),
}))
