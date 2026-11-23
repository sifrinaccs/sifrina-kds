'use client';

import React from 'react';
import { Order, OrderStatus } from '@/types/order';
import { Column } from './Column';

interface KanbanBoardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  updatingId?: string | null;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  orders,
  onUpdateStatus,
  updatingId,
}) => {
  // Filtrar órdenes por columna
  const standbyOrders = orders.filter((o) => o.status === 'standby');
  const paymentOrders = orders.filter((o) => o.status === 'payment_pending');
  const kitchenOrders = orders.filter((o) => o.status === 'kitchen');
  const dispatchedOrders = orders.filter((o) => o.status === 'dispatched');

  return (
    <main className="flex-1 p-3 sm:p-5 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 h-full">
        {/* Columna 1: RADAR / EN CHAT */}
        <Column
          status="standby"
          title="1. RADAR / EN CHAT"
          subtitle="WhatsApp clientes iniciando pedido"
          accent="cyan"
          orders={standbyOrders}
          onUpdateStatus={onUpdateStatus}
          updatingId={updatingId}
        />

        {/* Columna 2: POR PAGAR */}
        <Column
          status="payment_pending"
          title="2. POR PAGAR"
          subtitle="Cotizados • Pago Móvil / Binance"
          accent="amber"
          orders={paymentOrders}
          onUpdateStatus={onUpdateStatus}
          updatingId={updatingId}
        />

        {/* Columna 3: LÍNEA DE VAPOR / ARMADO (COCINA) */}
        <Column
          status="kitchen"
          title="3. LÍNEA DE VAPOR / ARMADO"
          subtitle="Comanda impresa • Setbox y Bebidas"
          accent="orange"
          orders={kitchenOrders}
          onUpdateStatus={onUpdateStatus}
          updatingId={updatingId}
        />

        {/* Columna 4: EN RUTA / DESPACHADO */}
        <Column
          status="dispatched"
          title="4. EN RUTA / DESPACHADO"
          subtitle="Empacado • En moto con ARMI"
          accent="emerald"
          orders={dispatchedOrders}
          onUpdateStatus={onUpdateStatus}
          updatingId={updatingId}
        />
      </div>
    </main>
  );
};
