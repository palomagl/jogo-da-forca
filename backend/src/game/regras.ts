// Regras do jogo como FUNÇÕES PURAS: recebem dados, devolvem dados novos.
// Não acessam banco, HTTP, data/hora nem Math.random — por isso são fáceis de testar.

import { ErroApp } from '../errors';
import type { Dificuldade, StatusPartida } from '../types';

/** RN01: toda partida começa com 6 vidas. */
export const VIDAS_INICIAIS = 6;

/** O que as regras precisam saber de uma partida (sem nada de banco ou HTTP). */
export interface EstadoJogo {
  /** Palavra secreta, em maiúsculas (ex.: "PROMISE"). */
  palavra: string;
  /** Letras já tentadas, na ordem em que foram enviadas. */
  letrasTentadas: string[];
  /** Quantidade de letras erradas (e dicas compradas). */
  erros: number;
  status: StatusPartida;
}

/**
 * RN02: aceita exatamente uma letra de A a Z e a devolve em maiúscula.
 *
 * @param entrada - texto enviado pelo jogador (ex.: "a")
 * @returns a letra em maiúscula, ou `null` se a entrada for inválida ("ab", "1", "", "ç")
 */
export function normalizarLetra(entrada: string): string | null {
  return /^[a-zA-Z]$/.test(entrada) ? entrada.toUpperCase() : null;
}

/**
 * Mostra as letras já tentadas e troca as demais por "_".
 *
 * @example gerarMascara('PROMISE', ['P', 'E']) // "P_____E"
 */
export function gerarMascara(palavra: string, tentadas: string[]): string {
  return [...palavra].map((letra) => (tentadas.includes(letra) ? letra : '_')).join('');
}

/**
 * Conta quantas letras diferentes a palavra tem.
 *
 * @example contarLetrasDistintas('CALLBACK') // 5 (C, A, L, B, K)
 */
export function contarLetrasDistintas(palavra: string): number {
  return new Set(palavra).size;
}

/**
 * Converte a quantidade de erros em vidas restantes (nunca abaixo de 0).
 *
 * @example calcularVidasRestantes(2) // 4
 */
export function calcularVidasRestantes(erros: number): number {
  return Math.max(VIDAS_INICIAIS - erros, 0);
}

/**
 * Diz se todas as letras da palavra já foram tentadas.
 */
export function palavraRevelada(palavra: string, tentadas: string[]): boolean {
  return [...palavra].every((letra) => tentadas.includes(letra));
}

/**
 * RN05: vitória quando a palavra está revelada; derrota quando as vidas chegam a 0.
 */
export function definirStatus(palavra: string, tentadas: string[], erros: number): StatusPartida {
  if (palavraRevelada(palavra, tentadas)) return 'vitoria';
  if (calcularVidasRestantes(erros) === 0) return 'derrota';
  return 'em_andamento';
}

/**
 * RN06: vidas restantes × 10 + letras distintas da palavra × 5.
 *
 * @example calcularPontos('PROMISE', 4) // 4 × 10 + 7 × 5 = 75
 */
export function calcularPontos(palavra: string, vidasRestantes: number): number {
  return vidasRestantes * 10 + contarLetrasDistintas(palavra) * 5;
}

/**
 * RN06: pontos finais da partida — só a vitória pontua; derrota (ou jogo em andamento) vale 0.
 */
export function pontuarPartida(partida: EstadoJogo): number {
  if (partida.status !== 'vitoria') return 0;
  return calcularPontos(partida.palavra, calcularVidasRestantes(partida.erros));
}

/**
 * Aplica RN01 a RN05 e devolve uma NOVA partida (não altera a recebida).
 *
 * @param partida - estado atual da partida
 * @param letra - palpite enviado pelo jogador
 * @returns o novo estado, com a letra registrada, erros e status atualizados
 * @throws {ErroApp} 409 se a partida já terminou (RN04)
 * @throws {ErroApp} 400 se a letra for inválida (RN02)
 * @throws {ErroApp} 409 se a letra já foi tentada (RN03) — nesse caso nenhuma vida é perdida
 */
export function aplicarPalpite(partida: EstadoJogo, letra: string): EstadoJogo {
  if (partida.status !== 'em_andamento') {
    throw new ErroApp('Esta partida já terminou e não aceita mais palpites', 409);
  }

  const normalizada = normalizarLetra(letra);
  if (normalizada === null) {
    throw new ErroApp('Envie uma única letra de A a Z', 400);
  }

  if (partida.letrasTentadas.includes(normalizada)) {
    throw new ErroApp(`A letra ${normalizada} já foi tentada`, 409);
  }

  const letrasTentadas = [...partida.letrasTentadas, normalizada];
  const acertou = partida.palavra.includes(normalizada);
  const erros = acertou ? partida.erros : partida.erros + 1; // RN01

  return {
    ...partida,
    letrasTentadas,
    erros,
    status: definirStatus(partida.palavra, letrasTentadas, erros), // RN05
  };
}

/**
 * Bônus "dica paga": revelar a dica custa 1 vida (conta como um erro).
 * Só pode ser usada uma vez por partida e exige pelo menos 2 vidas,
 * para que comprar a dica nunca cause uma derrota.
 *
 * @throws {ErroApp} 409 se a partida terminou, se a dica já foi usada ou se resta só 1 vida
 */
export function aplicarDica(partida: EstadoJogo, dicaJaUsada: boolean): EstadoJogo {
  if (partida.status !== 'em_andamento') {
    throw new ErroApp('Esta partida já terminou', 409);
  }
  if (dicaJaUsada) {
    throw new ErroApp('A dica desta partida já foi revelada', 409);
  }
  if (calcularVidasRestantes(partida.erros) < 2) {
    throw new ErroApp('Você precisa de pelo menos 2 vidas para comprar a dica', 409);
  }
  return { ...partida, erros: partida.erros + 1 };
}

/**
 * Bônus "níveis": classifica a palavra pelo tamanho.
 * fácil = até 6 letras · médio = 7 a 9 · difícil = 10 ou mais.
 */
export function classificarDificuldade(palavra: string): Dificuldade {
  if (palavra.length <= 6) return 'facil';
  if (palavra.length <= 9) return 'medio';
  return 'dificil';
}
