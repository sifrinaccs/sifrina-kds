import { Order, SIFRINA_BASE_RECIPE } from '../types/order';

// Almacén en memoria global para Next.js / Serverless
declare global {
  // eslint-disable-next-line no-var
  var __sifrina_orders_store__: Order[] | undefined;
}

// Inicializar únicamente con el pedido real de prueba oficial solicitado
const getInitialOrders = (): Order[] => {
  const now = Date.now();
  return [
    {
      id: '#SIF-7291',
      customerName: 'Wilfredo Oviedo',
      status: 'kitchen',
      toppings: ['Reina Pepiada', 'Chuleta glaseada con papelón'],
      beverage: 'Malta Polar 355ml',
      modificaciones: 'SIN PAPITAS (ALERGIA) - POTES EXTRA SELLADOS',
      totalBs: 'Bs 962.00',
      totalUsd: '$18.50',
      deliveryZone: 'Las Mercedes',
      createdAt: now - 2 * 60 * 1000 - 15 * 1000, // Hace 2m 15s
      baseRecipe: SIFRINA_BASE_RECIPE,
    },
  ];
};

if (!globalThis.__sifrina_orders_store__) {
  globalThis.__sifrina_orders_store__ = getInitialOrders();
}

export const getOrders = (): Order[] => {
  return [...(globalThis.__sifrina_orders_store__ || [])].sort(
    (a, b) => b.createdAt - a.createdAt
  );
};

export const upsertOrder = (orderData: Partial<Order> & { id: string }): Order => {
  const currentOrders = globalThis.__sifrina_orders_store__ || [];
  const existingIndex = currentOrders.findIndex((o) => o.id === orderData.id);

  if (existingIndex >= 0) {
    const updated: Order = {
      ...currentOrders[existingIndex],
      ...orderData,
      status: orderData.status || currentOrders[existingIndex].status,
    };
    if (orderData.status === 'dispatched' && !updated.completedAt) {
      updated.completedAt = Date.now();
    }
    currentOrders[existingIndex] = updated;
    globalThis.__sifrina_orders_store__ = currentOrders;
    return updated;
  }

  // Nueva orden recibida
  const newOrder: Order = {
    id: orderData.id,
    customerName: orderData.customerName || 'Cliente WhatsApp',
    status: orderData.status || 'standby',
    toppings: orderData.toppings || ['Reina Pepiada', 'Chuleta glaseada con papelón'],
    beverage: orderData.beverage || 'Malta Polar 355ml',
    modificaciones: orderData.modificaciones || 'Ninguna',
    totalBs: orderData.totalBs || 'Bs 0.00',
    totalUsd: orderData.totalUsd || '$0.00',
    deliveryZone: orderData.deliveryZone || 'Caracas',
    createdAt: orderData.createdAt
      ? orderData.createdAt < 10000000000
        ? orderData.createdAt * 1000
        : orderData.createdAt
      : Date.now(),
    baseRecipe: SIFRINA_BASE_RECIPE,
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
 * Limpia todas las órdenes del tablero al finalizar el turno de cocina
 */
export const clearOrdersStore = (): Order[] => {
  globalThis.__sifrina_orders_store__ = [];
  return [];
};

/**
 * Restablece al pedido inicial oficial
 */
export const resetOrdersStore = (): Order[] => {
  globalThis.__sifrina_orders_store__ = getInitialOrders();
  return globalThis.__sifrina_orders_store__;
};
