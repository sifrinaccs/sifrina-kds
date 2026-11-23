'use client';

import React, { useState } from 'react';
import { OrderStatus, OFFICIAL_TOPPINGS, SIFRINA_BASE_RECIPE } from '@/types/order';

interface SimulateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

export const SimulateOrderModal: React.FC<SimulateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('Wilfredo Oviedo');
  const [status, setStatus] = useState<OrderStatus>('kitchen');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([
    'Reina Pepiada',
    'Chuleta glaseada con papelón',
  ]);
  const [beverage, setBeverage] = useState('Malta Polar 355ml');
  const [modificaciones, setModificaciones] = useState('SIN PAPITAS (ALERGIA)');
  const [deliveryZone, setDeliveryZone] = useState('Las Mercedes');
  const [secret, setSecret] = useState('SifrinaKDSSecure2026');
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTopping = (topping: string) => {
    setSelectedToppings((prev) => {
      if (prev.includes(topping)) {
        return prev.filter((t) => t !== topping);
      } else {
        if (prev.length >= 2) {
          // Setbox es de 2 potes sellados
          return [prev[1], topping];
        }
        return [...prev, topping];
      }
    });
  };

  const handleSimulate = async (targetStatus?: OrderStatus) => {
    setLoading(true);
    setResultMsg(null);

    const randomId = `#SIF-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalStatus = targetStatus || status;

    const payload = {
      id: randomId,
      customerName,
      status: finalStatus,
      toppings: selectedToppings,
      beverage,
      modificaciones,
      totalBs: 'Bs 962.00',
      totalUsd: '$18.50',
      deliveryZone,
      createdAt: Date.now(),
      baseRecipe: SIFRINA_BASE_RECIPE,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sifrina-secret': secret,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setResultMsg(`✔ Orden oficial ${randomId} inyectada con éxito [${finalStatus}]`);
        onOrderCreated();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setResultMsg(`❌ Error: ${data.error || 'Fallo de autenticación'}`);
      }
    } catch (e) {
      setResultMsg(`❌ Error de red: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sifrina-secret': secret,
        },
        body: JSON.stringify({ action: 'reset' }),
      });
      onOrderCreated();
      setResultMsg('✔ Tablero restablecido al pedido oficial de Wilfredo Oviedo');
      setTimeout(() => onClose(), 1000);
    } catch {
      setResultMsg('❌ Error al reiniciar almacén');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border-2 border-yellow-400 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <h3 className="text-lg font-black text-yellow-400 uppercase">
                Simulador Webhook n8n (Receta Oficial)
              </h3>
              <p className="text-xs text-slate-400">
                Sifrina CCS: Solo toppings oficiales para el Setbox de 2 potes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {resultMsg && (
          <div className="my-4 p-3 rounded-lg text-sm font-bold bg-slate-950 border border-yellow-400/50 text-yellow-300">
            {resultMsg}
          </div>
        )}

        <div className="space-y-4 my-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Header de Seguridad (x-sifrina-secret)
            </label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-yellow-400 font-mono text-sm focus:border-yellow-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Cliente WhatsApp
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Zona de Caracas
              </label>
              <input
                type="text"
                value={deliveryZone}
                onChange={(e) => setDeliveryZone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Columna de Destino (Status)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-yellow-400"
            >
              <option value="standby">1. RADAR / EN CHAT (standby)</option>
              <option value="payment_pending">2. POR PAGAR (payment_pending)</option>
              <option value="kitchen">3. LÍNEA DE VAPOR / ARMADO (kitchen - Campana 🔔)</option>
              <option value="dispatched">4. EN RUTA / DESPACHADO (dispatched)</option>
            </select>
          </div>

          {/* Selector de Toppings Oficiales (Máximo 2 potes) */}
          <div>
            <label className="block text-xs font-bold text-yellow-400 uppercase mb-1.5">
              Setbox Oficial (Elige 2 potes):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OFFICIAL_TOPPINGS.map((top) => {
                const isChecked = selectedToppings.includes(top);
                return (
                  <button
                    key={top}
                    type="button"
                    onClick={() => toggleTopping(top)}
                    className={`p-2 rounded-lg text-left text-xs font-bold border transition-colors flex items-center justify-between ${
                      isChecked
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{top}</span>
                    <span>{isChecked ? '✔' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Bebida Oficial
              </label>
              <select
                value={beverage}
                onChange={(e) => setBeverage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-yellow-400"
              >
                <option value="Malta Polar 355ml">Malta Polar (Lata 355ml)</option>
                <option value="Malta Polar 1.5L">Malta Polar (Botella 1.5L)</option>
                <option value="Pepsi 355ml">Pepsi (Lata 355ml)</option>
                <option value="Pepsi 1.5L">Pepsi (Botella 1.5L)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Modificación / Alerta
              </label>
              <input
                type="text"
                value={modificaciones}
                onChange={(e) => setModificaciones(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-red-300 font-bold outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDemo}
            disabled={loading}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
          >
            Restablecer Wilfredo
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => handleSimulate()}
              disabled={loading}
              className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-950 rounded-lg text-sm font-black transition-all shadow-md"
            >
              {loading ? 'Enviando...' : 'Inyectar Pedido Oficial'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
