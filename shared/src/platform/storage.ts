export interface AsyncStorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

function createMemoryStorage(): AsyncStorageAdapter {
  const values = new Map<string, string>()

  return {
    async getItem(key: string) {
      return values.get(key) ?? null
    },
    async setItem(key: string, value: string) {
      values.set(key, value)
    },
    async removeItem(key: string) {
      values.delete(key)
    },
  }
}

function createBrowserStorage(): AsyncStorageAdapter {
  return {
    async getItem(key: string) {
      try {
        return globalThis.localStorage?.getItem(key) ?? null
      } catch {
        return null
      }
    },
    async setItem(key: string, value: string) {
      try {
        globalThis.localStorage?.setItem(key, value)
      } catch {
        return undefined
      }
    },
    async removeItem(key: string) {
      try {
        globalThis.localStorage?.removeItem(key)
      } catch {
        return undefined
      }
    },
  }
}

let storageAdapter: AsyncStorageAdapter =
  typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined'
    ? createBrowserStorage()
    : createMemoryStorage()

export function setStorageAdapter(adapter: AsyncStorageAdapter) {
  storageAdapter = adapter
}

export function getStorageAdapter() {
  return storageAdapter
}
