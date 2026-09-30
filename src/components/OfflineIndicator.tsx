import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  offlineCount: number;
  isSyncing: boolean;
  onSync: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  offlineCount,
  isSyncing,
  onSync,
}) => {
  if (isOnline && offlineCount === 0) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md pointer-events-none">
      <div
        className={`p-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs font-semibold text-white pointer-events-auto transition-all ${
          !isOnline ? 'bg-amber-600 border border-amber-500' : 'bg-blue-600 border border-blue-500'
        }`}
      >
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
              <span>
                Modo Offline activo: Las ventas se guardan localmente
                {offlineCount > 0 && ` (${offlineCount} pendientes)`}
              </span>
            </>
          ) : (
            <>
              <RefreshCw
                className={`w-4 h-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`}
              />
              <span>
                {isSyncing
                  ? 'Sincronizando ventas con el servidor...'
                  : `${offlineCount} ventas pendientes de sincronizar`}
              </span>
            </>
          )}
        </div>

        {isOnline && offlineCount > 0 && !isSyncing && (
          <button
            onClick={onSync}
            className="px-2.5 py-1 bg-white text-blue-700 rounded-lg text-[11px] font-bold hover:bg-blue-50 active:scale-95 transition"
          >
            Sincronizar
          </button>
        )}
      </div>
    </div>
  );
};
