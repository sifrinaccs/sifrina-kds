'use client';

import React, { useState, useEffect } from 'react';
import { getCaracasTimeString } from '@/lib/caracasTime';
import { kitchenAudio } from '@/lib/audio';
import { Order } from '@/types/order';

interface HeaderKDSProps {
  orders: Order[];
  onOpenSimulateModal: () => void;
  onClearScreen: () => void;
  isPolling: boolean;
}

export const HeaderKDS: React.FC<HeaderKDSProps> = ({
  orders,
  onOpenSimulateModal,
  onClearScreen,
  isPolling,
}) => {
  const [caracasTime, setCaracasTime] = useState({
    time: '--:--:--',
    date: 'Caracas, VE',
  });
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reloj en vivo de Caracas GMT-4
  useEffect(() => {
    const updateTime = () => {
      const { time, date } = getCaracasTimeString();
      setCaracasTime({ time, date });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Verificar estado de fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleAudio = async () => {
    const unlocked = await kitchenAudio.unlock();
    setIsAudioEnabled(unlocked);
    // Tocar campana de prueba
    kitchenAudio.playKitchenBell();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error al entrar en pantalla completa:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Error al salir de pantalla completa:', err);
      });
    }
  };

  // Contadores
  const standbyCount = orders.filter((o) => o.status === 'standby').length;
  const paymentCount = orders.filter((o) => o.status === 'payment_pending').length;
  const kitchenCount = orders.filter((o) => o.status === 'kitchen').length;
  const dispatchedCount = orders.filter((o) => o.status === 'dispatched').length;

  return (
    <header className="bg-slate-950/95 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 select-none backdrop-blur-md sticky top-0 z-40">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Marca Sifrina CCS & Título KDS */}
        <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center font-black text-slate-950 text-xl sm:text-2xl shadow-lg shadow-yellow-500/20 ring-2 ring-yellow-400/50">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl sm:text-2xl tracking-tight text-white uppercase flex items-center gap-1.5">
                  <span>SIFRINA</span>
                  <span className="text-yellow-400 font-extrabold">CCS</span>
                </h1>
                <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  DARK KITCHEN KDS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Pantalla de Cocina 55&quot; | Caracas, Venezuela
              </p>
            </div>
          </div>

          {/* Sync status móvil */}
          <div className="flex items-center gap-1.5 lg:hidden text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-md border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>n8n LIVE</span>
          </div>
        </div>

        {/* Reloj en Vivo Caracas GMT-4 (Destacado para TV a 3 metros) */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-1.5 shadow-inner">
          <div className="text-center">
            <div className="font-mono text-2xl sm:text-3xl font-black text-yellow-400 tracking-wider">
              {caracasTime.time}
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Caracas GMT-4 • {caracasTime.date}
            </div>
          </div>
        </div>

        {/* Resumen de Métricas */}
        <div className="hidden xl:flex items-center gap-2 font-mono text-xs">
          <div className="bg-slate-900/90 border border-sky-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-sky-400 font-bold">1. Radar:</span>
            <span className="font-black text-white">{standbyCount}</span>
          </div>
          <div className="bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">2. Por Pagar:</span>
            <span className="font-black text-white">{paymentCount}</span>
          </div>
          <div className="bg-orange-950/60 border border-orange-500/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-orange-400 font-bold">3. Cocina:</span>
            <span className="font-black text-orange-200 text-sm">{kitchenCount}</span>
          </div>
          <div className="bg-slate-900/90 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">4. En Ruta:</span>
            <span className="font-black text-white">{dispatchedCount}</span>
          </div>
        </div>

        {/* Botones de Control */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          {/* Botón Discreto: Limpiar Pantalla */}
          <button
            onClick={onClearScreen}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-700/80 hover:border-red-500/60 text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
            title="Limpiar todas las órdenes al terminar el turno de cocina"
          >
            <span>🧹</span>
            <span className="hidden sm:inline">Limpiar Pantalla</span>
          </button>

          {/* Botón de Audio / Campana */}
          <button
            onClick={handleToggleAudio}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isAudioEnabled
                ? 'bg-yellow-400/15 border-yellow-400 text-yellow-300 hover:bg-yellow-400/25'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-yellow-400 hover:text-yellow-400'
            }`}
            title="Activar o probar campana sonora de cocina"
          >
            <span>{isAudioEnabled ? '🔔 Campana Activa' : '🔕 Activar Audio'}</span>
          </button>

          {/* Botón Simular n8n */}
          <button
            onClick={onOpenSimulateModal}
            className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Inyectar orden con receta oficial de Sifrina"
          >
            <span>⚡ Simular n8n</span>
          </button>

          {/* Botón Pantalla Completa */}
          <button
            onClick={handleToggleFullscreen}
            className="px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Pantalla completa para TV de 55 pulgadas"
          >
            <span>{isFullscreen ? '🗗' : '🖥️ TV'}</span>
          </button>

          {/* Estado de sincronización en vivo */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1.5 rounded-xl border border-emerald-500/30">
            <span
              className={`h-2.5 w-2.5 rounded-full bg-emerald-400 ${
                isPolling ? 'animate-ping' : ''
              }`}
            ></span>
            <span className="font-bold">SYNC 2s</span>
          </div>
        </div>
      </div>
    </header>
  );
};
