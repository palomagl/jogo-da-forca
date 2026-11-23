// Tipos que a API devolve (os mesmos são usados no front-end, em frontend/src/types.ts)

export type StatusPartida = 'em_andamento' | 'vitoria' | 'derrota';

/** Bônus: níveis de dificuldade pelo tamanho da palavra. */
export type Dificuldade = 'facil' | 'medio' | 'dificil';

export interface EstadoPartida {
  id: number;
  jogador: string;
  categoria: string;
  mascara: string; // ex.: "PR_M_SE"
  letrasTentadas: string[]; // ex.: ["E", "P", "R", "S", "M", "A"]
  vidasRestantes: number; // 0 a 6
  status: StatusPartida;
  pontos: number; // 0 enquanto não houver vitória
  palavra: string | null; // null enquanto status === 'em_andamento'
  dica: string | null; // bônus: null até o jogador comprar a dica
}

export interface ItemRanking {
  jogador: string;
  pontos: number;
  palavra: string;
  finalizadaEm: string; // data ISO
}
