import { useEffect, useRef, useState } from 'react';
import { tocar } from '../lib/som';
import type { EstadoPartida } from '../types';

export interface Feedback {
  tipo: 'acerto' | 'erro';
  /** Muda a cada palpite, para a animação recomeçar mesmo com dois erros seguidos. */
  chave: number;
}

/**
 * Compara o estado novo da partida com o anterior para saber se o último palpite
 * foi acerto ou erro (o servidor só devolve o estado; a reação visual é do front).
 */
export function useFeedback(partida: EstadoPartida): Feedback | null {
  const anterior = useRef(partida);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    const antes = anterior.current;
    anterior.current = partida;
    if (antes.id !== partida.id) return;

    if (antes.dica === null && partida.dica !== null) tocar('dica');

    if (partida.letrasTentadas.length > antes.letrasTentadas.length) {
      const tipo = partida.vidasRestantes < antes.vidasRestantes ? 'erro' : 'acerto';
      tocar(tipo);
      setFeedback({ tipo, chave: partida.letrasTentadas.length });
    }
  }, [partida]);

  return feedback;
}
