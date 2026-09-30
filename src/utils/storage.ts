import { BusinessProfile, CashRegisterSession, Product, Sale } from '../types/pos';

const STORAGE_KEYS = {
  PRODUCTS: 'kyte_pos_products_v1',
  SALES: 'kyte_pos_sales_v1',
  REGISTER: 'kyte_pos_register_v1',
  BUSINESS: 'kyte_pos_business_v1',
  OFFLINE_QUEUE: 'kyte_pos_offline_queue_v1',
  ACTIVE_ROLE: 'kyte_pos_active_role_v1',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Café Americano Gourmet',
    sku: 'BEB-001',
    category: 'Bebidas',
    salePrice: 45.0,
    costPrice: 15.0,
    stock: 45,
    lowStockThreshold: 10,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
    description: 'Café de grano tostado artesanal 100% arábica.',
    hasVariants: true,
    variants: [
      { id: 'v-1a', name: 'Regular (12 oz)', price: 45.0, stock: 25 },
      { id: 'v-1b', name: 'Grande (16 oz)', price: 55.0, stock: 20 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Capuccino Vainilla',
    sku: 'BEB-002',
    category: 'Bebidas',
    salePrice: 60.0,
    costPrice: 22.0,
    stock: 30,
    lowStockThreshold: 8,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=400&q=80',
    description: 'Espresso con leche cremada y toque de jarabe de vainilla.',
  },
  {
    id: 'prod-3',
    name: 'Sandwich Bagel Jamón & Queso',
    sku: 'ALM-001',
    category: 'Alimentos',
    salePrice: 85.0,
    costPrice: 35.0,
    stock: 18,
    lowStockThreshold: 5,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80',
    description: 'Bagel tostado con jamón de pavo, queso gouda y aderezo especial.',
  },
  {
    id: 'prod-4',
    name: 'Croissant Horneado con Mantequilla',
    sku: 'POS-001',
    category: 'Postres',
    salePrice: 42.0,
    costPrice: 14.0,
    stock: 22,
    lowStockThreshold: 6,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80',
    description: 'Hojaldre crujiente horneado diariamente con mantequilla pura.',
  },
  {
    id: 'prod-5',
    name: 'Jugo Verde Detox Natural',
    sku: 'BEB-003',
    category: 'Bebidas',
    salePrice: 50.0,
    costPrice: 18.0,
    stock: 15,
    lowStockThreshold: 5,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80',
    description: 'Espinaca, apio, pepino, manzana verde y limón sin azúcar añadida.',
  },
  {
    id: 'prod-6',
    name: 'Tarta de Frutos Rojos',
    sku: 'POS-002',
    category: 'Postres',
    salePrice: 65.0,
    costPrice: 24.0,
    stock: 8,
    lowStockThreshold: 4,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80',
    description: 'Base crocante rellena de crema pastelera y frutos del bosque frescos.',
  },
  {
    id: 'prod-7',
    name: 'Ensalada César con Pollo Grill',
    sku: 'ALM-002',
    category: 'Alimentos',
    salePrice: 110.0,
    costPrice: 45.0,
    stock: 12,
    lowStockThreshold: 4,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    description: 'Lechuga orejona, pechuga a la plancha, parmesano y crutones caseros.',
  },
  {
    id: 'prod-8',
    name: 'Agua Purificada Embotellada (600ml)',
    sku: 'BEB-004',
    category: 'Bebidas',
    salePrice: 20.0,
    costPrice: 6.0,
    stock: 4, // low stock test
    lowStockThreshold: 10,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80',
    description: 'Agua natural sin gas baja en sodio.',
  },
];

export const INITIAL_BUSINESS: BusinessProfile = {
  name: 'Cafetería & Bistro Delicias',
  slogan: 'Punto de venta y caja móvil',
  phone: '+52 55 1234 5678',
  address: 'Av. Insurgentes Sur 452, CDMX',
  currency: 'MXN',
  taxRate: 0,
  receiptFooterMessage: '¡Gracias por su compra! Vuelva pronto.',
};

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading products from storage:', err);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving products:', err);
  }
}

export function getStoredSales(): Sale[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading sales:', err);
    return [];
  }
}

export function saveSale(sale: Sale): void {
  try {
    const currentSales = getStoredSales();
    const updatedSales = [sale, ...currentSales];
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updatedSales));

    // Descontar inventario
    const products = getStoredProducts();
    for (const item of sale.items) {
      const prodIndex = products.findIndex((p) => p.id === item.productId);
      if (prodIndex !== -1) {
        const prod = products[prodIndex];
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (item.variantId && prod.variants) {
          const varIndex = prod.variants.findIndex((v) => v.id === item.variantId);
          if (varIndex !== -1) {
            prod.variants[varIndex].stock = Math.max(0, prod.variants[varIndex].stock - item.quantity);
          }
        }
      }
    }
    saveProducts(products);

    // If offline, save in offline sync queue
    if (!sale.synced) {
      const queue = getOfflineQueue();
      queue.push(sale.id);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    }
  } catch (err) {
    console.error('Error saving sale:', err);
  }
}

export function getOfflineQueue(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markSalesAsSynced(saleIds: string[]): void {
  try {
    const sales = getStoredSales();
    const updated = sales.map((s) => (saleIds.includes(s.id) ? { ...s, synced: true } : s));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  } catch (err) {
    console.error('Error marking sales as synced:', err);
  }
}

export function getCashRegisterSession(): CashRegisterSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTER);
    if (!raw) {
      const defaultSession: CashRegisterSession = {
        id: `caja-${Date.now()}`,
        openedAt: Date.now(),
        isOpen: true,
        initialCash: 500.0, // fondo inicial estándar
        cashMovements: [],
      };
      localStorage.setItem(STORAGE_KEYS.REGISTER, JSON.stringify(defaultSession));
      return defaultSession;
    }
    return JSON.parse(raw);
  } catch {
    return {
      id: `caja-${Date.now()}`,
      openedAt: Date.now(),
      isOpen: true,
      initialCash: 500.0,
      cashMovements: [],
    };
  }
}

export function saveCashRegisterSession(session: CashRegisterSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTER, JSON.stringify(session));
  } catch (err) {
    console.error('Error saving cash register session:', err);
  }
}

export function getBusinessProfile(): BusinessProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUSINESS);
    return raw ? JSON.parse(raw) : INITIAL_BUSINESS;
  } catch {
    return INITIAL_BUSINESS;
  }
}

export function saveBusinessProfile(profile: BusinessProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving business profile:', err);
  }
}

export function getActiveRole(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
  } catch {
    return null;
  }
}

export function setActiveRole(role: string | null): void {
  try {
    if (role) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
    }
  } catch (err) {
    console.error('Error setting active role:', err);
  }
}

export function generateTicketNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `T-${year}${month}${day}-${random}`;
}
