import { useEffect, useState } from 'react';
import { prefereMenosMovimento } from '../lib/jogo';

/** Anima um número de 0 até `alvo` (placar subindo no fim da partida). */
export function useContagem(alvo: number, duracaoMs = 1400): number {
  const [valor, setValor] = useState(() => (prefereMenosMovimento() ? alvo : 0));

  useEffect(() => {
    if (prefereMenosMovimento() || alvo === 0) {
      setValor(alvo);
      return;
    }
    let quadro = 0;
    const inicio = performance.now();

    function passo(agora: number) {
      const progresso = Math.min((agora - inicio) / duracaoMs, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3); // desacelera no final
      setValor(Math.round(alvo * suavizado));
      if (progresso < 1) quadro = requestAnimationFrame(passo);
    }

    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [alvo, duracaoMs]);

  return valor;
}
