import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  MessageCircle,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  WifiOff,
  CloudCheck,
  Filter,
} from 'lucide-react';
import { BusinessProfile, OrderStatus, Sale } from '../types/pos';

interface OrdersModuleProps {
  sales: Sale[];
  business: BusinessProfile;
  onViewTicket: (sale: Sale) => void;
  onUpdateOrderStatus: (saleId: string, status: OrderStatus) => void;
}

export const OrdersModule: React.FC<OrdersModuleProps> = ({
  sales,
  business,
  onViewTicket,
  onUpdateOrderStatus,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today'>('all');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      !search ||
      sale.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      (sale.customerName &&
        sale.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (sale.customerPhone && sale.customerPhone.includes(search));

    const matchesStatus =
      statusFilter === 'all' || sale.status === statusFilter;

    const matchesDate =
      dateFilter === 'all' || sale.timestamp >= todayStart;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Pagado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pendiente
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            <Truck className="w-3 h-3 text-blue-600" />
            Entregado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Cancelado
          </span>
        );
    }
  };

  const handleQuickWhatsApp = (sale: Sale) => {
    const lines = [
      `🧾 *${business.name.toUpperCase()}*`,
      `Ticket: #${sale.ticketNumber}`,
      `Total: $${sale.total.toFixed(2)} ${business.currency}`,
      `Estado: ${sale.status.toUpperCase()}`,
      `Artículos:`,
      ...sale.items.map(
        (i) =>
          `• ${i.quantity}x ${i.productName}${
            i.variantName ? ` (${i.variantName})` : ''
          } - $${(i.unitPrice * i.quantity).toFixed(2)}`
      ),
      `\n¡Gracias por su preferencia!`,
    ];
    const encoded = encodeURIComponent(lines.join('\n'));
    const phone = sale.customerPhone ? sale.customerPhone.replace(/\D/g, '') : '';
    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-3 sm:p-6 space-y-4 pb-24 lg:pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            Historial de Ventas y Pedidos
          </h2>
          <p className="text-xs text-slate-500">
            {sales.length} ventas registradas • Envío de tickets por WhatsApp y control de entrega
          </p>
        </div>

        {/* Quick totals of filtered sales */}
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
          <span className="text-xs text-emerald-800 font-medium">Total Filtrado:</span>
          <span className="font-extrabold text-sm sm:text-base text-emerald-700">
            ${filteredSales.reduce((acc, s) => acc + s.total, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por # ticket, cliente o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Date Filter */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Pagado / Completado</option>
            <option value="pending">Pendiente de pago</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="text-center py-16 p-6">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No hay ventas registradas</p>
            <p className="text-xs text-slate-400 mt-1">
              Las ventas cobradas desde el módulo Vender aparecerán aquí automáticamente
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket / Fecha</th>
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Artículos</th>
                  <th className="py-3 px-4">Total & Pago</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Sincronización</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredSales.map((sale) => {
                  const formattedDate = new Date(sale.timestamp).toLocaleString('es-MX', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/60 transition">
                      {/* Ticket Number & Date */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block font-mono">
                          #{sale.ticketNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                      </td>

                      {/* Customer info */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block">
                          {sale.customerName || 'Cliente mostrador'}
                        </span>
                        {sale.customerPhone && (
                          <span className="text-[11px] text-emerald-700 font-mono">
                            {sale.customerPhone}
                          </span>
                        )}
                      </td>

                      {/* Items summary */}
                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium">
                          {sale.items.reduce((s, i) => s + i.quantity, 0)} artículos
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                          {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </span>
                      </td>

                      {/* Total & Payment */}
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-emerald-700 text-sm block">
                          ${sale.total.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          {sale.payment.method === 'cash'
                            ? 'Efectivo'
                            : sale.payment.method === 'card'
                            ? 'Tarjeta'
                            : sale.payment.method === 'transfer'
                            ? 'Transferencia'
                            : 'Mixto'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {getStatusBadge(sale.status)}
                          <select
                            value={sale.status}
                            onChange={(e) =>
                              onUpdateOrderStatus(sale.id, e.target.value as OrderStatus)
                            }
                            className="text-[10px] text-slate-500 border border-slate-200 rounded px-1 py-0.5 bg-white cursor-pointer"
                          >
                            <option value="completed">Pagado</option>
                            <option value="pending">Pendiente</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </td>

                      {/* Offline / Synced Status */}
                      <td className="py-3 px-4">
                        {sale.synced ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Sincronizado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <WifiOff className="w-3 h-3 text-amber-600" />
                            Guardado local
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewTicket(sale)}
                            title="Ver ticket digital"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleQuickWhatsApp(sale)}
                            title="Enviar recibo por WhatsApp"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
