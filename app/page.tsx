'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Order, OrderStatus } from '@/types/order';
import { HeaderKDS } from '@/components/HeaderKDS';
import { KanbanBoard } from '@/components/KanbanBoard';
import { SimulateOrderModal } from '@/components/SimulateOrderModal';
import { kitchenAudio } from '@/lib/audio';

const POLLING_INTERVAL_MS = 2000; // Sondeo rápido cada 2 segundos para tiempo real

export default function SifrinaKDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPollingTick, setIsPollingTick] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // Mantener registro de órdenes previas en "kitchen" para sonar la campana de inmediato
  const prevKitchenOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Consulta al endpoint /api/orders
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
          // Detectar si alguna orden nueva entró a cocina
          let hasNewKitchenOrder = false;
          currentKitchenIds.forEach((id) => {
            if (!prevKitchenOrderIdsRef.current.has(id)) {
              hasNewKitchenOrder = true;
            }
          });

          if (hasNewKitchenOrder) {
            console.log('[KDS] ¡Nueva orden en cocina de Sifrina! Sonando campana...');
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

  // Polling recurrente cada 2 segundos
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Actualizar estado de comanda (ej. "MARCAR LISTO / EMPACADO ✔")
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);

    // Actualización optimista inmediata en pantalla (0ms lag)
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
        fetchOrders();
      }
    } catch (error) {
      console.error('[KDS] Error de red:', error);
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  // Limpiar pantalla al finalizar turno de cocina
  const handleClearScreen = async () => {
    const confirmed = window.confirm('¿Deseas limpiar todas las órdenes del tablero para cerrar el turno de cocina?');
    if (!confirmed) return;

    // Limpieza optimista inmediata
    setOrders([]);
    prevKitchenOrderIdsRef.current.clear();

    try {
      await fetch('/api/orders', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('[KDS] Error al limpiar pantalla:', error);
      fetchOrders();
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
      {/* Barra Superior con Logo, Reloj Caracas GMT-4 y Botón Limpiar Pantalla */}
      <HeaderKDS
        orders={orders}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        onClearScreen={handleClearScreen}
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
          <p className="text-xs text-slate-500 mt-1">Sincronizando comanda oficial en tiempo real</p>
        </div>
      ) : (
        <KanbanBoard
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          updatingId={updatingId}
        />
      )}

      {/* Modal para pruebas con receta oficial de Sifrina */}
      <SimulateOrderModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onOrderCreated={fetchOrders}
      />
    </div>
  );
}
