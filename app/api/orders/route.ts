import { NextRequest, NextResponse } from 'next/server';
import {
  getOrders,
  upsertOrder,
  updateOrderStatus,
  clearOrdersStore,
  resetOrdersStore,
} from '@/lib/store';
import { Order, OrderStatus, SIFRINA_BASE_RECIPE } from '@/types/order';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SIFRINA_SECRET = process.env.KDS_SECRET || 'SifrinaKDSSecure2026';

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
 * Retorna las órdenes activas ordenadas cronológicamente para la pantalla KDS
 */
export async function GET(request: NextRequest) {
  try {
    const orders = getOrders();
    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        timestamp: Date.now(),
        orders,
      },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
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
 * Recibe una orden en tiempo real desde n8n
 * Valida la cabecera de seguridad: x-sifrina-secret: SifrinaKDSSecure2026
 */
export async function POST(request: NextRequest) {
  try {
    const secretHeader = request.headers.get('x-sifrina-secret');

    // Validación de seguridad estricta
    if (!secretHeader || secretHeader !== SIFRINA_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acceso no autorizado. La cabecera x-sifrina-secret es requerida y debe coincidir.',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Soporte para acción de limpieza ("Limpiar Pantalla")
    if (body.action === 'clear') {
      const clearedList = clearOrdersStore();
      return NextResponse.json(
        { success: true, message: 'Tablero KDS vaciado correctamente', orders: clearedList },
        { status: 200, headers: corsHeaders }
      );
    }

    // Soporte para restablecer pedido de prueba oficial
    if (body.action === 'reset') {
      const resetList = resetOrdersStore();
      return NextResponse.json(
        { success: true, message: 'Tablero KDS restablecido con pedido oficial', orders: resetList },
        { status: 200, headers: corsHeaders }
      );
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

    const orderToSave: Partial<Order> & { id: string } = {
      id: body.id,
      customerName: body.customerName || 'Cliente WhatsApp',
      status,
      toppings: Array.isArray(body.toppings) ? body.toppings : ['Reina Pepiada', 'Chuleta glaseada con papelón'],
      beverage: body.beverage || 'Malta Polar 355ml',
      modificaciones: body.modificaciones || 'Ninguna',
      totalBs: body.totalBs || 'Bs 0.00',
      totalUsd: body.totalUsd || '$0.00',
      deliveryZone: body.deliveryZone || 'Caracas',
      createdAt: body.createdAt ? Number(body.createdAt) : Date.now(),
      baseRecipe: body.baseRecipe || SIFRINA_BASE_RECIPE,
    };

    const savedOrder = upsertOrder(orderToSave);

    console.log(`[KDS n8n] Pedido inyectado: ${savedOrder.id} (${savedOrder.customerName}) ➔ Columna: [${savedOrder.status}]`);

    return NextResponse.json(
      {
        success: true,
        message: 'Orden proyectada en tiempo real en la pantalla del KDS',
        order: savedOrder,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[KDS API] Error al procesar payload de n8n:', error);
    return NextResponse.json(
      { success: false, error: 'Formato de payload inválido o error en la petición' },
      { status: 400, headers: corsHeaders }
    );
  }
}

/**
 * PATCH /api/orders
 * Permite cambiar el estado de la comanda desde el botón táctil de cocina
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Se requiere "id" y nuevo "status"' },
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = updateOrderStatus(id, status as OrderStatus);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Orden ${id} no encontrada` },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Orden ${id} actualizada a ${status}`,
        order: updated,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[KDS API] Error al actualizar orden:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar comanda' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/orders
 * Vence y limpia el tablero al terminar el turno
 */
export async function DELETE() {
  clearOrdersStore();
  return NextResponse.json(
    { success: true, message: 'Tablero KDS limpiado con éxito' },
    { status: 200, headers: corsHeaders }
  );
}
