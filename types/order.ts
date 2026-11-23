export type OrderStatus = 'standby' | 'payment_pending' | 'kitchen' | 'dispatched';

// Toppings estrictos autorizados para el Setbox oficial de Sifrina CCS
export const OFFICIAL_TOPPINGS = [
  'Reina Pepiada',
  'Chuleta glaseada con papelón',
  'Carne mechada',
  'Pepinillos agridulces',
] as const;

export type OfficialTopping = (typeof OFFICIAL_TOPPINGS)[number];

// Composición base oficial invariable de los 2 perros de Sifrina CCS
export const SIFRINA_BASE_RECIPE =
  'Pan de batata artesanal, salchicha Wiener Plumrose, queso fundido Rikesa y papitas Hot Pick';

export interface Order {
  id: string; // ej. "#SIF-7291"
  customerName: string;
  phone?: string; // Número de WhatsApp del cliente para n8n
  status: OrderStatus;
  toppings: string[]; // Setbox: únicamente Reina Pepiada, Chuleta glaseada con papelón, Carne mechada, Pepinillos agridulces
  beverage: string; // Malta Polar o Pepsi (lata 355ml o botella 1.5L)
  modificaciones: string; // ej. "SIN PAPITAS", "SIN RIKESA"
  totalBs: string;
  totalUsd: string;
  deliveryZone: string;
  createdAt: number; // timestamp en milisegundos
  completedAt?: number;
  baseRecipe?: string; // Pan de batata artesanal, salchicha Wiener Plumrose, queso fundido Rikesa y papitas Hot Pick
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
