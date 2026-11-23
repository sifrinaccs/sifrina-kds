# 🍔 Sifrina KDS (Kitchen Display System) - Dark Kitchen CCS

Sistema de visualización y control de comandas en tiempo real diseñado específicamente para la Dark Kitchen de **Sifrina CCS** en Caracas, optimizado para televisores de **55 pulgadas (1080p / 4K)** con visibilidad garantizada a más de 3 metros de distancia.

Construido con **Next.js 14 (App Router)**, **Tailwind CSS**, **TypeScript** y **Web Audio API**.

---

## 📺 1. Ergonomía de Pantalla para Dark Kitchen (4 Columnas Kanban)

| Columna | Estado (`status`) | Acento Visual | Propósito y Ergonomía |
| :--- | :--- | :--- | :--- |
| **1. RADAR / EN CHAT** | `standby` | Cyan / Sky (`#38BDF8`) | Clientes iniciando conversación en WhatsApp. Muestra datos preliminares y zona de entrega. |
| **2. POR PAGAR** | `payment_pending` | Ámbar / Amarillo (`#FBBF24`) | Pedidos cotizados esperando comprobante de Pago Móvil (Banesco/Mercantil) o Binance Pay. |
| **3. LÍNEA DE VAPOR / ARMADO** | `kitchen` | Naranja Fuego (`#F97316`) con Glow | **Comanda activa en cocina**. Destaca el **SETBOX (2 POTES SELLADOS)**, bebidas frías (Pepsi/Malta), modificaciones críticas ("SIN PAPITAS") y temporizador en vivo. |
| **4. EN RUTA / DESPACHADO** | `dispatched` | Verde Esmeralda (`#34D399`) | Pedidos sellados y entregados al motorizado de **ARMI** en ruta de entrega. |

### Características Clave en Cocina (Columna 3):
- **Setbox Térmico Sellado**: Recuadro amarillo de alta visibilidad con los 2 potes de toppings especificados.
- **Temporizador en Vivo**: Reloj `MM:SS` que cambia automáticamente a **Alerta Roja Pulsante** si el tiempo de preparación supera los **9 minutos (> 540 segundos)**.
- **Botón Táctil Gigante**: `MARCAR LISTO / EMPACADO ✔` para que el cocinero despache la orden con un solo toque sin retrasos.
- **Alerta Sonora Metálica**: Síntesis con **Web Audio API** que reproduce el timbre de campana de restaurante cada vez que entra un nuevo pedido a cocina (sin depender de archivos de audio externos).
- **Reloj de Caracas GMT-4**: Reloj sincronizado con la hora oficial de Venezuela y fecha completa en la barra superior.

---

## ⚡ 2. Integración con n8n (Webhook HTTP)

El endpoint `/api/orders` está protegido mediante la cabecera de autenticación `x-sifrina-secret`.

### Configuración del Nodo HTTP Request en n8n:
- **Method**: `POST`
- **URL**: `https://tu-proyecto.vercel.app/api/orders` (o `http://localhost:3000/api/orders` en desarrollo)
- **Headers**:
  ```http
  Content-Type: application/json
  x-sifrina-secret: SifrinaKDSSecure2026
  ```

### Payload JSON de la Orden:
```json
{
  "id": "#SIF-7291",
  "customerName": "Alejandro Silva",
  "status": "kitchen",
  "toppings": [
    "Queso de Mano Artesanal",
    "Tocineta Ahumada Crujiente",
    "Salsa Tártara Sifrina",
    "Maíz Tierno Dulce"
  ],
  "beverage": "Malta Polar 355ml",
  "modificaciones": "SIN PAPITAS (ALERGIA AL GLUTEN) - POTES EXTRA SELLADOS",
  "totalBs": "Bs 962.00",
  "totalUsd": "$18.50",
  "deliveryZone": "Altamira Norte",
  "createdAt": 1732371900000
}
```

### Ejemplo cURL para Pruebas Rápidas:
```bash
curl -X POST https://tu-proyecto.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -H "x-sifrina-secret: SifrinaKDSSecure2026" \
  -d '{
    "id": "#SIF-8832",
    "customerName": "Valentina Quintero",
    "status": "kitchen",
    "toppings": ["Carne Mechada", "Queso Telita", "Tártara Sifrina"],
    "beverage": "Pepsi Regular",
    "modificaciones": "EXTRA CRUJIENTE LA MASA",
    "totalBs": "Bs 1040.00",
    "totalUsd": "$20.00",
    "deliveryZone": "Las Mercedes",
    "createdAt": 1732372000000
  }'
```

---

## 🚀 3. Despliegue en Vercel y GitHub

### Paso 1: Inicializar repositorio Git y subir a GitHub
```bash
cd sifrina-kds
git init
git add .
git commit -m "feat: Sifrina KDS Dark Kitchen v1.0 listo para producción"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sifrina-kds.git
git push -u origin main
```

### Paso 2: Importar en Vercel
1. Ingresa a [Vercel](https://vercel.com) con tu cuenta.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Selecciona el repositorio `sifrina-kds`.
4. En **Environment Variables**, añade:
   - `KDS_SECRET`: `SifrinaKDSSecure2026` (o la clave que prefieras).
5. Haz clic en **"Deploy"**. En menos de 60 segundos la aplicación estará en línea con HTTPS y CDN global.

---

## 🛠️ 4. Desarrollo Local

```bash
# Instalar dependencias
npm install
# o con pnpm / yarn
pnpm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 📱 5. Modo Televisor 55" (Instalación en Dark Kitchen)
1. Conecta el TV al navegador o mini-PC (Chromebox / Raspberry Pi / Android TV).
2. Abre la URL del KDS.
3. Presiona el botón **`🖥️ TV 55"`** o presiona `F11` para modo pantalla completa.
4. Haz un toque en la pantalla o presiona el botón **`🔔 Campana Activa`** para autorizar el audio en el navegador (política de autoplay).
