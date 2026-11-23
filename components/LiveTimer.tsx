'use client';

import React, { useEffect, useState } from 'react';
import { calculateKitchenTimer } from '@/lib/caracasTime';

interface LiveTimerProps {
  createdAt: number;
}

export const LiveTimer: React.FC<LiveTimerProps> = ({ createdAt }) => {
  const [timerData, setTimerData] = useState(() => calculateKitchenTimer(createdAt));

  useEffect(() => {
    // Actualizar cada 500ms para precisión en vivo en la TV
    const interval = setInterval(() => {
      setTimerData(calculateKitchenTimer(createdAt));
    }, 500);

    return () => clearInterval(interval);
  }, [createdAt]);

  const { minutes, seconds, isOverLimit, isWarning } = timerData;

  if (isOverLimit) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/80 border-2 border-red-500 animate-pulse text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <div className="flex flex-col items-end">
          <div className="font-mono text-xl sm:text-2xl font-black text-red-400 tracking-wider">
            {minutes}:{seconds}
          </div>
          <span className="text-[10px] font-black uppercase text-red-300 tracking-wider">
            ¡DEMORA &gt;9 MIN!
          </span>
        </div>
      </div>
    );
  }

  if (isWarning) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-500/80 text-amber-300">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse"></span>
        <div className="flex flex-col items-end">
          <div className="font-mono text-xl sm:text-2xl font-bold text-amber-300 tracking-wider">
            {minutes}:{seconds}
          </div>
          <span className="text-[10px] font-bold uppercase text-amber-400/90 tracking-wider">
            Límite cercano
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-950/40 border border-orange-500/40 text-orange-200">
      <span className="h-2.5 w-2.5 rounded-full bg-orange-400"></span>
      <div className="font-mono text-xl sm:text-2xl font-bold text-orange-200 tracking-wider">
        {minutes}:{seconds}
      </div>
    </div>
  );
};
