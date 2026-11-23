'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Order, OrderStatus } from '@/types/order';
import { HeaderKDS } from '@/components/HeaderKDS';
import { KanbanBoard } from '@/components/KanbanBoard';
import { SimulateOrderModal } from '@/components/SimulateOrderModal';
import { kitchenAudio } from '@/lib/audio';

const POLLING_INTERVAL_MS = 3000; // Sondeo cada 3 segundos

export default function SifrinaKDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPollingTick, setIsPollingTick] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // Mantener registro de órdenes previas en "kitchen" para detectar nuevas y sonar la campana
  const prevKitchenOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Consulta al backend /api/orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsPollingTick(true);
      const res = await fetch('/api/orders', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const newOrders: Order[] = data.orders;

        // Comprobar si hay órdenes nuevas en estado "kitchen"
        const currentKitchenIds = new Set(
          newOrders.filter((o) => o.status === 'kitchen').map((o) => o.id)
        );

        if (!isFirstLoadRef.current) {
          // Detectar si alguna orden nueva entró a kitchen
          let hasNewKitchenOrder = false;
          currentKitchenIds.forEach((id) => {
            if (!prevKitchenOrderIdsRef.current.has(id)) {
              hasNewKitchenOrder = true;
            }
          });

          if (hasNewKitchenOrder) {
            console.log('[KDS] ¡Nueva orden en cocina! Sonando campana...');
            kitchenAudio.playKitchenBell();
          }
        } else {
          isFirstLoadRef.current = false;
        }

        prevKitchenOrderIdsRef.current = currentKitchenIds;
        setOrders(newOrders);
      }
    } catch (err) {
      console.warn('[KDS Polling] Error consultando /api/orders:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsPollingTick(false), 400);
    }
  }, []);

  // Polling recurrente cada 3 segundos
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Manejador para actualizar el estado de una orden (ej. "MARCAR LISTO / EMPACADO ✔")
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);

    // Actualización optimista inmediata en la UI para cero retraso táctil
    setOrders((current) =>
      current.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: newStatus,
            completedAt: newStatus === 'dispatched' ? Date.now() : order.completedAt,
          };
        }
        return order;
      })
    );

    // Si pasa a cocina mediante la UI, reproducir campana
    if (newStatus === 'kitchen') {
      kitchenAudio.playKitchenBell();
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (!res.ok) {
        console.error('[KDS] Error al actualizar estado en servidor');
        // Revertir consultando la verdad del servidor
        fetchOrders();
      }
    } catch (error) {
      console.error('[KDS] Error de red:', error);
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden"
      onClick={() => {
        // En primer tap/click en la pantalla de TV se desbloquea el audio
        kitchenAudio.unlock();
      }}
    >
      {/* Barra Superior con Logo, Reloj Caracas GMT-4 y Métricas */}
      <HeaderKDS
        orders={orders}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        isPolling={isPollingTick}
      />

      {/* Tablero Kanban de 4 Columnas */}
      {isLoading && orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="h-16 w-16 rounded-2xl bg-yellow-400 flex items-center justify-center font-black text-slate-950 text-3xl animate-bounce mb-4">
            S
          </div>
          <p className="font-mono text-lg font-bold text-yellow-400">
            Conectando con Dark Kitchen Sifrina CCS...
          </p>
          <p className="text-xs text-slate-500 mt-1">Cargando línea de vapor y comandas</p>
        </div>
      ) : (
        <KanbanBoard
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          updatingId={updatingId}
        />
      )}

      {/* Modal interactivo para simular pedidos desde n8n */}
      <SimulateOrderModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onOrderCreated={fetchOrders}
      />
    </div>
  );
}
