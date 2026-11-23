'use client';

import React from 'react';
import { Order, SIFRINA_BASE_RECIPE } from '@/types/order';
import { LiveTimer } from './LiveTimer';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
  isUpdating?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  isUpdating = false,
}) => {
  const isKitchen = order.status === 'kitchen';
  const isStandby = order.status === 'standby';
  const isPaymentPending = order.status === 'payment_pending';
  const isDispatched = order.status === 'dispatched';

  // Detección de bebida oficial
  const isMalta = order.beverage.toLowerCase().includes('malta');
  const isPepsi = order.beverage.toLowerCase().includes('pepsi');

  return (
    <div
      className={`rounded-2xl transition-all duration-200 select-none ${
        isKitchen
          ? 'bg-slate-900 border-2 border-orange-500/90 shadow-[0_0_24px_rgba(249,115,22,0.25)] p-4 sm:p-5'
          : isStandby
          ? 'bg-slate-900/90 border border-sky-500/40 hover:border-sky-400 p-4'
          : isPaymentPending
          ? 'bg-slate-900/90 border border-amber-500/50 hover:border-amber-400 p-4'
          : 'bg-slate-900/80 border border-emerald-500/40 p-4 opacity-90 hover:opacity-100'
      }`}
    >
      {/* Cabecera de la Tarjeta */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-mono text-xl sm:text-2xl font-black px-2.5 py-0.5 rounded-lg tracking-tight ${
              isKitchen
                ? 'bg-orange-500 text-slate-950 shadow-md'
                : isStandby
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : isPaymentPending
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {order.id}
          </span>
          <span className="text-sm font-semibold text-slate-400 flex items-center gap-1">
            📍 {order.deliveryZone}
          </span>
        </div>

        {/* Temporizador en Vivo solo para Columna de Cocina */}
        {isKitchen && <LiveTimer createdAt={order.createdAt} />}

        {/* Indicador de hora para otras columnas */}
        {!isKitchen && (
          <div className="text-right">
            <span className="font-mono text-xs text-slate-400">
              {new Date(order.createdAt).toLocaleTimeString('es-VE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Nombre del Cliente */}
      <div className="mb-3">
        <div className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>{order.customerName}</span>
          {isStandby && (
            <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              WhatsApp Activo
            </span>
          )}
        </div>
      </div>

      {/* COMPOSICIÓN BASE OFICIAL DE LOS 2 PERROS */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 mb-3">
        <div className="flex items-center gap-1.5 text-[11px] font-black text-yellow-400/90 uppercase tracking-wide mb-1">
          <span>🌭</span>
          <span>BASE (2 PERROS SIFRINA):</span>
        </div>
        <div className="text-xs text-slate-300 font-medium leading-relaxed">
          {order.baseRecipe || SIFRINA_BASE_RECIPE}
        </div>
      </div>

      {/* DETALLES DE COCINA: SETBOX (2 POTES SELLADOS) */}
      {isKitchen ? (
        <div className="space-y-3.5 my-3">
          {/* Contenedor del SETBOX */}
          <div className="bg-slate-950/90 border-2 border-yellow-400/90 rounded-xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-yellow-400/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <span className="font-black text-sm sm:text-base tracking-wide text-yellow-300 uppercase">
                  SETBOX (2 POTES SELLADOS)
                </span>
              </div>
              <span className="bg-yellow-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-md">
                RECETA OFICIAL
              </span>
            </div>

            {/* Toppings seleccionados */}
            <div className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Toppings Autorizados en Potes:
            </div>
            {order.toppings && order.toppings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {order.toppings.map((topping, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-slate-900 border border-yellow-400/40 rounded-lg px-2.5 py-2 shadow-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-yellow-400 flex-shrink-0"></span>
                    <span className="text-xs sm:text-sm font-bold text-yellow-100 truncate">
                      {topping}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm italic text-slate-500">Combo base sin potes adicionales</div>
            )}
          </div>

          {/* Bebida Seleccionada (Malta Polar o Pepsi) */}
          <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Bebida Oficial:
            </span>
            <div
              className={`flex items-center gap-1.5 font-bold text-sm px-2.5 py-1 rounded-lg ${
                isMalta
                  ? 'bg-amber-900/60 text-amber-300 border border-amber-600/50'
                  : isPepsi
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-600/50'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              <span>{isMalta ? '🍺' : '🥤'}</span>
              <span>{order.beverage}</span>
            </div>
          </div>

          {/* Modificaciones Especiales (SIN PAPITAS, etc.) */}
          {order.modificaciones && order.modificaciones !== 'Ninguna' && (
            <div className="bg-red-950/60 border-2 border-red-500/80 rounded-xl p-3 flex items-start gap-2.5">
              <span className="text-lg">⚠️</span>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-red-400">
                  MODIFICACIÓN ESPECIAL / NOTA COCINA:
                </div>
                <div className="text-sm font-black text-red-200 leading-snug">
                  {order.modificaciones}
                </div>
              </div>
            </div>
          )}

          {/* BOTÓN TÁCTIL GIGANTE PARA COCINA */}
          <button
            onClick={() => onUpdateStatus(order.id, 'dispatched')}
            disabled={isUpdating}
            className="w-full mt-2 py-3.5 sm:py-4 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] text-slate-950 font-black text-base sm:text-lg rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-3 transition-transform cursor-pointer border-2 border-emerald-300"
          >
            <span className="text-xl">✔</span>
            <span>MARCAR LISTO / EMPACADO</span>
          </button>
        </div>
      ) : (
        /* VISTA COMPACTA PARA COLUMNAS 1, 2 Y 4 */
        <div className="space-y-2.5">
          {/* Toppings / Contenido resumido */}
          {order.toppings && order.toppings.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {order.toppings.map((top, i) => (
                <span
                  key={i}
                  className="text-xs bg-slate-800 text-yellow-300 border border-yellow-400/20 px-2 py-0.5 rounded-md font-bold"
                >
                  {top}
                </span>
              ))}
            </div>
          )}

          {/* Bebida */}
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Bebida:</span>
            <span className="font-semibold text-slate-200">{order.beverage}</span>
          </div>

          {/* Modificaciones */}
          {order.modificaciones && order.modificaciones !== 'Ninguna' && (
            <div className="text-xs bg-red-950/40 border border-red-500/40 rounded-md p-1.5 text-red-300 font-bold">
              Nota: {order.modificaciones}
            </div>
          )}

          {/* Totales monetarios */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs sm:text-sm">
            <span className="font-mono font-bold text-yellow-400 text-base">
              {order.totalUsd}
            </span>
            <span className="font-mono text-slate-400">{order.totalBs}</span>
          </div>

          {/* Botones de acción contextuales según columna */}
          {isStandby && (
            <button
              onClick={() => onUpdateStatus(order.id, 'payment_pending')}
              className="w-full mt-1 py-2 px-3 bg-sky-950/60 hover:bg-sky-900 border border-sky-500/50 hover:border-sky-400 text-sky-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Generar Cotización &gt;</span>
            </button>
          )}

          {isPaymentPending && (
            <button
              onClick={() => onUpdateStatus(order.id, 'kitchen')}
              className="w-full mt-1 py-2 px-3 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/60 hover:border-amber-400 text-amber-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>🔥 Pago Verificado &gt; A Cocina</span>
            </button>
          )}

          {isDispatched && (
            <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 rounded-lg px-2.5 py-1.5">
              <span className="flex items-center gap-1">🛵 Motorizado ARMI</span>
              <span className="font-mono text-[11px] text-emerald-300">En tránsito</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
