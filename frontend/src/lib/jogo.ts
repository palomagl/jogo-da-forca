// Funções auxiliares do front (puras: só calculam, não mexem em tela nem em API).

/** Igual ao back-end: toda partida começa com 6 vidas. */
export const VIDAS_INICIAIS = 6;

/**
 * Quantos acertos seguidos o jogador fez nas últimas letras.
 * @example calcularCombo(['A', 'P', 'R'], 'PR_____') // 2 (P e R acertaram; A errou antes)
 */
export function calcularCombo(tentadas: string[], mascara: string): number {
  let combo = 0;
  for (let i = tentadas.length - 1; i >= 0; i--) {
    if (!mascara.includes(tentadas[i])) break;
    combo++;
  }
  return combo;
}

/** Estrelas da vitória: 5 ou 6 vidas = 3 estrelas, 3 ou 4 = 2, 1 ou 2 = 1. */
export function calcularEstrelas(vidasRestantes: number): number {
  if (vidasRestantes >= 5) return 3;
  if (vidasRestantes >= 3) return 2;
  return 1;
}

/** Cor fixa por apelido: o mesmo nome sempre gera a mesma cor de avatar. */
export function corDoJogador(nome: string): string {
  let matiz = 0;
  for (const caractere of nome.trim().toLowerCase()) {
    matiz = (matiz * 31 + caractere.charCodeAt(0)) % 360;
  }
  return `hsl(${matiz} 80% 62%)`;
}

/** Primeira letra do apelido, para o avatar. */
export function inicialDoJogador(nome: string): string {
  return nome.trim().charAt(0).toUpperCase() || '?';
}

/** 75 → "01:15" */
export function formatarTempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

export interface EstiloCategoria {
  sigla: string;
  fundo: string;
  texto: string;
}

const CATEGORIAS: Record<string, EstiloCategoria> = {
  JavaScript: { sigla: 'JS', fundo: '#F7DF1E', texto: '#2B2600' },
  TypeScript: { sigla: 'TS', fundo: '#3178C6', texto: '#FFFFFF' },
  React: { sigla: '⚛', fundo: '#61DAFB', texto: '#06303D' },
  'Banco de Dados': { sigla: 'DB', fundo: '#FF8A3D', texto: '#3A1600' },
};

/** Selo colorido da categoria (categorias novas ganham um selo genérico). */
export function estiloDaCategoria(categoria: string): EstiloCategoria {
  return CATEGORIAS[categoria] ?? { sigla: '{ }', fundo: '#A78BFA', texto: '#1E1240' };
}

/** true se o usuário pediu ao sistema para reduzir animações. */
export function prefereMenosMovimento(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
