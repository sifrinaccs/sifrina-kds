'use client';

import React from 'react';
import { Order, OrderStatus } from '@/types/order';
import { OrderCard } from './OrderCard';

interface ColumnProps {
  status: OrderStatus;
  title: string;
  subtitle: string;
  accent: 'cyan' | 'amber' | 'orange' | 'emerald';
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  updatingId?: string | null;
}

export const Column: React.FC<ColumnProps> = ({
  status,
  title,
  subtitle,
  accent,
  orders,
  onUpdateStatus,
  updatingId,
}) => {
  const isKitchen = status === 'kitchen';

  // Configuración de estilo según acento
  const styleConfig = {
    cyan: {
      headerBg: 'bg-sky-950/40',
      headerBorder: 'border-sky-500/30',
      titleColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      columnBorder: 'border-slate-800/80',
      glow: '',
      icon: '💬',
    },
    amber: {
      headerBg: 'bg-amber-950/40',
      headerBorder: 'border-amber-500/30',
      titleColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      columnBorder: 'border-slate-800/80',
      glow: '',
      icon: '💵',
    },
    orange: {
      headerBg: 'bg-gradient-to-r from-orange-950/80 via-orange-900/40 to-slate-900',
      headerBorder: 'border-orange-500/60',
      titleColor: 'text-orange-400',
      badgeBg: 'bg-orange-500 text-slate-950 font-black border-orange-400',
      columnBorder: 'border-2 border-orange-500/80 shadow-[0_0_35px_rgba(249,115,22,0.18)]',
      glow: 'ring-1 ring-orange-500/40',
      icon: '🔥',
    },
    emerald: {
      headerBg: 'bg-emerald-950/40',
      headerBorder: 'border-emerald-500/30',
      titleColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      columnBorder: 'border-slate-800/80',
      glow: '',
      icon: '🛵',
    },
  }[accent];

  return (
    <div
      className={`flex flex-col h-full rounded-2xl bg-slate-950/80 backdrop-blur-sm overflow-hidden ${styleConfig.columnBorder} ${styleConfig.glow}`}
    >
      {/* Cabecera de la Columna */}
      <div
        className={`px-4 py-3 sm:py-3.5 border-b ${styleConfig.headerBorder} ${styleConfig.headerBg} flex items-center justify-between gap-2`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-xl sm:text-2xl">{styleConfig.icon}</span>
          <div className="leading-tight">
            <h2
              className={`font-black text-sm sm:text-base tracking-wide uppercase ${styleConfig.titleColor}`}
            >
              {title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Badge contador de órdenes */}
        <div
          className={`flex-shrink-0 font-mono text-sm sm:text-base font-extrabold px-3 py-0.5 rounded-full border ${styleConfig.badgeBg}`}
        >
          {orders.length}
        </div>
      </div>

      {/* Lista de Tarjetas con Scroll Virtualizado / Suave */}
      <div className="flex-1 p-3 sm:p-3.5 space-y-3.5 overflow-y-auto max-h-[calc(100vh-175px)] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {orders.length === 0 ? (
          <div className="h-44 sm:h-56 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800/60 rounded-xl">
            <span className="text-3xl sm:text-4xl opacity-30 mb-2">{styleConfig.icon}</span>
            <p className="text-sm font-semibold text-slate-500">Sin órdenes en esta etapa</p>
            <p className="text-xs text-slate-600 mt-1">
              {isKitchen ? 'Línea de vapor limpia y lista' : 'Esperando actividad de n8n'}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
              isUpdating={updatingId === order.id}
            />
          ))
        )}
      </div>
    </div>
  );
};
