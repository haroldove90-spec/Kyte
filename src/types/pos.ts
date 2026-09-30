export type RoleType = 'admin';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Chica", "Grande", "Vainilla"
  price: number; // variant price or price modifier
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  image: string;
  description?: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

export interface CartItem {
  id: string; // unique item cart line ID
  productId: string;
  productName: string;
  image: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
}

export type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'split';

export interface PaymentDetails {
  method: PaymentMethodType;
  amountReceived: number; // for cash
  change: number; // for cash
  reference?: string; // for card voucher or transfer folio
  cardLast4?: string;
  splitCash?: number;
  splitOther?: number;
  splitOtherMethod?: 'card' | 'transfer';
}

export type OrderStatus = 'completed' | 'pending' | 'delivered' | 'cancelled';

export interface Sale {
  id: string;
  ticketNumber: string;
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment: PaymentDetails;
  customerName?: string;
  customerPhone?: string;
  cashier: string; // e.g. "Admin"
  status: OrderStatus;
  synced: boolean;
  source: 'pos' | 'web_catalog';
}

export interface CashMovement {
  id: string;
  timestamp: number;
  type: 'in' | 'out'; // entrada o retiro
  amount: number;
  reason: string;
}

export interface CashRegisterSession {
  id: string;
  openedAt: number;
  closedAt?: number;
  isOpen: boolean;
  initialCash: number;
  cashMovements: CashMovement[];
  notes?: string;
}

export interface BusinessProfile {
  name: string;
  slogan: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number; // percentage, e.g. 0 or 16
  receiptFooterMessage: string;
}
