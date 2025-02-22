import { useState, useCallback } from 'react';
import { aiService } from '../services/AIService';
import { useOfflineSupport } from './useOfflineSupport';

interface AIAssistantHook {
  suggestions: string[];
  isLoading: boolean;
  error: Error | null;
  getSuggestions: (context: Record<string, any>) => Promise<void>;
  analyzeLearning: (data: Record<string, any>) => Promise<void>;
  generatePath: (goals: string[], preferences: Record<string, any>) => Promise<void>;
}

export function useAIAssistant(userId: string): AIAssistantHook {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline, syncData } = useOfflineSupport();

  const handleOfflineData = async (data: any) => {
    // Offline veriyi IndexedDB'ye kaydet
    const db = await openDB();
    const tx = db.transaction('aiRequests', 'readwrite');
    const store = tx.objectStore('aiRequests');
    await store.add({
      ...data,
      timestamp: new Date().toISOString(),
      processed: false
    });
  };

  const getSuggestions = useCallback(async (context: Record<string, any>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isOnline) {
        // Çevrimdışıyken local cache'den önerileri getir
        const cachedSuggestions = await getCachedSuggestions(context);
        setSuggestions(cachedSuggestions);
        await handleOfflineData({ type: 'suggestions', context });
        return;
      }

      const response = await aiService.getPersonalizedSuggestions(userId, context);
      setSuggestions(response.suggestions);

      // Önerileri cache'le
      await cacheSuggestions(context, response.suggestions);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOnline]);

  const analyzeLearning = useCallback(async (data: Record<string, any>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isOnline) {
        await handleOfflineData({ type: 'analysis', data });
        return;
      }

      const response = await aiService.analyzeLearningPattern(userId, data);
      return response;
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOnline]);

  const generatePath = useCallback(async (goals: string[], preferences: Record<string, any>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isOnline) {
        await handleOfflineData({ type: 'learningPath', goals, preferences });
        return;
      }

      const response = await aiService.generateLearningPath(userId, goals, preferences);
      return response;
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOnline]);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    analyzeLearning,
    generatePath
  };
}

// IndexedDB yardımcı fonksiyonları
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AIAssistantDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // AI istekleri için store
      if (!db.objectStoreNames.contains('aiRequests')) {
        db.createObjectStore('aiRequests', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }

      // Cache için store
      if (!db.objectStoreNames.contains('suggestionCache')) {
        const store = db.createObjectStore('suggestionCache', { 
          keyPath: 'cacheKey' 
        });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

async function cacheSuggestions(context: Record<string, any>, suggestions: string[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('suggestionCache', 'readwrite');
  const store = tx.objectStore('suggestionCache');

  const cacheKey = generateCacheKey(context);
  await store.put({
    cacheKey,
    suggestions,
    context,
    timestamp: new Date().toISOString()
  });
}

async function getCachedSuggestions(context: Record<string, any>): Promise<string[]> {
  const db = await openDB();
  const tx = db.transaction('suggestionCache', 'readonly');
  const store = tx.objectStore('suggestionCache');

  const cacheKey = generateCacheKey(context);
  const cached = await store.get(cacheKey);

  return cached?.suggestions || [];
}

function generateCacheKey(context: Record<string, any>): string {
  return `suggestions_${JSON.stringify(context)}`;
}
