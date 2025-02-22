import { logService } from './LogService';

interface SyncItem {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  retryCount: number;
}

class SyncManager {
  private static instance: SyncManager;
  private syncQueue: SyncItem[] = [];
  private isSyncing: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 5000; // 5 saniye

  private constructor() {
    this.initializeSync();
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private async initializeSync() {
    // IndexedDB'den bekleyen senkronizasyonları yükle
    await this.loadPendingSyncs();

    // Periyodik senkronizasyon kontrolü
    setInterval(() => {
      if (navigator.onLine && !this.isSyncing && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, this.SYNC_INTERVAL);

    // Online/Offline event listener'ları
    window.addEventListener('online', () => {
      this.processSyncQueue();
    });
  }

  private async loadPendingSyncs() {
    try {
      const db = await this.openDB();
      const tx = db.transaction('syncQueue', 'readonly');
      const store = tx.objectStore('syncQueue');
      const items = await store.getAll();

      this.syncQueue = items;
    } catch (error) {
      logService.logError('Error loading pending syncs', {
        error: error as Error,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    }
  }

  async addToSyncQueue(type: string, data: any): Promise<void> {
    const syncItem: SyncItem = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    try {
      // IndexedDB'ye kaydet
      const db = await this.openDB();
      const tx = db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      await store.add(syncItem);

      // Memory'deki kuyruğa ekle
      this.syncQueue.push(syncItem);

      // Online isek hemen senkronize et
      if (navigator.onLine && !this.isSyncing) {
        this.processSyncQueue();
      }
    } catch (error) {
      logService.logError('Error adding to sync queue', {
        error: error as Error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        syncItem
      });
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;

    try {
      const db = await this.openDB();
      
      for (const item of [...this.syncQueue]) {
        try {
          await this.syncItem(item);

          // Başarılı senkronizasyonu sil
          const tx = db.transaction('syncQueue', 'readwrite');
          const store = tx.objectStore('syncQueue');
          await store.delete(item.id);

          // Memory'den kaldır
          this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
        } catch (error) {
          item.retryCount++;

          if (item.retryCount >= this.MAX_RETRIES) {
            // Max retry sayısına ulaşıldı, item'ı sil
            const tx = db.transaction('syncQueue', 'readwrite');
            const store = tx.objectStore('syncQueue');
            await store.delete(item.id);
            
            this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);

            logService.logError('Max retries reached for sync item', {
              error: error as Error,
              timestamp: new Date().toISOString(),
              url: window.location.href,
              syncItem: item
            });
          } else {
            // Retry count'u güncelle
            const tx = db.transaction('syncQueue', 'readwrite');
            const store = tx.objectStore('syncQueue');
            await store.put(item);
          }
        }
      }
    } catch (error) {
      logService.logError('Error processing sync queue', {
        error: error as Error,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: SyncItem): Promise<void> {
    const endpoint = this.getEndpointForType(item.type);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  private getEndpointForType(type: string): string {
    const endpoints: Record<string, string> = {
      'suggestions': '/api/sync/suggestions',
      'analysis': '/api/sync/analysis',
      'learningPath': '/api/sync/learning-path',
      // Diğer endpoint'ler...
    };

    return endpoints[type] || '/api/sync';
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SyncDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
      };
    });
  }
}

export const syncManager = SyncManager.getInstance();
