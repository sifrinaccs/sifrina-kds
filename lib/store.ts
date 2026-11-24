import { Order, SIFRINA_BASE_RECIPE } from '../types/order';

// Almacén en memoria global para persistencia en contenedor serverless
declare global {
  // eslint-disable-next-line no-var
  var __sifrina_orders_store__: Order[] | undefined;
}

// 1. ELIMINACIÓN TOTAL DE MOCKS: El almacén inicia estrictamente vacío []
if (!globalThis.__sifrina_orders_store__) {
  globalThis.__sifrina_orders_store__ = [];
}

/**
 * Validador y conversor robusto para createdAt.
 * Previene "NaN:NaN" convirtiendo números, strings ISO o segundos a timestamp ms válidos.
 */
export const parseCreatedAt = (raw: unknown): number => {
  if (!raw) return Date.now();
  if (typeof raw === 'number') {
    if (isNaN(raw) || raw <= 0) return Date.now();
    // Si viene en segundos (ej. UNIX timestamp de 10 dígitos), convertir a ms
    return raw < 10000000000 ? raw * 1000 : raw;
  }
  const parsed = Date.parse(String(raw));
  return !isNaN(parsed) && parsed > 0 ? parsed : Date.now();
};

export const getOrders = (): Order[] => {
  return [...(globalThis.__sifrina_orders_store__ || [])].sort(
    (a, b) => b.createdAt - a.createdAt
  );
};

export const getOrderById = (id: string): Order | undefined => {
  return (globalThis.__sifrina_orders_store__ || []).find((o) => o.id === id);
};

export const upsertOrder = (orderData: Partial<Order> & { id: string }): Order => {
  const currentOrders = globalThis.__sifrina_orders_store__ || [];
  const existingIndex = currentOrders.findIndex((o) => o.id === orderData.id);

  if (existingIndex >= 0) {
    const existing = currentOrders[existingIndex];
    const updated: Order = {
      ...existing,
      ...orderData,
      phone: orderData.phone !== undefined ? orderData.phone : existing.phone,
      customerName: orderData.customerName || existing.customerName,
      status: orderData.status || existing.status,
      createdAt: orderData.createdAt ? parseCreatedAt(orderData.createdAt) : existing.createdAt,
    };
    if (orderData.status === 'dispatched' && !updated.completedAt) {
      updated.completedAt = Date.now();
    }
    currentOrders[existingIndex] = updated;
    globalThis.__sifrina_orders_store__ = currentOrders;
    return updated;
  }

  // Nueva orden recibida desde n8n
  const newOrder: Order = {
    id: orderData.id,
    customerName: orderData.customerName || 'Cliente WhatsApp',
    phone: orderData.phone || '',
    status: orderData.status || 'standby',
    toppings: Array.isArray(orderData.toppings) ? orderData.toppings : ['Reina Pepiada', 'Chuleta glaseada con papelón'],
    beverage: orderData.beverage || 'Malta Polar 355ml',
    modificaciones: orderData.modificaciones || 'Ninguna',
    totalBs: orderData.totalBs || 'Bs 0.00',
    totalUsd: orderData.totalUsd || '$0.00',
    deliveryZone: orderData.deliveryZone || 'Caracas',
    createdAt: parseCreatedAt(orderData.createdAt),
    baseRecipe: orderData.baseRecipe || SIFRINA_BASE_RECIPE,
  };

  currentOrders.unshift(newOrder);
  globalThis.__sifrina_orders_store__ = currentOrders;
  return newOrder;
};

export const updateOrderStatus = (id: string, status: Order['status']): Order | null => {
  const currentOrders = globalThis.__sifrina_orders_store__ || [];
  const index = currentOrders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  currentOrders[index].status = status;
  if (status === 'dispatched' && !currentOrders[index].completedAt) {
    currentOrders[index].completedAt = Date.now();
  }
  globalThis.__sifrina_orders_store__ = currentOrders;
  return currentOrders[index];
};

/**
 * Purga completamente las órdenes en memoria del servidor
 */
export const clearOrdersStore = (): Order[] => {
  globalThis.__sifrina_orders_store__ = [];
  return [];
};
