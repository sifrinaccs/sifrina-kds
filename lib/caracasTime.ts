/**
 * Utilidades para zona horaria de Caracas, Venezuela (GMT-4 / America/Caracas)
 * y temporizador de preparación de cocina.
 */

export const getCaracasTimeString = (): { time: string; date: string; seconds: string } => {
  const now = new Date();

  // Formato de hora en Caracas GMT-4
  const timeFormatter = new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateFormatter = new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = timeFormatter.format(now);
  const formattedDate = dateFormatter.format(now);

  return {
    time: formattedTime,
    date: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1),
    seconds: String(now.getSeconds()).padStart(2, '0'),
  };
};

/**
 * Calcula el tiempo transcurrido en minutos y segundos
 * Regla de negocio: Si supera los 9 minutos (540s), se activa alerta roja
 */
export const calculateKitchenTimer = (createdAt: number): {
  minutes: string;
  seconds: string;
  totalSeconds: number;
  isOverLimit: boolean; // Mayor a 9 minutos
  isWarning: boolean; // Entre 7 y 9 minutos
} => {
  const now = Date.now();
  // Manejo defensivo en caso de que createdAt venga en segundos en vez de ms
  const createdMs = createdAt < 10000000000 ? createdAt * 1000 : createdAt;
  const diffMs = Math.max(0, now - createdMs);
  const totalSeconds = Math.floor(diffMs / 1000);

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return {
    minutes: String(mins).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
    totalSeconds,
    isOverLimit: totalSeconds >= 540, // 9 minutos = 540 segundos
    isWarning: totalSeconds >= 420 && totalSeconds < 540, // 7 a 9 minutos
  };
};
