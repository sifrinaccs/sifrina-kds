# 🌭 Sifrina KDS (Kitchen Display System) - Dark Kitchen CCS

Sistema de visualización y control de comandas en tiempo real diseñado específicamente para la Dark Kitchen de **Sifrina CCS** en Caracas, optimizado para televisores de **55 pulgadas (1080p / 4K)** con visibilidad garantizada a más de 3 metros de distancia.

Construido con **Next.js 14 (App Router)**, **Tailwind CSS**, **TypeScript** y **Web Audio API**.

---

## 📋 1. Receta Oficial de Sifrina CCS

- **Composición Base de los 2 Perros**:
  * Pan de batata artesanal
  * Salchicha Wiener Plumrose
  * Queso fundido Rikesa
  * Papitas Hot Pick
- **Toppings Oficiales Autorizados para el Setbox (2 Potes Sellados)**:
  * 🥑 **Reina Pepiada**
  * 🍖 **Chuleta glaseada con papelón**
  * 🥩 **Carne mechada**
  * 🥒 **Pepinillos agridulces**
- **Bebidas Oficiales**:
  * 🍺 **Malta Polar** (Lata 355ml o Botella 1.5L)
  * 🥤 **Pepsi** (Lata 355ml o Botella 1.5L)

---

## 📺 2. Ergonomía de Pantalla para Dark Kitchen (4 Columnas)

| Columna | Estado (`status`) | Acento Visual | Propósito y Ergonomía |
| :--- | :--- | :--- | :--- |
| **1. RADAR / EN CHAT** | `standby` | Cyan / Sky (`#38BDF8`) | Clientes iniciando conversación en WhatsApp. Muestra datos preliminares y zona de entrega. |
| **2. POR PAGAR** | `payment_pending` | Ámbar / Amarillo (`#FBBF24`) | Pedidos cotizados esperando comprobante de Pago Móvil o Binance Pay. |
| **3. LÍNEA DE VAPOR / ARMADO** | `kitchen` | Naranja Fuego (`#F97316`) con Glow | **Comanda activa en cocina**. Destaca la Base de 2 Perros, el **SETBOX (2 POTES SELLADOS)**, bebida fría oficial, notas de modificación y temporizador en vivo con alerta > 9 min. |
| **4. EN RUTA / DESPACHADO** | `dispatched` | Verde Esmeralda (`#34D399`) | Pedidos empacados térmicamente y entregados al motorizado de **ARMI**. |

---

## ⚡ 3. Integración en Tiempo Real con n8n (Webhook HTTP)

- **URL de Producción**: `https://sifrina-kds.vercel.app/api/orders`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  x-sifrina-secret: SifrinaKDSSecure2026
  ```

### Payload Oficial de la Orden desde n8n:
```json
{
  "id": "#SIF-7291",
  "customerName": "Wilfredo Oviedo",
  "status": "kitchen",
  "toppings": [
    "Reina Pepiada",
    "Chuleta glaseada con papelón"
  ],
  "beverage": "Malta Polar 355ml",
  "modificaciones": "SIN PAPITAS (ALERGIA) - POTES EXTRA SELLADOS",
  "totalBs": "Bs 962.00",
  "totalUsd": "$18.50",
  "deliveryZone": "Las Mercedes",
  "createdAt": 1732371900000
}
```

---

## 🧹 4. Funciones de Turno
- **Botón "Limpiar Pantalla"**: Ubicado discretamente en el encabezado para reiniciar todas las órdenes al culminar el turno de cocina.
- **Campana Sonora Web Audio**: Ding metálico de cocina cada vez que un pedido entra a la columna 3 (Línea de Vapor).
- **Reloj Caracas GMT-4**: Hora oficial y fecha en español en la barra superior.
