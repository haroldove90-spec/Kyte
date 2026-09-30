import React from 'react';
import { ShieldCheck, Store, Sparkles } from 'lucide-react';

interface RoleSelectScreenProps {
  onSelectRole: (role: 'admin') => void;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main centered container */}
      <div className="w-full max-w-sm flex flex-col items-center justify-center text-center z-10 space-y-8">
        
        {/* Logo arriba del icono de acceso al sistema */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/30 border border-emerald-400/30">
            <Store className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Kyte<span className="text-emerald-400">POS</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-emerald-300/80">
              Punto de venta móvil
            </p>
          </div>
        </div>

        {/* Centered Role Card (Admin) */}
        <div className="w-full flex justify-center">
          <button
            onClick={() => onSelectRole('admin')}
            className="group relative w-48 sm:w-56 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-900 shadow-2xl shadow-emerald-950/60 hover:shadow-emerald-500/25 hover:-translate-y-1 transition-all duration-200 cursor-pointer text-center"
          >
            {/* Top right subtle status dot */}
            <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>

            {/* Role Icon inside card */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-200 mb-3 shadow-inner">
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 transition-transform" />
            </div>

            {/* Role Name */}
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              Admin
            </span>
          </button>
        </div>

        {/* Subtle footer hint */}
        <p className="text-[11px] text-slate-500 font-medium">
          Toca para acceder al panel de ventas
        </p>
      </div>
    </div>
  );
};
