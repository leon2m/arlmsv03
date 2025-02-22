import { useState, useEffect } from 'react';

interface OfflineSupportHook {
  isOnline: boolean;
  lastSyncTime: Date | null;
  syncData: () => Promise<void>;
}

export function useOfflineSupport(): OfflineSupportHook {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncData(); // Çevrimiçi olunca otomatik senkronizasyon
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // IndexedDB ile offline veri yönetimi
  const syncData = async () => {
    if (!isOnline) return;

    try {
      // Offline verileri al
      const offlineData = await getOfflineData();
      
      // Sunucuya senkronize et
      for (const data of offlineData) {
        await syncToServer(data);
      }

      // Başarılı senkronizasyon sonrası
      setLastSyncTime(new Date());
      await clearOfflineData();
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  return { isOnline, lastSyncTime, syncData };
}

// IndexedDB işlemleri
async function getOfflineData(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineStore'], 'readonly');
      const store = transaction.objectStore('offlineStore');
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('offlineStore', { keyPath: 'id', autoIncrement: true });
    };
  });
}

async function clearOfflineData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineStore'], 'readwrite');
      const store = transaction.objectStore('offlineStore');
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };
  });
}

async function syncToServer(data: any): Promise<void> {
  // API endpoint'e veriyi gönder
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Sync failed');
  }
}
