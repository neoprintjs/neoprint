import type { SessionLink, Fingerprint } from '../types.js'
import { murmurhash3 } from '../core/hash.js'

const STORAGE_KEY = '__neoprint_sid__'

interface SessionOptions {
  storage?: 'localStorage' | 'sessionStorage' | 'indexeddb' | 'cookie'
  fallback?: boolean
}

export class SessionManager {
  private storage: SessionOptions['storage']
  private fallback: boolean

  constructor(options: SessionOptions = {}) {
    this.storage = options.storage ?? 'localStorage'
    this.fallback = options.fallback ?? true
  }

  async identify(fingerprint: Fingerprint): Promise<SessionLink> {
    // Try to get stored ID first
    const storedId = await this.getStoredId()

    if (storedId) {
      // Store the current fingerprint ID
      await this.storeId(fingerprint.id)
      return {
        previousId: storedId,
        confidence: 1,
        method: 'storage',
      }
    }

    // No stored ID — this is a new session or storage was cleared
    await this.storeId(fingerprint.id)

    return {
      previousId: undefined,
      confidence: fingerprint.confidence,
      method: 'fingerprint',
    }
  }

  async clear(): Promise<void> {
    try {
      switch (this.storage) {
        case 'localStorage':
          localStorage.removeItem(STORAGE_KEY)
          break
        case 'sessionStorage':
          sessionStorage.removeItem(STORAGE_KEY)
          break
        case 'cookie':
          document.cookie = `${STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          break
        case 'indexeddb':
          await this.deleteFromIDB()
          break
      }
    } catch {
      // storage unavailable
    }
  }

  private async getStoredId(): Promise<string | null> {
    const methods = this.fallback
      ? [this.storage, 'localStorage', 'sessionStorage', 'cookie', 'indexeddb'] as const
      : [this.storage] as const

    for (const method of methods) {
      try {
        const id = await this.readFrom(method!)
        if (id) return id
      } catch {
        continue
      }
    }

    return null
  }

  private async storeId(id: string): Promise<void> {
    try {
      switch (this.storage) {
        case 'localStorage':
          localStorage.setItem(STORAGE_KEY, id)
          break
        case 'sessionStorage':
          sessionStorage.setItem(STORAGE_KEY, id)
          break
        case 'cookie':
          document.cookie = `${STORAGE_KEY}=${id}; path=/; max-age=31536000; SameSite=Lax`
          break
        case 'indexeddb':
          await this.writeToIDB(id)
          break
      }
    } catch {
      // Try fallback
      if (this.fallback && this.storage !== 'localStorage') {
        try {
          localStorage.setItem(STORAGE_KEY, id)
        } catch {
          // nothing we can do
        }
      }
    }
  }

  private async readFrom(method: string): Promise<string | null> {
    switch (method) {
      case 'localStorage':
        return localStorage.getItem(STORAGE_KEY)
      case 'sessionStorage':
        return sessionStorage.getItem(STORAGE_KEY)
      case 'cookie': {
        const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${STORAGE_KEY}=([^;]+)`))
        return match?.[1] ?? null
      }
      case 'indexeddb':
        return this.readFromIDB()
      default:
        return null
    }
  }

  private readFromIDB(): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('neoprint', 1)
        request.onupgradeneeded = () => {
          request.result.createObjectStore('session')
        }
        request.onsuccess = () => {
          const db = request.result
          const tx = db.transaction('session', 'readonly')
          const store = tx.objectStore('session')
          const get = store.get('sid')
          get.onsuccess = () => resolve(get.result ?? null)
          get.onerror = () => resolve(null)
        }
        request.onerror = () => resolve(null)
      } catch {
        resolve(null)
      }
    })
  }

  private writeToIDB(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('neoprint', 1)
        request.onupgradeneeded = () => {
          request.result.createObjectStore('session')
        }
        request.onsuccess = () => {
          const db = request.result
          const tx = db.transaction('session', 'readwrite')
          const store = tx.objectStore('session')
          store.put(id, 'sid')
          tx.oncomplete = () => resolve()
          tx.onerror = () => reject(tx.error)
        }
        request.onerror = () => reject(request.error)
      } catch (e) {
        reject(e)
      }
    })
  }

  private deleteFromIDB(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('neoprint', 1)
        request.onupgradeneeded = () => {
          request.result.createObjectStore('session')
        }
        request.onsuccess = () => {
          const db = request.result
          const tx = db.transaction('session', 'readwrite')
          const store = tx.objectStore('session')
          store.delete('sid')
          tx.oncomplete = () => resolve()
          tx.onerror = () => resolve()
        }
        request.onerror = () => resolve()
      } catch {
        resolve()
      }
    })
  }
}
