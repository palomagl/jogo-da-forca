import type { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';
import type { StatusPartida } from '../types';

/** Partida já com a palavra relacionada (resultado de `include: { palavra: true }`). */
export type PartidaComPalavra = Prisma.PartidaGetPayload<{ include: { palavra: true } }>;

/** Campos que mudam durante o jogo. */
export interface AlteracoesPartida {
  letrasTentadas?: string;
  erros?: number;
  status?: StatusPartida;
  pontos?: number;
  dicaUsada?: boolean;
  finalizadaEm?: Date | null;
}

export function criar(jogador: string, palavraId: number): Promise<PartidaComPalavra> {
  return prisma.partida.create({
    data: { jogador, palavraId },
    include: { palavra: true },
  });
}

/** Busca por id; devolve `null` se não existir. */
export function buscarPorId(id: number): Promise<PartidaComPalavra | null> {
  return prisma.partida.findUnique({ where: { id }, include: { palavra: true } });
}

export function atualizar(id: number, alteracoes: AlteracoesPartida): Promise<PartidaComPalavra> {
  return prisma.partida.update({
    where: { id },
    data: alteracoes,
    include: { palavra: true },
  });
}

/**
 * RN08: as vitórias com mais pontos; no empate, quem terminou primeiro fica à frente.
 */
export function listarMelhoresVitorias(limite: number): Promise<PartidaComPalavra[]> {
  return prisma.partida.findMany({
    where: { status: 'vitoria' },
    orderBy: [{ pontos: 'desc' }, { finalizadaEm: 'asc' }],
    take: limite,
    include: { palavra: true },
  });
}
