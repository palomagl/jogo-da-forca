import type { Palavra } from '@prisma/client';
import { ErroApp } from '../errors';
import {
  aplicarDica,
  aplicarPalpite,
  calcularVidasRestantes,
  classificarDificuldade,
  gerarMascara,
  pontuarPartida,
  type EstadoJogo,
} from '../game/regras';
import * as palavrasRepository from '../repositories/palavras.repository';
import * as partidasRepository from '../repositories/partidas.repository';
import type { PartidaComPalavra } from '../repositories/partidas.repository';
import type { Dificuldade, EstadoPartida, ItemRanking, StatusPartida } from '../types';

const TAMANHO_RANKING = 10;
const STATUS_VALIDOS: StatusPartida[] = ['em_andamento', 'vitoria', 'derrota'];

/** O banco guarda o status como texto; aqui garantimos que é um StatusPartida válido. */
function paraStatus(valor: string): StatusPartida {
  const status = STATUS_VALIDOS.find((s) => s === valor);
  if (!status) throw new Error(`Status inválido no banco: ${valor}`);
  return status;
}

/** Converte a linha do banco no formato que as regras puras entendem. */
function paraEstadoJogo(partida: PartidaComPalavra): EstadoJogo {
  return {
    palavra: partida.palavra.texto,
    letrasTentadas: [...partida.letrasTentadas], // "EPR" → ["E", "P", "R"]
    erros: partida.erros,
    status: paraStatus(partida.status),
  };
}

/** Monta a resposta da API. RN07: a palavra só é enviada quando a partida termina. */
function montarEstado(partida: PartidaComPalavra): EstadoPartida {
  const status = paraStatus(partida.status);
  const letrasTentadas = [...partida.letrasTentadas];

  return {
    id: partida.id,
    jogador: partida.jogador,
    categoria: partida.palavra.categoria,
    mascara: gerarMascara(partida.palavra.texto, letrasTentadas),
    letrasTentadas,
    vidasRestantes: calcularVidasRestantes(partida.erros),
    status,
    pontos: partida.pontos,
    palavra: status === 'em_andamento' ? null : partida.palavra.texto,
    dica: partida.dicaUsada ? partida.palavra.dica : null,
  };
}

async function buscarOuFalhar(id: number): Promise<PartidaComPalavra> {
  const partida = await partidasRepository.buscarPorId(id);
  if (!partida) throw new ErroApp('Partida não encontrada', 404);
  return partida;
}

/**
 * Sorteia uma palavra do banco. Com dificuldade, sorteia só entre as palavras daquele tamanho.
 * O sorteio é feito em memória porque o Prisma não filtra pelo tamanho do texto no SQLite
 * e a tabela é pequena.
 */
async function sortearPalavra(dificuldade?: Dificuldade): Promise<Palavra> {
  const todas = await palavrasRepository.listarTodas();
  if (todas.length === 0) {
    throw new ErroApp('Nenhuma palavra cadastrada. Rode "npm run seed" no back-end.', 500);
  }

  const candidatas = dificuldade
    ? todas.filter((p) => classificarDificuldade(p.texto) === dificuldade)
    : todas;
  if (candidatas.length === 0) {
    throw new ErroApp(`Nenhuma palavra cadastrada para a dificuldade "${dificuldade}"`, 404);
  }

  return candidatas[Math.floor(Math.random() * candidatas.length)];
}

export async function criarPartida(jogador: string, dificuldade?: Dificuldade): Promise<EstadoPartida> {
  const palavra = await sortearPalavra(dificuldade);
  const partida = await partidasRepository.criar(jogador, palavra.id);
  return montarEstado(partida);
}

export async function buscarPartida(id: number): Promise<EstadoPartida> {
  return montarEstado(await buscarOuFalhar(id));
}

export async function registrarPalpite(id: number, letra: string): Promise<EstadoPartida> {
  const partida = await buscarOuFalhar(id);

  // as regras (RN01–RN05) ficam na função pura; aqui só buscamos e salvamos
  const novoEstado = aplicarPalpite(paraEstadoJogo(partida), letra);
  const terminou = novoEstado.status !== 'em_andamento';

  const atualizada = await partidasRepository.atualizar(id, {
    letrasTentadas: novoEstado.letrasTentadas.join(''),
    erros: novoEstado.erros,
    status: novoEstado.status,
    pontos: pontuarPartida(novoEstado), // RN06
    finalizadaEm: terminou ? new Date() : null,
  });

  return montarEstado(atualizada);
}

/** Bônus: revela a dica da palavra em troca de 1 vida. */
export async function comprarDica(id: number): Promise<EstadoPartida> {
  const partida = await buscarOuFalhar(id);
  if (!partida.palavra.dica) {
    throw new ErroApp('Esta palavra não tem dica cadastrada', 409);
  }

  const novoEstado = aplicarDica(paraEstadoJogo(partida), partida.dicaUsada);
  const atualizada = await partidasRepository.atualizar(id, {
    erros: novoEstado.erros,
    dicaUsada: true,
  });

  return montarEstado(atualizada);
}

/** RN08: top 10 vitórias. */
export async function listarRanking(): Promise<ItemRanking[]> {
  const vitorias = await partidasRepository.listarMelhoresVitorias(TAMANHO_RANKING);
  return vitorias.map((p) => ({
    jogador: p.jogador,
    pontos: p.pontos,
    palavra: p.palavra.texto,
    finalizadaEm: (p.finalizadaEm ?? p.criadaEm).toISOString(),
  }));
}
