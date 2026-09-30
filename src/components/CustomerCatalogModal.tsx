import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Send,
  Eye,
  ArrowRight,
  Store,
} from 'lucide-react';
import { BusinessProfile, Product, ProductVariant } from '../types/pos';

interface CustomerCatalogModalProps {
  products: Product[];
  business: BusinessProfile;
  onPlaceCustomerOrder?: (orderItems: { product: Product; variant?: ProductVariant; quantity: number }[], customerName: string, customerPhone: string) => void;
}

export const CustomerCatalogModal: React.FC<CustomerCatalogModalProps> = ({
  products,
  business,
  onPlaceCustomerOrder,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'preview'>('share');

  // Customer order preview state
  const [customerCart, setCustomerCart] = useState<
    { product: Product; variant?: ProductVariant; quantity: number }[]
  >([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  // Clean shareable web URL
  const catalogUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#catalogo`
    : 'https://catalogo.kytepos.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = `👋 ¡Hola! Te invito a consultar nuestro catálogo digital de *${business.name}*:\n👉 ${catalogUrl}\n\nPuedes ver nuestros productos, precios y hacernos tu pedido directamente. ¡Esperamos tu compra!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const addToCustomerCart = (product: Product, variant?: ProductVariant) => {
    setCustomerCart((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.variant?.id === variant?.id
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, variant, quantity: 1 }];
    });
  };

  const updateCustomerCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCustomerCart(customerCart.filter((_, i) => i !== index));
    } else {
      setCustomerCart(
        customerCart.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const customerTotal = customerCart.reduce((sum, item) => {
    const price = item.variant ? item.variant.price : item.product.salePrice;
    return sum + price * item.quantity;
  }, 0);

  const handleSendCustomerOrderViaWhatsApp = () => {
    if (customerCart.length === 0) return;

    const lines = [
      `🛒 *NUEVO PEDIDO DESDE CATÁLOGO WEB*`,
      `Tienda: *${business.name}*`,
      customerName ? `Cliente: *${customerName}*` : '',
      customerPhone ? `Tel: ${customerPhone}` : '',
      `--------------------------------`,
      `*PEDIDO:*`,
      ...customerCart.map((item) => {
        const p = item.variant ? item.variant.price : item.product.salePrice;
        return `• ${item.quantity}x ${item.product.name}${
          item.variant ? ` (${item.variant.name})` : ''
        } - $${(p * item.quantity).toFixed(2)}`;
      }),
      `--------------------------------`,
      `*TOTAL ESTIMADO: $${customerTotal.toFixed(2)} ${business.currency}*`,
      `\n¿Podrían confirmarme el tiempo de entrega y método de pago? ¡Gracias!`,
    ].filter(Boolean);

    const encoded = encodeURIComponent(lines.join('\n'));
    const merchantPhone = business.phone.replace(/\D/g, '');
    const url = merchantPhone
      ? `https://api.whatsapp.com/send?phone=${merchantPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    if (onPlaceCustomerOrder) {
      onPlaceCustomerOrder(customerCart, customerName, customerPhone);
    }

    window.open(url, '_blank');
    setOrderSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-3 sm:p-6 space-y-4 pb-24 lg:pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            Catálogo Web para Clientes
          </h2>
          <p className="text-xs text-slate-500">
            Comparte tu tienda virtual con clientes para recibir pedidos directos a WhatsApp
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('share')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'share'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Enlace & QR
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Vista Cliente
          </button>
        </div>
      </div>

      {activeTab === 'share' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Share Links & WhatsApp */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Enlace de tu Catálogo Digital
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tus clientes podrán ver tus productos actualizados en tiempo real con fotos,
              descripciones y enviarte sus pedidos a WhatsApp con un solo clic.
            </p>

            {/* URL input with copy */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Enlace Web</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={catalogUrl}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 font-mono text-slate-700 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Direct WhatsApp Share button */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Compartir Catálogo por WhatsApp</span>
            </button>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold">💡 Consejo para más ventas:</p>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                Pega este enlace en la bio de tu Instagram, perfil de WhatsApp Business, o en tus
                redes sociales para recibir pedidos 24/7 sin comisiones.
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
              {/* Generated SVG QR Code representation */}
              <div className="w-44 h-44 bg-white p-3 rounded-xl border border-slate-300 flex flex-col items-center justify-center shadow-xs">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  {/* Outer corner top-left */}
                  <rect x="10" y="10" width="26" height="26" rx="4" />
                  <rect x="14" y="14" width="18" height="18" fill="white" />
                  <rect x="18" y="18" width="10" height="10" fill="#059669" />

                  {/* Outer corner top-right */}
                  <rect x="64" y="10" width="26" height="26" rx="4" />
                  <rect x="68" y="14" width="18" height="18" fill="white" />
                  <rect x="72" y="18" width="10" height="10" fill="#059669" />

                  {/* Outer corner bottom-left */}
                  <rect x="10" y="64" width="26" height="26" rx="4" />
                  <rect x="14" y="68" width="18" height="18" fill="white" />
                  <rect x="18" y="72" width="10" height="10" fill="#059669" />

                  {/* Data dots pattern */}
                  <circle cx="45" cy="20" r="3" />
                  <circle cx="55" cy="20" r="3" />
                  <circle cx="50" cy="30" r="3" />
                  <circle cx="45" cy="40" r="3" />
                  <circle cx="55" cy="50" r="3" />
                  <circle cx="20" cy="50" r="3" />
                  <circle cx="30" cy="50" r="3" />
                  <circle cx="70" cy="50" r="3" />
                  <circle cx="80" cy="50" r="3" />
                  <circle cx="50" cy="70" r="3" />
                  <circle cx="65" cy="75" r="3" />
                  <circle cx="75" cy="65" r="3" />
                  <circle cx="85" cy="85" r="3" />
                  <circle cx="45" cy="85" r="3" />
                  <circle cx="60" cy="85" r="3" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Código QR de tu Catálogo</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Imprímelo y colócalo en el mostrador o en tus mesas
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Imprimir QR para mostrador
            </button>
          </div>
        </div>
      ) : (
        /* CUSTOMER VIEW SIMULATOR */
        <div className="bg-slate-100 p-3 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{business.name}</h3>
                <p className="text-xs text-slate-500">{business.slogan} • Catálogo Oficial</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {products.length} productos disponibles
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Products grid in customer view */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex gap-3 items-center"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{prod.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{prod.description || prod.category}</p>
                    <span className="text-sm font-extrabold text-emerald-700 block mt-1">
                      ${prod.salePrice.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCustomerCart(prod)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    + Pedir
                  </button>
                </div>
              ))}
            </div>

            {/* Customer Cart & WhatsApp Order Form */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    Tu Pedido ({customerCart.reduce((s, i) => s + i.quantity, 0)})
                  </h4>
                  {customerCart.length > 0 && (
                    <button
                      onClick={() => setCustomerCart([])}
                      className="text-[11px] text-rose-500 font-semibold"
                    >
                      Vaciar
                    </button>
                  )}
                </div>

                <div className="space-y-2 py-3 max-h-48 overflow-y-auto">
                  {customerCart.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      El cliente seleccionará productos para armar su pedido
                    </p>
                  ) : (
                    customerCart.map((item, idx) => {
                      const price = item.variant ? item.variant.price : item.product.salePrice;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded-lg"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="font-semibold text-slate-800 truncate">
                              {item.product.name}
                            </p>
                            <span className="text-emerald-700 font-bold">
                              ${(price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateCustomerCartQty(idx, item.quantity - 1)}
                              className="w-5 h-5 bg-white border border-slate-200 rounded flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                            <button
                              onClick={() => updateCustomerCartQty(idx, item.quantity + 1)}
                              className="w-5 h-5 bg-white border border-slate-200 rounded flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Order total & Customer inputs */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Total estimado:</span>
                  <span className="text-emerald-700 text-base">${customerTotal.toFixed(2)}</span>
                </div>

                <input
                  type="text"
                  placeholder="Tu Nombre"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200"
                />

                <input
                  type="tel"
                  placeholder="Tu WhatsApp (ej. 5512345678)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200"
                />

                <button
                  onClick={handleSendCustomerOrderViaWhatsApp}
                  disabled={customerCart.length === 0}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 shadow-md transition ${
                    customerCart.length === 0
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 active:scale-95'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Pedido a WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
