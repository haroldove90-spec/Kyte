import React, { useState, useEffect } from 'react';
import {
  Banknote,
  CreditCard,
  QrCode,
  ArrowRight,
  X,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, PaymentDetails, PaymentMethodType, Sale } from '../types/pos';
import { generateTicketNumber } from '../utils/storage';

interface CheckoutModalProps {
  cart: CartItem[];
  subtotal: number;
  cashier: string;
  isOnline: boolean;
  onClose: () => void;
  onCompleteSale: (sale: Sale) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cart,
  subtotal,
  cashier,
  isOnline,
  onClose,
  onCompleteSale,
}) => {
  const [method, setMethod] = useState<PaymentMethodType>('cash');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountValue, setDiscountValue] = useState<string>('');

  // Cash calculations
  const total = Math.max(0, subtotal - discount);
  const [amountReceivedInput, setAmountReceivedInput] = useState<string>(
    total.toString()
  );
  const [reference, setReference] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Split payment state
  const [splitCash, setSplitCash] = useState<string>((total / 2).toFixed(2));
  const [splitOtherMethod, setSplitOtherMethod] = useState<'card' | 'transfer'>('card');

  // Update amount received default if total changes
  useEffect(() => {
    if (method === 'cash') {
      setAmountReceivedInput(total.toString());
    }
  }, [total, method]);

  const handleDiscountChange = (valStr: string, type: 'amount' | 'percent') => {
    setDiscountValue(valStr);
    const num = parseFloat(valStr) || 0;
    if (type === 'percent') {
      const calc = (subtotal * num) / 100;
      setDiscount(Math.min(subtotal, Math.max(0, calc)));
    } else {
      setDiscount(Math.min(subtotal, Math.max(0, num)));
    }
  };

  const amountReceived = parseFloat(amountReceivedInput) || 0;
  const change = Math.max(0, amountReceived - total);
  const isCashInsufficient = method === 'cash' && amountReceived < total;

  const quickCashOptions = [
    { label: 'Exacto', value: total },
    { label: '$50', value: 50 },
    { label: '$100', value: 100 },
    { label: '$200', value: 200 },
    { label: '$500', value: 500 },
    { label: '$1000', value: 1000 },
  ].filter((opt) => opt.value >= total || opt.label === 'Exacto');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCashInsufficient) return;

    let paymentDetails: PaymentDetails = {
      method,
      amountReceived: method === 'cash' ? amountReceived : total,
      change: method === 'cash' ? change : 0,
      reference: reference || undefined,
    };

    if (method === 'split') {
      const cashPart = parseFloat(splitCash) || 0;
      const otherPart = Math.max(0, total - cashPart);
      paymentDetails = {
        method: 'split',
        amountReceived: total,
        change: 0,
        splitCash: cashPart,
        splitOther: otherPart,
        splitOtherMethod,
        reference: reference || undefined,
      };
    }

    const newSale: Sale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ticketNumber: generateTicketNumber(),
      timestamp: Date.now(),
      items: cart,
      subtotal,
      discount,
      total,
      payment: paymentDetails,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      cashier,
      status: 'completed',
      synced: isOnline,
      source: 'pos',
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#34D399', '#FBBF24'],
      });
    } catch {
      // ignore
    }

    onCompleteSale(newSale);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-4 border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Cobrar Venta</h3>
              <p className="text-xs text-slate-400">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} artículos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Total Display */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                Total a Cobrar
              </span>
              {discount > 0 && (
                <span className="text-xs text-slate-500 line-through">
                  ${subtotal.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-3xl font-black text-emerald-700 tracking-tight">
              ${total.toFixed(2)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                  method === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Banknote className={`w-5 h-5 mb-1 ${method === 'cash' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span className="text-xs">Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                  method === 'card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className={`w-5 h-5 mb-1 ${method === 'card' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span className="text-xs">Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                  method === 'transfer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <QrCode className={`w-5 h-5 mb-1 ${method === 'transfer' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span className="text-xs">Transferencia</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('split')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                  method === 'split'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Percent className={`w-5 h-5 mb-1 ${method === 'split' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span className="text-xs">Mixto</span>
              </button>
            </div>
          </div>

          {/* EFECTIVO: Input and Change Calculator */}
          {method === 'cash' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monto Recibido en Efectivo ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={amountReceivedInput}
                    onChange={(e) => setAmountReceivedInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-lg font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quick denomination chips */}
              <div className="flex flex-wrap gap-1.5">
                {quickCashOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAmountReceivedInput(opt.value.toString())}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:border-emerald-500 hover:text-emerald-700 transition cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Change Output */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Cambio a Entregar:</span>
                <span
                  className={`text-xl font-black ${
                    isCashInsufficient ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  ${change.toFixed(2)}
                </span>
              </div>
              {isCashInsufficient && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  El monto recibido es menor al total (${(total - amountReceived).toFixed(2)} faltante)
                </p>
              )}
            </div>
          )}

          {/* TARJETA / TRANSFERENCIA: Reference field */}
          {(method === 'card' || method === 'transfer') && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {method === 'card'
                  ? 'Folio de voucher o últimos 4 dígitos (opcional)'
                  : 'Número de autorización / Clave de rastreo SPEI (opcional)'}
              </label>
              <input
                type="text"
                placeholder={method === 'card' ? 'Ej. Terminal 0451' : 'Ej. SPEI-892301'}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {/* MIXTO / SPLIT PAYMENT */}
          {method === 'split' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parte en Efectivo ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={splitCash}
                  onChange={(e) => setSplitCash(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Restante a cobrar:</span>
                <span className="text-emerald-700 font-bold">
                  ${Math.max(0, total - (parseFloat(splitCash) || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSplitOtherMethod('card')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    splitOtherMethod === 'card'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Resto con Tarjeta
                </button>
                <button
                  type="button"
                  onClick={() => setSplitOtherMethod('transfer')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    splitOtherMethod === 'transfer'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Resto con Transferencia
                </button>
              </div>
            </div>
          )}

          {/* Customer Details (for digital WhatsApp ticket) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="block text-xs font-bold text-slate-700">
              Datos del Cliente (Opcional para recibo WhatsApp)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="tel"
                  placeholder="WhatsApp (ej. 5512345678)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isCashInsufficient}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isCashInsufficient
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 active:scale-[0.98]'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>
                Completar Cobro ${total.toFixed(2)}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
