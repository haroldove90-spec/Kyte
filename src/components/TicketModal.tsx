import React, { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  Share2,
  Copy,
  Check,
  X,
  Store,
  Phone,
  Calendar,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { BusinessProfile, Sale } from '../types/pos';

interface TicketModalProps {
  sale: Sale;
  business: BusinessProfile;
  onClose: () => void;
  onNewSale: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  sale,
  business,
  onClose,
  onNewSale,
}) => {
  const [copied, setCopied] = useState(false);
  const [customerPhoneInput, setCustomerPhoneInput] = useState(
    sale.customerPhone || ''
  );

  const formattedDate = new Date(sale.timestamp).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'card':
        return 'Tarjeta Débito/Crédito';
      case 'transfer':
        return 'Transferencia (SPEI)';
      case 'split':
        return 'Pago Dividido / Mixto';
      default:
        return method;
    }
  };

  // Generate plain-text ticket for WhatsApp & Clipboard
  const generateTicketText = () => {
    const lines = [
      `🧾 *${business.name.toUpperCase()}*`,
      `${business.slogan}`,
      `📍 ${business.address}`,
      `📞 Tel: ${business.phone}`,
      `--------------------------------`,
      `*RECIBO DIGITAL DE COMPRA*`,
      `Ticket: #${sale.ticketNumber}`,
      `Fecha: ${formattedDate}`,
      `Atendió: ${sale.cashier}`,
      sale.customerName ? `Cliente: ${sale.customerName}` : '',
      `--------------------------------`,
      `*DETALLE:*`,
      ...sale.items.map(
        (item) =>
          `• ${item.quantity}x ${item.productName}${
            item.variantName ? ` (${item.variantName})` : ''
          } - $${(item.unitPrice * item.quantity).toFixed(2)}`
      ),
      `--------------------------------`,
      sale.discount > 0 ? `Descuento: -$${sale.discount.toFixed(2)}` : '',
      `*TOTAL: $${sale.total.toFixed(2)} ${business.currency}*`,
      `Método de pago: ${getPaymentMethodName(sale.payment.method)}`,
      sale.payment.method === 'cash'
        ? `Recibido: $${sale.payment.amountReceived.toFixed(2)} | Cambio: $${sale.payment.change.toFixed(2)}`
        : '',
      sale.payment.reference ? `Ref/Folio: ${sale.payment.reference}` : '',
      `--------------------------------`,
      `${business.receiptFooterMessage}`,
      `📱 Generado con Kyte POS Móvil`,
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleCopy = () => {
    const text = generateTicketText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const text = generateTicketText();
    const encoded = encodeURIComponent(text);
    // Sanitize phone number (strip spaces, dashes, etc.)
    const cleanPhone = customerPhoneInput.replace(/\D/g, '');

    let url = '';
    if (cleanPhone) {
      url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encoded}`;
    }
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-4 border border-slate-200">
        {/* Header Bar */}
        <div className="bg-emerald-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-200" />
            <div>
              <h3 className="font-bold text-base leading-tight">¡Venta Registrada!</h3>
              <p className="text-xs text-emerald-100">Ticket #{sale.ticketNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-5 overflow-y-auto max-h-[60vh] bg-slate-50/50">
          <div
            id="printable-ticket"
            className="bg-white p-5 rounded-xl border border-dashed border-slate-300 shadow-xs font-mono text-xs text-slate-800 space-y-3"
          >
            {/* Header info */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <h4 className="font-bold text-sm tracking-wider text-slate-900 font-sans">
                {business.name}
              </h4>
              <p className="text-[11px] text-slate-500 font-sans">{business.slogan}</p>
              <p className="text-[11px] text-slate-500">{business.address}</p>
              <p className="text-[11px] text-slate-500">Tel: {business.phone}</p>
            </div>

            {/* Meta */}
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Folio: #{sale.ticketNumber}</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Atendió: {sale.cashier}</span>
              {sale.customerName && <span>Cliente: {sale.customerName}</span>}
            </div>

            {/* Items table */}
            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 pb-1 border-b border-slate-200 text-[11px]">
                <span>CANT / ARTÍCULO</span>
                <span>TOTAL</span>
              </div>
              {sale.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-[11px]">
                  <div className="pr-2">
                    <span className="font-semibold">{item.quantity}x</span> {item.productName}
                    {item.variantName && (
                      <span className="text-slate-500 block text-[10px]">
                        ({item.variantName})
                      </span>
                    )}
                  </div>
                  <span className="font-medium shrink-0">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals & Payment */}
            <div className="pt-3 border-t border-dashed border-slate-300 space-y-1">
              {sale.discount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Descuento aplicado:</span>
                  <span>-${sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                <span>TOTAL A PAGAR:</span>
                <span className="text-emerald-700 font-sans font-extrabold">
                  ${sale.total.toFixed(2)} {business.currency}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 text-[11px]">
                <span>Método de pago:</span>
                <span className="font-semibold">{getPaymentMethodName(sale.payment.method)}</span>
              </div>
              {sale.payment.method === 'cash' && (
                <>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Efectivo entregado:</span>
                    <span>${sale.payment.amountReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700 text-[11px]">
                    <span>Cambio:</span>
                    <span>${sale.payment.change.toFixed(2)}</span>
                  </div>
                </>
              )}
              {sale.payment.reference && (
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>Folio/Ref:</span>
                  <span>{sale.payment.reference}</span>
                </div>
              )}
            </div>

            {/* Footer note */}
            <div className="pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500">
              <p>{business.receiptFooterMessage}</p>
              <p className="mt-1 font-sans text-[9px] text-slate-400">
                Punto de venta móvil | Kyte POS
              </p>
            </div>
          </div>

          {/* WhatsApp Direct Send Section */}
          <div className="mt-4 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
            <label className="block text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Enviar recibo por WhatsApp
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Teléfono (ej. 5512345678)"
                value={customerPhoneInput}
                onChange={(e) => setCustomerPhoneInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendWhatsApp}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </div>
            <p className="text-[10px] text-emerald-700">
              Abre WhatsApp con el recibo formateado listo para enviar al cliente.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Imprimir ticket térmico"
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={handleCopy}
              title="Copiar texto del ticket"
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onNewSale();
            }}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
          >
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
};
