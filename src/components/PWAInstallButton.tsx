import React, { useState } from 'react';
import { Download, Smartphone, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showDesktopInfo, setShowDesktopInfo] = useState(false);

  // If already installed in standalone mode, provide subtle compact badge
  if (isInstalled) {
    return (
      <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 whitespace-nowrap shrink-0">
        <Smartphone className="w-3 h-3 text-emerald-600 shrink-0" />
        Instalada
      </span>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowDesktopInfo(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        title="Instalar Punto de venta en tu dispositivo"
        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs hover:shadow active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Punto de venta</span>
        <span className="sm:hidden">Instalar</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                Instalar en iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  1
                </span>
                <p>
                  Toca el botón <strong className="text-slate-900 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5" /> Compartir</strong> en la barra inferior de Safari.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  2
                </span>
                <p>
                  Desliza hacia abajo y selecciona <strong className="text-slate-900">"Agregar a pantalla de inicio"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  3
                </span>
                <p>
                  Pulsa <strong className="text-slate-900">"Agregar"</strong> en la esquina superior derecha y ¡listo! Se abrirá como app nativa.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Desktop / Generic browser info modal */}
      {showDesktopInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                Instalar Punto de venta
              </h3>
              <button
                onClick={() => setShowDesktopInfo(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <p>
                Para instalar la app en Chrome, Edge o tu navegador:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-200">
                <p className="font-semibold text-slate-800">
                  • Haz clic en el ícono de instalación (pantalla o flecha) en la barra de direcciones de tu navegador.
                </p>
                <p className="text-slate-600">
                  • O en el menú de tres puntos <span className="font-semibold">(⋮) &gt; "Instalar Punto de venta"</span>.
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Podrás usar la app a pantalla completa, sin barras de navegador y con soporte sin conexión.
              </p>
            </div>
            <button
              onClick={() => setShowDesktopInfo(false)}
              className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
