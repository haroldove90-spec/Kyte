import React from 'react';
import {
  LogOut,
  ShieldCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  Store,
  Menu,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { BusinessProfile } from '../types/pos';

interface HeaderProps {
  business: BusinessProfile;
  role: string;
  onLogout: () => void;
  isOnline: boolean;
  offlineCount: number;
  isSyncing: boolean;
  onSync: () => void;
  onOpenSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  role,
  onLogout,
  isOnline,
  offlineCount,
  isSyncing,
  onSync,
  onOpenSidebar,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs px-2.5 sm:px-6 py-2 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Mobile menu toggle + Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition shrink-0 cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Kyte POS style logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-600/30 shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 leading-none truncate">
                Kyte<span className="text-emerald-600">POS</span>
              </span>
              <span className="hidden md:inline-block text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {business.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right side items: Offline status, PWA Install button, Role Badge, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Connectivity Status & Offline sync badge */}
          {!isOnline ? (
            <div
              title="Modo sin conexión"
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold animate-pulse shrink-0"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">Offline</span>
              {offlineCount > 0 && (
                <span className="bg-amber-600 text-white text-[10px] px-1 py-0.2 rounded-full font-bold">
                  {offlineCount}
                </span>
              )}
            </div>
          ) : offlineCount > 0 ? (
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Sincronizar ventas offline"
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar ({offlineCount})</span>
            </button>
          ) : (
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
              <Wifi className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>En línea</span>
            </div>
          )}

          {/* Quick PWA Install Button (Botón "Punto de venta") */}
          <PWAInstallButton />

          {/* Identificación del rol activo */}
          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-slate-800 text-xs font-semibold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="capitalize">{role}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Activo" />
          </div>

          {/* Botón de cierre de sesión */}
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-100 shrink-0 cursor-pointer"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
