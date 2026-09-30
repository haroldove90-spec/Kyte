import { useEffect, useState } from 'react';
import { getOfflineQueue, markSalesAsSynced } from '../utils/storage';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineCount, setOfflineCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshOfflineCount = () => {
    const queue = getOfflineQueue();
    setOfflineCount(queue.length);
  };

  useEffect(() => {
    refreshOfflineCount();

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when returning online
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshOfflineCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(refreshOfflineCount, 2500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const syncNow = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    // Simulate background synchronization
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      markSalesAsSynced(queue);
      setOfflineCount(0);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    offlineCount,
    isSyncing,
    syncNow,
    refreshOfflineCount,
  };
}
