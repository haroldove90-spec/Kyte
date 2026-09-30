import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Unlock,
  CheckCircle,
  FileText,
  DollarSign,
  Share2,
  AlertCircle,
  History,
  X,
  CreditCard,
  QrCode,
  Banknote,
} from 'lucide-react';
import { CashMovement, CashRegisterSession, Sale, BusinessProfile } from '../types/pos';

interface CashRegisterModuleProps {
  session: CashRegisterSession;
  sales: Sale[];
  business: BusinessProfile;
  onUpdateSession: (newSession: CashRegisterSession) => void;
}

export const CashRegisterModule: React.FC<CashRegisterModuleProps> = ({
  session,
  sales,
  business,
  onUpdateSession,
}) => {
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'in' | 'out'>('out');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [countedCash, setCountedCash] = useState('');

  // Calculate sales within current session timeframe
  const sessionSales = sales.filter((s) => s.timestamp >= session.openedAt);

  // Cash sales sum
  const cashSalesTotal = sessionSales
    .filter((s) => s.payment.method === 'cash')
    .reduce((sum, s) => sum + s.total, 0);

  // Card sales sum
  const cardSalesTotal = sessionSales
    .filter((s) => s.payment.method === 'card')
    .reduce((sum, s) => sum + s.total, 0);

  // Transfer sales sum
  const transferSalesTotal = sessionSales
    .filter((s) => s.payment.method === 'transfer')
    .reduce((sum, s) => sum + s.total, 0);

  // Split sales cash portion
  const splitCashTotal = sessionSales
    .filter((s) => s.payment.method === 'split')
    .reduce((sum, s) => sum + (s.payment.splitCash || 0), 0);

  // Total cash inputs into drawer
  const totalCashSalesInDrawer = cashSalesTotal + splitCashTotal;

  // Movements calculation
  const cashIn = session.cashMovements
    .filter((m) => m.type === 'in')
    .reduce((sum, m) => sum + m.amount, 0);

  const cashOut = session.cashMovements
    .filter((m) => m.type === 'out')
    .reduce((sum, m) => sum + m.amount, 0);

  // Expected Cash in Drawer: Initial Float + Cash Sales + Inputs - Withdrawals
  const expectedCashInDrawer =
    session.initialCash + totalCashSalesInDrawer + cashIn - cashOut;

  const totalAllSales = sessionSales.reduce((sum, s) => sum + s.total, 0);

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movementAmount) || 0;
    if (amount <= 0 || !movementReason.trim()) return;

    const newMovement: CashMovement = {
      id: `mov-${Date.now()}`,
      timestamp: Date.now(),
      type: movementType,
      amount,
      reason: movementReason.trim(),
    };

    const updated: CashRegisterSession = {
      ...session,
      cashMovements: [newMovement, ...session.cashMovements],
    };

    onUpdateSession(updated);
    setMovementAmount('');
    setMovementReason('');
    setIsMovementModalOpen(false);
  };

  const handleCloseRegister = () => {
    const updated: CashRegisterSession = {
      ...session,
      isOpen: false,
      closedAt: Date.now(),
      notes: `Cierre realizado con ${sessionSales.length} ventas.`,
    };
    onUpdateSession(updated);
    setIsCloseModalOpen(false);
  };

  const handleReopenRegister = () => {
    const newSession: CashRegisterSession = {
      id: `caja-${Date.now()}`,
      openedAt: Date.now(),
      isOpen: true,
      initialCash: 500.0,
      cashMovements: [],
    };
    onUpdateSession(newSession);
  };

  const handleShareCorteWhatsApp = () => {
    const dateStr = new Date(session.openedAt).toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const lines = [
      `📊 *CORTE DE CAJA - ${business.name.toUpperCase()}*`,
      `Apertura: ${dateStr}`,
      `Estado: ${session.isOpen ? '🟢 En curso' : '🔴 Caja Cerrada'}`,
      `--------------------------------`,
      `💵 *Fondo Inicial:* $${session.initialCash.toFixed(2)}`,
      `💰 *Ventas Efectivo:* $${totalCashSalesInDrawer.toFixed(2)}`,
      `💳 *Ventas Tarjeta:* $${cardSalesTotal.toFixed(2)}`,
      `📱 *Ventas Transfer:* $${transferSalesTotal.toFixed(2)}`,
      `➕ *Entradas Caja:* $${cashIn.toFixed(2)}`,
      `➖ *Retiros Caja:* $${cashOut.toFixed(2)}`,
      `--------------------------------`,
      `*EFECTIVO ESPERADO EN CAJA: $${expectedCashInDrawer.toFixed(2)}*`,
      `*TOTAL VENTAS DEL TURNO: $${totalAllSales.toFixed(2)}* (${sessionSales.length} ventas)`,
      `--------------------------------`,
      `Generado con Kyte POS Móvil`,
    ];
    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-3 sm:p-6 space-y-5 pb-24 lg:pb-8">
      {/* Top Banner Status */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
              session.isOpen
                ? 'bg-emerald-600 shadow-emerald-600/20'
                : 'bg-slate-700 shadow-slate-700/20'
            }`}
          >
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Control de Caja Móvil
              </h2>
              {session.isOpen ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Abierta
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Cerrada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Turno iniciado:{' '}
              {new Date(session.openedAt).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShareCorteWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>Compartir Corte</span>
          </button>

          {session.isOpen ? (
            <>
              <button
                onClick={() => setIsMovementModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4 text-slate-600" />
                <span>Entrada / Retiro</span>
              </button>
              <button
                onClick={() => setIsCloseModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Cerrar Caja (Corte Z)</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleReopenRegister}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Abrir Nuevo Turno</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Breakdown Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Expected Cash in drawer */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between opacity-80 text-xs font-medium">
            <span>Efectivo en Gaveta</span>
            <Banknote className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">
            ${expectedCashInDrawer.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-100">
            Fondo (${session.initialCash.toFixed(2)}) + Ventas ($
            {totalCashSalesInDrawer.toFixed(2)})
          </p>
        </div>

        {/* Total Turn Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Ventas Totales</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            ${totalAllSales.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400">{sessionSales.length} transacciones</p>
        </div>

        {/* Card Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cobros con Tarjeta</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            ${cardSalesTotal.toFixed(2)}
          </p>
          <p className="text-[11px] text-purple-600 font-medium">Directo a cuenta</p>
        </div>

        {/* Transfer Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Transferencias SPEI</span>
            <QrCode className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            ${transferSalesTotal.toFixed(2)}
          </p>
          <p className="text-[11px] text-blue-600 font-medium">Bancos / Móvil</p>
        </div>
      </div>

      {/* Detailed Cash Flow Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Movements History */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              Movimientos de Efectivo del Turno
            </h3>
            <span className="text-xs text-slate-400">
              {session.cashMovements.length} registros
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {session.cashMovements.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No hay retiros ni ingresos manuales en este turno
              </p>
            ) : (
              session.cashMovements.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        m.type === 'in'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {m.type === 'in' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{m.reason}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(m.timestamp).toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-black text-sm ${
                      m.type === 'in' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {m.type === 'in' ? '+' : '-'}${m.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Card for Close Out */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Balance de Arqueo de Caja
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Fondo de caja inicial:</span>
              <span className="font-bold text-slate-900">${session.initialCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>+ Ventas en efectivo registradas:</span>
              <span className="font-bold text-emerald-700">
                +${totalCashSalesInDrawer.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>+ Entradas extras de efectivo:</span>
              <span className="font-bold text-emerald-700">+${cashIn.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>- Retiros o gastos de caja:</span>
              <span className="font-bold text-rose-600">-${cashOut.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-extrabold text-slate-900 bg-slate-50 px-3 rounded-xl border border-slate-200">
              <span>Efectivo total en gaveta:</span>
              <span className="text-emerald-700">${expectedCashInDrawer.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECORD MOVEMENT MODAL */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                Registrar Movimiento de Efectivo
              </h4>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="space-y-3">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMovementType('out')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    movementType === 'out'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Retiro / Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('in')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    movementType === 'in'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Ingreso Extra
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monto ($) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  min={0.01}
                  placeholder="0.00"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo / Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pago a proveedor de panadería, cambio..."
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE REGISTER MODAL (CORTE Z) */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-600" />
                Cierre de Caja (Corte Z)
              </h4>
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Al cerrar la caja se consolidará el reporte de ventas del turno y se cerrará la
                sesión activa.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
                <div className="flex justify-between">
                  <span>Efectivo Teórico Esperado:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    ${expectedCashInDrawer.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total en Tarjetas:</span>
                  <span className="font-bold text-slate-800">${cardSalesTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total en Transferencias:</span>
                  <span className="font-bold text-slate-800">${transferSalesTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                  <span>Total Facturado Turno:</span>
                  <span>${totalAllSales.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCloseRegister}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Confirmar Cierre de Caja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
