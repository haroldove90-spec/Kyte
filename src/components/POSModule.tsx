import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  AlertTriangle,
  ArrowRight,
  Layers,
  X,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { CartItem, Product, ProductVariant } from '../types/pos';

interface POSModuleProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
  onUpdateCartQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveFromCart: (cartItemId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export const POSModule: React.FC<POSModuleProps> = ({
  products,
  cart,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onClearCart,
  onOpenCheckout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedProductForVariant, setSelectedProductForVariant] =
    useState<Product | null>(null);
  const [mobileCartDrawerOpen, setMobileCartDrawerOpen] = useState(false);

  // Extract unique categories
  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products by category and search
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'Todos' || prod.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      prod.name.toLowerCase().includes(query) ||
      prod.sku.toLowerCase().includes(query) ||
      prod.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleProductClick = (product: Product) => {
    if (product.stock <= 0) return;
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      setSelectedProductForVariant(product);
    } else {
      onAddToCart(product);
    }
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    if (selectedProductForVariant) {
      onAddToCart(selectedProductForVariant, variant);
      setSelectedProductForVariant(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full gap-4 p-2 sm:p-4 pb-20 lg:pb-6">
      {/* LEFT AREA: Catalog & Search & Filters */}
      <div className="flex-1 flex flex-col min-w-0 space-y-3">
        {/* Search & Category Filter Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por producto, código o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories horizontal scrolling chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid: 2 cols on mobile, 3-4 cols on tablet/desktop */}
        <div className="flex-1 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No se encontraron productos</p>
              <p className="text-xs text-slate-400 mt-1">
                Prueba con otro término de búsqueda o categoría
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock =
                  !isOutOfStock && product.stock <= product.lowStockThreshold;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleProductClick(product)}
                    className={`group relative bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between transition-all select-none ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed bg-slate-50'
                        : 'cursor-pointer hover:border-emerald-500 hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    {/* Image thumbnail */}
                    <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to placeholder if image fails
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      {/* Category Badge */}
                      <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>

                      {/* Stock badge */}
                      {isOutOfStock ? (
                        <span className="absolute top-2 right-2 text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                          Quedan {product.stock}
                        </span>
                      ) : null}

                      {/* Variants indicator */}
                      {product.hasVariants && (
                        <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-emerald-600/90 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <Layers className="w-3 h-3" /> Variantes
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex flex-col flex-1 justify-between">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition">
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">SKU: {product.sku}</p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-emerald-700">
                          ${product.salePrice.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition shadow-xs"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: Desktop Sticky Cart Panel */}
      <div className="hidden lg:flex flex-col w-96 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0 overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Caja de Cobro</h3>
              <p className="text-[11px] text-slate-500">
                {cartItemCount} {cartItemCount === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              title="Vaciar carrito"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingCart className="w-12 h-12 stroke-[1.2] mb-2 text-slate-300" />
              <p className="font-semibold text-sm text-slate-600">Carrito vacío</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Selecciona productos del catálogo para agregarlos a la venta
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition"
              >
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs text-slate-800 truncate">
                    {item.productName}
                  </h5>
                  {item.variantName && (
                    <span className="text-[10px] text-emerald-700 font-medium block">
                      {item.variantName}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-700">
                    ${item.unitPrice.toFixed(2)}
                  </span>
                </div>

                {/* Counter buttons */}
                <div className="flex items-center gap-1.5 shrink-0 bg-white px-1.5 py-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => onUpdateCartQuantity(item.id, item.quantity - 1)}
                    className="p-0.5 text-slate-500 hover:text-slate-800 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center font-bold text-xs text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateCartQuantity(item.id, item.quantity + 1)}
                    className="p-0.5 text-slate-500 hover:text-slate-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onRemoveFromCart(item.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Total:</span>
              <span className="text-emerald-700">${cartSubtotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onOpenCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              cart.length === 0
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 active:scale-[0.98]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cobrar ${cartSubtotal.toFixed(2)}</span>
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET: Floating Bottom Summary Sticky Card */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-16 sm:bottom-16 left-0 right-0 z-30 px-3 py-2 pointer-events-none">
          <div className="max-w-lg mx-auto bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 pointer-events-auto">
            <button
              onClick={() => setMobileCartDrawerOpen(true)}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="relative w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-slate-950 text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block leading-tight">Ver Carrito</span>
                <span className="font-extrabold text-sm text-emerald-400">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>
            </button>

            <button
              onClick={onOpenCheckout}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95 transition"
            >
              <span>Cobrar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE CART FULL DRAWER */}
      {mobileCartDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileCartDrawerOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl z-10">
            {/* Drawer top handle */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2" />

            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Carrito de Venta ({cartItemCount})</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
                >
                  Vaciar
                </button>
                <button
                  onClick={() => setMobileCartDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-11 h-11 rounded-lg object-cover bg-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-800 truncate">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-[10px] text-emerald-600">{item.variantName}</p>
                      )}
                      <p className="text-xs font-semibold text-slate-700">
                        ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                      <button
                        onClick={() => onUpdateCartQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-slate-500"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateCartQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-slate-500"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 pb-8">
              <div className="flex justify-between items-center text-lg font-black text-slate-900">
                <span>Total a Cobrar:</span>
                <span className="text-emerald-700">${cartSubtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  setMobileCartDrawerOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <CreditCard className="w-5 h-5" />
                <span>Cobrar ${cartSubtotal.toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VARIANTS PICKER MODAL */}
      {selectedProductForVariant && selectedProductForVariant.variants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {selectedProductForVariant.name}
                </h4>
                <p className="text-xs text-slate-500">Selecciona una variante:</p>
              </div>
              <button
                onClick={() => setSelectedProductForVariant(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2">
              {selectedProductForVariant.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelectVariant(v)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition cursor-pointer text-left"
                >
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">{v.name}</span>
                    <span className="text-[11px] text-slate-500">Stock: {v.stock} disp.</span>
                  </div>
                  <span className="font-extrabold text-base text-emerald-700">
                    ${v.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
