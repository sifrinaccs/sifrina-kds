export type OrderStatus = 'standby' | 'payment_pending' | 'kitchen' | 'dispatched';

export interface Order {
  id: string; // ej. "#SIF-7291"
  customerName: string;
  status: OrderStatus;
  toppings: string[];
  beverage: string; // ej. "Pepsi" o "Malta"
  modificaciones: string; // ej. "SIN PAPITAS", "EXTRA QUESO"
  totalBs: string;
  totalUsd: string;
  deliveryZone: string;
  createdAt: number; // timestamp en milisegundos
  completedAt?: number;
}

export interface ColumnConfig {
  id: OrderStatus;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  glowClass?: string;
  columnNumber: number;
}
