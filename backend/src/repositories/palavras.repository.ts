import type { Palavra } from '@prisma/client';
import { prisma } from '../database/prisma';

/** Lista todas as palavras cadastradas (a tabela é pequena: ~30 linhas). */
export function listarTodas(): Promise<Palavra[]> {
  return prisma.palavra.findMany({ orderBy: { id: 'asc' } });
}
