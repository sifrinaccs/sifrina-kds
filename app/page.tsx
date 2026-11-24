"use client";

import React, { useState, useEffect } from "react";

interface Order {
  id: string;
  customerName: string;
  phone?: string;
  status: "standby" | "payment_pending" | "kitchen" | "dispatched";
  toppings: string[];
  beverage?: string;
  modifications?: string;
  modificaciones?: string;
  extras?: string;
  totalBs?: string;
  deliveryZone?: string;
  createdAt: number;
}

export default function IndustrialKDS() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState("");

  // Reloj oficial de Caracas (VET)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("es-VE", { timeZone: "America/Caracas", hour12: false })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling en tiempo real para recibir órdenes de n8n
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setOrders(data);
          } else if (Array.isArray(data?.orders)) {
            setOrders(data.orders);
          }
        }
      } catch (err) {
        console.error("Error sincronizando KDS:", err);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  // 4. FIX DEFINITIVO PARA "NaN:NaN": Conversión robusta a milisegundos y prevención de negativos
  const getElapsedTime = (timestamp: number | string | undefined | null) => {
    if (!timestamp) return "00:00";
    let ts = typeof timestamp === "number" ? timestamp : Date.parse(String(timestamp));
    if (!ts || isNaN(ts) || ts <= 0) return "00:00";
    if (ts < 10000000000) ts *= 1000; // Normalizar si viene en segundos
    const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 3. DESPACHO AL BACKEND (CERO CORS): El navegador solo invoca /api/orders
  const markAsDispatched = async (orderId: string) => {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sifrina-secret": "SifrinaKDSSecure2026",
        },
        body: JSON.stringify({ id: orderId, status: "dispatched" }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "dispatched" } : o))
      );
    } catch (err) {
      console.error("Error al despachar orden:", err);
    }
  };

  // 2. PURGA REAL DE SERVIDOR: Vacía en el backend y limpia la pantalla sin revivir datos
  const clearAll = async () => {
    if (confirm("¿Limpiar órdenes en pantalla?")) {
      try {
        await fetch("/api/orders", {
          method: "DELETE",
          headers: {
            "x-sifrina-secret": "SifrinaKDSSecure2026",
          },
        });
        setOrders([]);
      } catch (err) {
        console.error("Error al purgar KDS:", err);
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-neutral-200 font-mono flex flex-col overflow-hidden select-none text-xs">
      {/* HEADER COMPACTO INDUSTRIAL (34px) */}
      <header className="h-9 bg-neutral-900 border-b border-neutral-700 px-3 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-yellow-500 text-black font-black px-1.5 py-0.5 rounded text-[11px] tracking-wider">
            SIFRINA
          </span>
          <span className="text-neutral-400 font-bold hidden sm:inline">KDS COCINA [32&quot; HD]</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-yellow-400 font-mono font-bold text-sm tracking-widest">{currentTime} VET</div>
          <button 
            onClick={clearAll} 
            className="border border-neutral-700 hover:bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-[10px] cursor-pointer"
          >
            [PURGAR]
          </button>
        </div>
      </header>

      {/* 4 COLUMNAS PARALELAS FIJAS EN 720P (1366x768) */}
      <main className="flex-1 grid grid-cols-4 gap-1.5 p-1.5 h-[calc(100vh-36px)]">
        
        {/* COL 1: RADAR / CHAT */}
        <section className="bg-neutral-950 border border-neutral-800 flex flex-col rounded overflow-hidden">
          <div className="bg-neutral-900 border-b border-neutral-800 px-2 py-1 flex justify-between items-center">
            <span className="text-cyan-400 font-bold text-[11px]">1. RADAR (CHAT)</span>
            <span className="text-cyan-400 font-bold bg-cyan-950/60 px-1.5 rounded text-[10px]">
              {orders.filter((o) => o.status === "standby").length}
            </span>
          </div>
          <div className="flex-1 p-1 space-y-1.5 overflow-y-auto">
            {orders
              .filter((o) => o.status === "standby")
              .map((order) => (
                <div key={order.id} className="bg-neutral-900 border border-neutral-800 p-2 rounded">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-cyan-300 text-sm">{order.id}</span>
                    <span className="text-[10px] text-neutral-500">{getElapsedTime(order.createdAt)}</span>
                  </div>
                  <div className="text-neutral-200 font-semibold truncate mt-0.5">{order.customerName}</div>
                  <div className="text-[10px] text-neutral-400 mt-1 italic">En conversacion...</div>
                </div>
              ))}
          </div>
        </section>

        {/* COL 2: POR PAGAR */}
        <section className="bg-neutral-950 border border-neutral-800 flex flex-col rounded overflow-hidden">
          <div className="bg-neutral-900 border-b border-neutral-800 px-2 py-1 flex justify-between items-center">
            <span className="text-yellow-400 font-bold text-[11px]">2. POR PAGAR</span>
            <span className="text-yellow-400 font-bold bg-yellow-950/60 px-1.5 rounded text-[10px]">
              {orders.filter((o) => o.status === "payment_pending").length}
            </span>
          </div>
          <div className="flex-1 p-1 space-y-1.5 overflow-y-auto">
            {orders
              .filter((o) => o.status === "payment_pending")
              .map((order) => (
                <div key={order.id} className="bg-neutral-900 border border-yellow-900/60 p-2 rounded">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-yellow-400 text-sm">{order.id}</span>
                    <span className="text-[10px] text-yellow-600">{getElapsedTime(order.createdAt)}</span>
                  </div>
                  <div className="text-neutral-200 font-semibold truncate">{order.customerName}</div>
                  <div className="text-[11px] text-yellow-300 font-bold mt-1">Bs. {order.totalBs}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{order.deliveryZone}</div>
                </div>
              ))}
          </div>
        </section>

        {/* COL 3: COCINA / VAPOR (DESTACADA) */}
        <section className="bg-neutral-950 border-2 border-orange-600 flex flex-col rounded overflow-hidden shadow-lg">
          <div className="bg-orange-950/80 border-b border-orange-800 px-2 py-1 flex justify-between items-center">
            <span className="text-orange-400 font-black text-[11px] tracking-wider">3. COCINA (ARMADO)</span>
            <span className="text-white font-black bg-orange-600 px-1.5 rounded text-[10px]">
              {orders.filter((o) => o.status === "kitchen").length}
            </span>
          </div>
          <div className="flex-1 p-1.5 space-y-2 overflow-y-auto">
            {orders
              .filter((o) => o.status === "kitchen")
              .map((order) => (
                <div key={order.id} className="bg-neutral-900 border border-orange-500/80 p-2.5 rounded shadow">
                  <div className="flex justify-between items-start font-bold">
                    <span className="bg-orange-500 text-black px-1.5 py-0.5 rounded font-black text-sm">
                      {order.id}
                    </span>
                    <span className="text-orange-400 font-mono font-bold text-xs bg-orange-950 px-1.5 py-0.5 rounded border border-orange-800">
                      {getElapsedTime(order.createdAt)}
                    </span>
                  </div>

                  <div className="text-white font-bold text-sm mt-1.5 truncate">{order.customerName}</div>
                  <div className="text-[10px] text-neutral-400 border-b border-neutral-800 pb-1 truncate">
                    Destino: {order.deliveryZone || "Caracas"}
                  </div>

                  {/* ESPECIFICACIONES DE ARMADO */}
                  <div className="mt-1.5 bg-black p-1.5 rounded border border-neutral-800 space-y-1">
                    <div className="font-bold text-yellow-400 text-[11px]">1x MALETIN DUO CLASICO</div>
                    
                    {(order.modificaciones || order.modifications) && 
                     (order.modificaciones !== "Ninguno" && order.modifications !== "Ninguno") && (
                      <div className="bg-red-950 text-red-300 font-black px-1 rounded text-[10px] border border-red-800">
                        ALERTA: {(order.modificaciones || order.modifications || "").toUpperCase()}
                      </div>
                    )}

                    <div className="text-[10px] text-neutral-300">
                      Bebida: <span className="font-bold text-white">{order.beverage || "MALTA"}</span>
                    </div>

                    <div className="text-[10px] text-neutral-300 border-t border-neutral-800 pt-1">
                      <span className="text-orange-400 font-bold block text-[9px] uppercase tracking-wider">
                        POTES SELLADOS:
                      </span>
                      {order.toppings && order.toppings.map((t, idx) => (
                        <div key={idx} className="font-bold text-neutral-100 pl-1">
                          - {t}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOTON DE ACCION PARA EL COCINERO */}
                  <button
                    onClick={() => markAsDispatched(order.id)}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-black font-black py-1.5 rounded text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
                  >
                    [ EMPACADO / LISTO ]
                  </button>
                </div>
              ))}
          </div>
        </section>

        {/* COL 4: EN RUTA / DESPACHO */}
        <section className="bg-neutral-950 border border-neutral-800 flex flex-col rounded overflow-hidden">
          <div className="bg-neutral-900 border-b border-neutral-800 px-2 py-1 flex justify-between items-center">
            <span className="text-emerald-400 font-bold text-[11px]">4. EN RUTA (ARMI)</span>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 rounded text-[10px]">
              {orders.filter((o) => o.status === "dispatched").length}
            </span>
          </div>
          <div className="flex-1 p-1 space-y-1.5 overflow-y-auto">
            {orders
              .filter((o) => o.status === "dispatched")
              .map((order) => (
                <div key={order.id} className="bg-neutral-900/60 border border-neutral-800 p-2 rounded opacity-70">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-emerald-400 text-xs">{order.id}</span>
                    <span className="text-[9px] text-neutral-500">LISTO</span>
                  </div>
                  <div className="text-neutral-300 font-medium truncate text-[11px]">{order.customerName}</div>
                  <div className="text-[10px] text-emerald-500 truncate mt-0.5">{order.deliveryZone}</div>
                </div>
              ))}
          </div>
        </section>

      </main>
    </div>
  );
}
