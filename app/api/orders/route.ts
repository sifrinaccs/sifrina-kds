import { NextRequest, NextResponse } from 'next/server';
import {
  getOrders,
  getOrderById,
  upsertOrder,
  updateOrderStatus,
  clearOrdersStore,
  parseCreatedAt,
} from '@/lib/store';
import { Order, OrderStatus, SIFRINA_BASE_RECIPE } from '@/types/order';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SIFRINA_SECRET = process.env.KDS_SECRET || 'SifrinaKDSSecure2026';
const N8N_DISPATCH_WEBHOOK = 'https://devsifrinaccs.app.n8n.cloud/webhook/kds-despachado';

// Headers CORS para sincronización externa con n8n
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-sifrina-secret',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/orders
 * Retorna directamente el array de órdenes para la pantalla KDS
 */
export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json(orders, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('[KDS API] Error al obtener órdenes:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al consultar órdenes' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/orders
 * Recibe órdenes desde n8n o actualizaciones de estado desde el KDS.
 * Cuando status === "dispatched", dispara el webhook a n8n desde el servidor (cero CORS).
 */
export async function POST(request: NextRequest) {
  try {
    const secretHeader = request.headers.get('x-sifrina-secret');

    // Validación de seguridad estricta
    if (!secretHeader || secretHeader !== SIFRINA_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acceso no autorizado. La cabecera x-sifrina-secret es requerida.',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Soporte para acción de purga ("Limpiar Pantalla")
    if (body.action === 'clear') {
      const clearedList = clearOrdersStore();
      return NextResponse.json(clearedList, { status: 200, headers: corsHeaders });
    }

    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'El campo "id" es requerido (ej. "#SIF-7291")',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Mapeo riguroso de estados para las 4 columnas
    const validStatuses: OrderStatus[] = ['standby', 'payment_pending', 'kitchen', 'dispatched'];
    const status: OrderStatus = validStatuses.includes(body.status) ? body.status : 'standby';

    // Obtener orden previa en memoria si existe para preservar teléfono y datos
    const existingOrder = getOrderById(body.id);

    const orderToSave: Partial<Order> & { id: string } = {
      id: body.id,
      customerName: body.customerName || existingOrder?.customerName || 'Cliente WhatsApp',
      phone: body.phone !== undefined ? body.phone : existingOrder?.phone,
      status,
      toppings: Array.isArray(body.toppings) ? body.toppings : existingOrder?.toppings,
      beverage: body.beverage || existingOrder?.beverage,
      modificaciones: body.modificaciones || body.modifications || existingOrder?.modificaciones,
      totalBs: body.totalBs || existingOrder?.totalBs,
      totalUsd: body.totalUsd || existingOrder?.totalUsd,
      deliveryZone: body.deliveryZone || existingOrder?.deliveryZone,
      createdAt: body.createdAt ? parseCreatedAt(body.createdAt) : existingOrder?.createdAt,
      baseRecipe: body.baseRecipe || existingOrder?.baseRecipe || SIFRINA_BASE_RECIPE,
    };

    const savedOrder = upsertOrder(orderToSave);

    // 3. MOVER EL DISPARO DEL WEBHOOK DE DESPACHO AL BACKEND (CERO ERRORES CORS)
    if (status === 'dispatched') {
      try {
        console.log(`[n8n Webhook Backend] Notificando despacho de orden ${savedOrder.id} a n8n...`);
        const n8nRes = await fetch(N8N_DISPATCH_WEBHOOK, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: savedOrder.id,
            phone: savedOrder.phone || '',
            customerName: savedOrder.customerName || '',
          }),
        });

        if (!n8nRes.ok) {
          console.warn(`[n8n Webhook Backend] n8n respondió con código ${n8nRes.status} para ${savedOrder.id}`);
        } else {
          console.log(`[n8n Webhook Backend] ✔ Despacho notificado exitosamente a n8n para ${savedOrder.id}`);
        }
      } catch (n8nError) {
        // Se envuelve en try/catch para no interrumpir la respuesta al KDS
        console.error(`[n8n Webhook Backend] ❌ Error conectando con n8n para ${savedOrder.id}:`, n8nError);
      }
    }

    return NextResponse.json(savedOrder, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('[KDS API] Error al procesar payload de n8n:', error);
    return NextResponse.json(
      { success: false, error: 'Formato de payload inválido o error en la petición' },
      { status: 400, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/orders
 * Purga real del servidor: vacía completamente el almacén en memoria
 * Valida cabecera x-sifrina-secret para evitar purgas no autorizadas.
 */
export async function DELETE(request: NextRequest) {
  try {
    const secretHeader = request.headers.get('x-sifrina-secret');
    if (secretHeader && secretHeader !== SIFRINA_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Cabecera x-sifrina-secret inválida' },
        { status: 401, headers: corsHeaders }
      );
    }

    clearOrdersStore();
    console.log('[KDS API] ✔ Tablero purgado completamente en el servidor');
    return NextResponse.json([], { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('[KDS API] Error al purgar tablero:', error);
    return NextResponse.json(
      { success: false, error: 'Error al purgar almacén' },
      { status: 500, headers: corsHeaders }
    );
  }
}
