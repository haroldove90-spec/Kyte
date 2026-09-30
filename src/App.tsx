/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BusinessProfile,
  CartItem,
  CashRegisterSession,
  OrderStatus,
  Product,
  ProductVariant,
  Sale,
} from './types/pos';
import {
  getActiveRole,
  getBusinessProfile,
  getCashRegisterSession,
  getStoredProducts,
  getStoredSales,
  saveBusinessProfile,
  saveCashRegisterSession,
  saveProducts,
  saveSale,
  setActiveRole as setStorageActiveRole,
} from './utils/storage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { RoleSelectScreen } from './components/RoleSelectScreen';
import { POSModule } from './components/POSModule';
import { CatalogModule } from './components/CatalogModule';
import { OrdersModule } from './components/OrdersModule';
import { CashRegisterModule } from './components/CashRegisterModule';
import { CustomerCatalogModal } from './components/CustomerCatalogModal';
import { CheckoutModal } from './components/CheckoutModal';
import { TicketModal } from './components/TicketModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [activeRole, setActiveRole] = useState<string | null>(() => getActiveRole());
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>(() => getStoredSales());
  const [registerSession, setRegisterSession] = useState<CashRegisterSession>(() =>
    getCashRegisterSession()
  );
  const [business, setBusiness] = useState<BusinessProfile>(() => getBusinessProfile());

  // Modals & Drawers
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [activeTicketSale, setActiveTicketSale] = useState<Sale | null>(null);

  // Online / Offline & Sync
  const { isOnline, offlineCount, isSyncing, syncNow, refreshOfflineCount } = useOnlineStatus();

  // Reload products/sales from storage whenever a sync or update occurs
  const reloadData = () => {
    setProducts(getStoredProducts());
    setSales(getStoredSales());
    setRegisterSession(getCashRegisterSession());
    refreshOfflineCount();
  };

  const handleSelectRole = (role: 'admin') => {
    setStorageActiveRole(role);
    setActiveRole(role);
  };

  const handleLogout = () => {
    setStorageActiveRole(null);
    setActiveRole(null);
    setCart([]);
    setCheckoutModalOpen(false);
    setActiveTicketSale(null);
  };

  // Cart operations
  const handleAddToCart = (product: Product, variant?: ProductVariant) => {
    setCart((prev) => {
      const lineId = variant ? `${product.id}-${variant.id}` : product.id;
      const existing = prev.find((item) => item.id === lineId);
      const unitPrice = variant ? variant.price : product.salePrice;

      if (existing) {
        return prev.map((item) =>
          item.id === lineId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      const newItem: CartItem = {
        id: lineId,
        productId: product.id,
        productName: product.name,
        image: product.image,
        variantId: variant?.id,
        variantName: variant?.name,
        unitPrice,
        quantity: 1,
      };

      return [...prev, newItem];
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Sale Completion
  const handleCompleteSale = (sale: Sale) => {
    saveSale(sale);
    reloadData();
    setCart([]);
    setCheckoutModalOpen(false);
    setActiveTicketSale(sale); // Immediately display ticket modal with WhatsApp sending option
  };

  // Product management
  const handleSaveProduct = (updatedProduct: Product) => {
    const existing = products.find((p) => p.id === updatedProduct.id);
    let newProducts: Product[];
    if (existing) {
      newProducts = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    } else {
      newProducts = [updatedProduct, ...products];
    }
    saveProducts(newProducts);
    setProducts(newProducts);
  };

  const handleDeleteProduct = (productId: string) => {
    const newProducts = products.filter((p) => p.id !== productId);
    saveProducts(newProducts);
    setProducts(newProducts);
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    const newProducts = products.map((p) =>
      p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
    );
    saveProducts(newProducts);
    setProducts(newProducts);
  };

  // Order status update
  const handleUpdateOrderStatus = (saleId: string, status: OrderStatus) => {
    const updatedSales = sales.map((s) => (s.id === saleId ? { ...s, status } : s));
    localStorage.setItem('kyte_pos_sales_v1', JSON.stringify(updatedSales));
    setSales(updatedSales);
  };

  // Cash Register Session update
  const handleUpdateSession = (newSession: CashRegisterSession) => {
    saveCashRegisterSession(newSession);
    setRegisterSession(newSession);
  };

  // Customer order placed via Web Catalog
  const handlePlaceCustomerOrder = (
    orderItems: { product: Product; variant?: ProductVariant; quantity: number }[],
    customerName: string,
    customerPhone: string
  ) => {
    // Generate an order in 'pending' status
    const cartItems: CartItem[] = orderItems.map((item) => ({
      id: `${item.product.id}-${item.variant ? item.variant.id : 'std'}`,
      productId: item.product.id,
      productName: item.product.name,
      image: item.product.image,
      variantId: item.variant?.id,
      variantName: item.variant?.name,
      unitPrice: item.variant ? item.variant.price : item.product.salePrice,
      quantity: item.quantity,
    }));

    const subtotal = cartItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);

    const pendingOrder: Sale = {
      id: `order-${Date.now()}`,
      ticketNumber: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: Date.now(),
      items: cartItems,
      subtotal,
      discount: 0,
      total: subtotal,
      payment: {
        method: 'transfer',
        amountReceived: subtotal,
        change: 0,
      },
      customerName: customerName || 'Cliente Web',
      customerPhone: customerPhone || undefined,
      cashier: 'Catálogo Web',
      status: 'pending',
      synced: isOnline,
      source: 'web_catalog',
    };

    saveSale(pendingOrder);
    reloadData();
  };

  // If no role has been chosen yet, show the Role Selector Screen
  if (!activeRole) {
    return <RoleSelectScreen onSelectRole={handleSelectRole} />;
  }

  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const pendingOrdersCount = sales.filter((s) => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Cabecera Institucional Unificada */}
      <Header
        business={business}
        role={activeRole}
        onLogout={handleLogout}
        isOnline={isOnline}
        offlineCount={offlineCount}
        isSyncing={isSyncing}
        onSync={syncNow}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* Floating Offline Notification banner */}
      <OfflineIndicator
        isOnline={isOnline}
        offlineCount={offlineCount}
        isSyncing={isSyncing}
        onSync={syncNow}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* 2. Lateral Sidebar (Desktop) + Mobile Drawer */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
          pendingOrdersCount={pendingOrdersCount}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          business={business}
          activeRole={activeRole}
        />

        {/* 3. Main Workspace without duplicate horizontal tabs */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {activeTab === 'pos' && (
            <POSModule
              products={products}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onOpenCheckout={() => setCheckoutModalOpen(true)}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogModule
              products={products}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersModule
              sales={sales}
              business={business}
              onViewTicket={(sale) => setActiveTicketSale(sale)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'register' && (
            <CashRegisterModule
              session={registerSession}
              sales={sales}
              business={business}
              onUpdateSession={handleUpdateSession}
            />
          )}

          {activeTab === 'share' && (
            <CustomerCatalogModal
              products={products}
              business={business}
              onPlaceCustomerOrder={handlePlaceCustomerOrder}
            />
          )}
        </main>
      </div>

      {/* CHECKOUT MODAL */}
      {checkoutModalOpen && (
        <CheckoutModal
          cart={cart}
          subtotal={cartSubtotal}
          cashier={activeRole === 'admin' ? 'Administrador' : activeRole}
          isOnline={isOnline}
          onClose={() => setCheckoutModalOpen(false)}
          onCompleteSale={handleCompleteSale}
        />
      )}

      {/* DIGITAL TICKET & WHATSAPP MODAL */}
      {activeTicketSale && (
        <TicketModal
          sale={activeTicketSale}
          business={business}
          onClose={() => setActiveTicketSale(null)}
          onNewSale={() => {
            setActiveTicketSale(null);
            setActiveTab('pos');
          }}
        />
      )}
    </div>
  );
}
