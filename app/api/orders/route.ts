import { NextRequest, NextResponse } from 'next/server';
import { getOrders, upsertOrder, updateOrderStatus, resetOrdersStore } from '@/lib/store';
import { Order, OrderStatus } from '@/types/order';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SIFRINA_SECRET = process.env.KDS_SECRET || 'SifrinaKDSSecure2026';

// Headers CORS para integración externa con n8n
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-sifrina-secret',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/orders
 * Retorna la lista de todas las órdenes activas ordenadas cronológicamente
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
 * Recibe una orden desde n8n
 * Valida cabecera: x-sifrina-secret: SifrinaKDSSecure2026
 */
export async function POST(request: NextRequest) {
  try {
    const secretHeader = request.headers.get('x-sifrina-secret');

    if (!secretHeader || secretHeader !== SIFRINA_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acceso no autorizado. Cabecera x-sifrina-secret inválida o ausente.',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Soporte para reset/demo si n8n envía action: "reset"
    if (body.action === 'reset') {
      const resetList = resetOrdersStore();
      return NextResponse.json(
        { success: true, message: 'KDS reiniciado con órdenes de prueba', orders: resetList },
        { status: 200, headers: corsHeaders }
      );
    }

    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'El campo "id" es requerido y debe ser un string (ej. "#SIF-7291")',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const validStatuses: OrderStatus[] = ['standby', 'payment_pending', 'kitchen', 'dispatched'];
    const status: OrderStatus = validStatuses.includes(body.status) ? body.status : 'standby';

    const orderToSave: Partial<Order> & { id: string } = {
      id: body.id,
      customerName: body.customerName || 'Cliente WhatsApp',
      status,
      toppings: Array.isArray(body.toppings) ? body.toppings : [],
      beverage: body.beverage || 'Sin bebida',
      modificaciones: body.modificaciones || 'Ninguna',
      totalBs: body.totalBs || 'Bs 0.00',
      totalUsd: body.totalUsd || '$0.00',
      deliveryZone: body.deliveryZone || 'Caracas',
      createdAt: body.createdAt ? Number(body.createdAt) : Date.now(),
    };

    const savedOrder = upsertOrder(orderToSave);

    console.log(`[KDS API] Orden procesada con éxito: ${savedOrder.id} [${savedOrder.status}]`);

    return NextResponse.json(
      {
        success: true,
        message: 'Orden guardada y proyectada en pantalla con éxito',
        order: savedOrder,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[KDS API] Error al procesar orden de n8n:', error);
    return NextResponse.json(
      { success: false, error: 'Formato de payload inválido o error en la petición' },
      { status: 400, headers: corsHeaders }
    );
  }
}

/**
 * PATCH /api/orders
 * Permite cambiar el estado de una orden desde el botón táctil de la pantalla
 * o desde webhook n8n
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
        { success: false, error: `Orden ${id} no encontrada en el sistema` },
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
    console.error('[KDS API] Error al actualizar estado de orden:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar orden' },
      { status: 500, headers: corsHeaders }
    );
  }
}
