import React from 'react';
import {
  CreditCard,
  Package,
  ClipboardList,
  Wallet,
  Share2,
  X,
  LogOut,
  Sparkles,
  Settings,
} from 'lucide-react';
import { BusinessProfile } from '../types/pos';

export type ActiveTab = 'pos' | 'catalog' | 'orders' | 'register' | 'share';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  cartCount: number;
  pendingOrdersCount: number;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onLogout: () => void;
  business: BusinessProfile;
  activeRole: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  pendingOrdersCount,
  sidebarOpen,
  onCloseSidebar,
  onLogout,
  business,
  activeRole,
}) => {
  const navItems = [
    {
      id: 'pos' as ActiveTab,
      label: 'Vender',
      fullLabel: 'Punto de venta',
      icon: CreditCard,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'catalog' as ActiveTab,
      label: 'Catálogo',
      fullLabel: 'Productos y Stock',
      icon: Package,
    },
    {
      id: 'orders' as ActiveTab,
      label: 'Pedidos',
      fullLabel: 'Pedidos y Ventas',
      icon: ClipboardList,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'register' as ActiveTab,
      label: 'Caja',
      fullLabel: 'Caja móvil y Cortes',
      icon: Wallet,
    },
    {
      id: 'share' as ActiveTab,
      label: 'Catálogo Web',
      fullLabel: 'Compartir Catálogo',
      icon: Share2,
    },
  ];

  return (
    <>
      {/* 1. Mobile & Tablet: Fixed Touch Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 safe-bottom">
        <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all select-none cursor-pointer ${
                  isActive
                    ? 'text-emerald-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                    }`}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[10px] font-extrabold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 truncate max-w-full">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-0.75 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 2. Desktop: Full Lateral Sidebar Menu */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none">
        {/* Top Store Info */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
              K
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-white truncate">{business.name}</h2>
              <p className="text-xs text-emerald-400 truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Caja Activa (Rol: {activeRole})
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 flex-1 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Módulos del Sistema
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.fullLabel}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Customer Catalog Link Card in Sidebar */}
        <div className="p-3">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Catálogo Online</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Comparte tu catálogo con clientes para recibir pedidos directos a WhatsApp.
            </p>
            <button
              onClick={() => onTabChange('share')}
              className="w-full py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg font-medium text-[11px] transition text-center block cursor-pointer"
            >
              Ver enlace web & QR
            </button>
          </div>
        </div>

        {/* Bottom Session Logout */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión ({activeRole})</span>
          </button>
        </div>
      </aside>

      {/* 3. Mobile / Tablet Drawer Sidebar (when opened via header menu button) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseSidebar}
          />
          <div className="relative w-72 max-w-[80vw] bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  K
                </div>
                <div>
                  <h3 className="font-bold text-sm">{business.name}</h3>
                  <p className="text-[11px] text-emerald-400">Rol: {activeRole}</p>
                </div>
              </div>
              <button
                onClick={onCloseSidebar}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onCloseSidebar();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.fullLabel}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => {
                  onCloseSidebar();
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
