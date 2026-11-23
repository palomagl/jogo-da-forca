import { useEffect, useState } from 'react';

/** Conta os segundos enquanto `ativo` for true (cronômetro da partida, só visual). */
export function useCronometro(ativo: boolean): number {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (!ativo) return;
    const id = window.setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => window.clearInterval(id); // para o relógio quando a tela sai
  }, [ativo]);

  return segundos;
}
