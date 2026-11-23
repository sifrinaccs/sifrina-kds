import { Order } from '../types/order';

// Almacén en memoria global para Next.js / Serverless
declare global {
  // eslint-disable-next-line no-var
  var __sifrina_orders_store__: Order[] | undefined;
}

const getInitialOrders = (): Order[] => {
  const now = Date.now();
  return [
    {
      id: '#SIF-7294',
      customerName: 'Valeria Gómez',
      status: 'standby',
      toppings: ['Queso Blanco Rayado', 'Tocineta'],
      beverage: 'Pepsi 1.5L',
      modificaciones: 'Consulta por WhatsApp sobre salsa adicional',
      totalBs: 'Bs 754.00',
      totalUsd: '$14.50',
      deliveryZone: 'Las Mercedes',
      createdAt: now - 3 * 60 * 1000, // Hace 3 minutos
    },
    {
      id: '#SIF-7293',
      customerName: 'Carlos Mendoza',
      status: 'payment_pending',
      toppings: ['Cheddar Fundido', 'Cebolla Crispy', 'Tártara de la Casa'],
      beverage: 'Malta Polar Fría',
      modificaciones: 'Esperando captura de Pago Móvil Banesco',
      totalBs: 'Bs 832.00',
      totalUsd: '$16.00',
      deliveryZone: 'Chacao',
      createdAt: now - 6 * 60 * 1000, // Hace 6 minutos
    },
    {
      id: '#SIF-7291',
      customerName: 'Alejandro Silva',
      status: 'kitchen',
      toppings: [
        'Queso de Mano Artesanal',
        'Tocineta Ahumada Crujiente',
        'Salsa Tártara Sifrina',
        'Maíz Tierno Dulce',
      ],
      beverage: 'Malta Polar 355ml',
      modificaciones: 'SIN PAPITAS (ALERGIA AL GLUTEN) - POTES EXTRA SELLADOS',
      totalBs: 'Bs 962.00',
      totalUsd: '$18.50',
      deliveryZone: 'Altamira Norte',
      createdAt: now - 5 * 60 * 1000 - 45 * 1000, // Hace 5m 45s (Verde/Naranja)
    },
    {
      id: '#SIF-7290',
      customerName: 'María Corina Pérez',
      status: 'kitchen',
      toppings: [
        'Carne Mechada Jugosa',
        'Queso Amarillo Tipo Gouda',
        'Guasacaca Especial Sifrina',
      ],
      beverage: 'Pepsi Black Regular',
      modificaciones: 'EXTRA TOSTADA LA AREPA - EMPACAR SERVILLETERO Y CUBIERTOS',
      totalBs: 'Bs 1,144.00',
      totalUsd: '$22.00',
      deliveryZone: 'El Cafetal',
      createdAt: now - 10 * 60 * 1000 - 20 * 1000, // Hace >10 minutos (>9 min -> ALERTA ROJA)
    },
    {
      id: '#SIF-7288',
      customerName: 'Daniela Rivas',
      status: 'dispatched',
      toppings: ['Pollo Desmechado Sifrina', 'Queso Paisa', 'Aguacate'],
      beverage: 'Pepsi Regular',
      modificaciones: 'Empacado térmico completado. Entregado a ARMI',
      totalBs: 'Bs 780.00',
      totalUsd: '$15.00',
      deliveryZone: 'Los Palos Grandes',
      createdAt: now - 22 * 60 * 1000,
      completedAt: now - 8 * 60 * 1000,
    },
    {
      id: '#SIF-7286',
      customerName: 'Ignacio Quintana',
      status: 'dispatched',
      toppings: ['Cheddar Sifrina', 'Tocineta Doble'],
      beverage: 'Malta Polar Fría',
      modificaciones: 'Despacho directo en garita',
      totalBs: 'Bs 650.00',
      totalUsd: '$12.50',
      deliveryZone: 'La Castellana',
      createdAt: now - 35 * 60 * 1000,
      completedAt: now - 15 * 60 * 1000,
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

  // Nueva orden
  const newOrder: Order = {
    id: orderData.id,
    customerName: orderData.customerName || 'Cliente WhatsApp',
    status: orderData.status || 'standby',
    toppings: orderData.toppings || [],
    beverage: orderData.beverage || 'Sin bebida seleccionada',
    modificaciones: orderData.modificaciones || 'Ninguna',
    totalBs: orderData.totalBs || 'Bs 0.00',
    totalUsd: orderData.totalUsd || '$0.00',
    deliveryZone: orderData.deliveryZone || 'Caracas',
    createdAt: orderData.createdAt ? (orderData.createdAt < 10000000000 ? orderData.createdAt * 1000 : orderData.createdAt) : Date.now(),
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

export const resetOrdersStore = (): Order[] => {
  globalThis.__sifrina_orders_store__ = getInitialOrders();
  return globalThis.__sifrina_orders_store__;
};
