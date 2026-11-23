import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { criarApp } from '../src/app';
import { prisma } from '../src/database/prisma';
import type { EstadoPartida, ItemRanking } from '../src/types';

// Usa o banco de testes (test.db, configurado no vitest.config.mts).
// Uma palavra só (PROMISE) deixa o sorteio previsível.
const app = criarApp();

interface RespostaErro {
  erro: string;
}

async function novaPartida(jogador = 'tester'): Promise<EstadoPartida> {
  const res = await app.inject({ method: 'POST', url: '/api/partidas', payload: { jogador } });
  expect(res.statusCode).toBe(201);
  return res.json<EstadoPartida>();
}

function palpitar(id: number, letra: string) {
  return app.inject({ method: 'POST', url: `/api/partidas/${id}/palpites`, payload: { letra } });
}

/** Envia as letras em sequência e devolve o último estado. */
async function jogar(id: number, letras: string[]): Promise<EstadoPartida> {
  let ultimo: EstadoPartida | null = null;
  for (const letra of letras) {
    const res = await palpitar(id, letra);
    expect(res.statusCode).toBe(200);
    ultimo = res.json<EstadoPartida>();
  }
  if (!ultimo) throw new Error('Nenhuma letra enviada');
  return ultimo;
}

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

beforeAll(async () => {
  await app.ready();
  await prisma.partida.deleteMany(); // limpa o banco de testes
  await prisma.palavra.deleteMany();
  await prisma.palavra.create({
    data: { texto: 'PROMISE', categoria: 'JavaScript', dica: 'Valor que chega no futuro' },
  });
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

describe('POST /api/partidas', () => {
  it('recusa apelido curto com 400 no formato { erro }', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/partidas', payload: { jogador: 'ab' } });
    expect(res.statusCode).toBe(400);
    expect(res.json<RespostaErro>().erro).toBe('O apelido precisa ter pelo menos 3 caracteres');
  });

  it('cria a partida com 6 vidas e SEM revelar a palavra (RN01, RN07)', async () => {
    const partida = await novaPartida('ana');
    expect(partida).toMatchObject({
      jogador: 'ana',
      categoria: 'JavaScript',
      mascara: '_______',
      letrasTentadas: [],
      vidasRestantes: 6,
      status: 'em_andamento',
      pontos: 0,
      palavra: null,
    });
  });
});

describe('GET /api/partidas/:id', () => {
  it('devolve o estado da partida', async () => {
    const { id } = await novaPartida();
    const res = await app.inject({ method: 'GET', url: `/api/partidas/${id}` });
    expect(res.statusCode).toBe(200);
    expect(res.json<EstadoPartida>().id).toBe(id);
  });

  it('responde 404 para partida inexistente', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/partidas/999999' });
    expect(res.statusCode).toBe(404);
    expect(res.json<RespostaErro>().erro).toBe('Partida não encontrada');
  });
});

describe('POST /api/partidas/:id/palpites', () => {
  it.each(['ab', '1', '', 'ç'])('palpite %j responde 400 (RN02)', async (letra) => {
    const { id } = await novaPartida();
    const res = await palpitar(id, letra);
    expect(res.statusCode).toBe(400);
    expect(res.json<RespostaErro>()).toHaveProperty('erro');
  });

  it('converte para maiúscula, erro tira vida e letra repetida dá 409 sem tirar vida (RN01-RN03)', async () => {
    const { id } = await novaPartida();

    const acerto = (await palpitar(id, 'p')).json<EstadoPartida>();
    expect(acerto.mascara).toBe('P______');
    expect(acerto.vidasRestantes).toBe(6);

    const erro = (await palpitar(id, 'a')).json<EstadoPartida>();
    expect(erro.vidasRestantes).toBe(5);
    expect(erro.letrasTentadas).toEqual(['P', 'A']);

    const repetida = await palpitar(id, 'A');
    expect(repetida.statusCode).toBe(409);

    const depois = await app.inject({ method: 'GET', url: `/api/partidas/${id}` });
    expect(depois.json<EstadoPartida>().vidasRestantes).toBe(5);
  });

  it('vitória: revela a palavra, calcula os pontos e não aceita mais palpites (RN04-RN07)', async () => {
    const { id } = await novaPartida('vencedora');
    const fim = await jogar(id, ['P', 'R', 'O', 'M', 'I', 'S', 'E']);

    expect(fim.status).toBe('vitoria');
    expect(fim.palavra).toBe('PROMISE');
    expect(fim.pontos).toBe(6 * 10 + 7 * 5); // 95

    const depois = await palpitar(id, 'Z');
    expect(depois.statusCode).toBe(409);
  });

  it('derrota com 6 erros: 0 pontos e palavra revelada (RN05-RN07)', async () => {
    const { id } = await novaPartida();
    const fim = await jogar(id, ['A', 'B', 'C', 'D', 'F', 'G']);

    expect(fim.status).toBe('derrota');
    expect(fim.vidasRestantes).toBe(0);
    expect(fim.pontos).toBe(0);
    expect(fim.palavra).toBe('PROMISE');
  });

  it('responde 404 para partida inexistente', async () => {
    const res = await palpitar(999999, 'a');
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/ranking (RN08)', () => {
  beforeEach(async () => {
    await prisma.partida.deleteMany();
  });

  it('lista só vitórias, por pontos; no empate, quem terminou primeiro', async () => {
    const primeira = await novaPartida('primeira');
    await jogar(primeira.id, ['P', 'R', 'O', 'M', 'I', 'S', 'E']); // 95 pontos
    await esperar(20);

    const segunda = await novaPartida('segunda');
    await jogar(segunda.id, ['P', 'R', 'O', 'M', 'I', 'S', 'E']); // 95 pontos, terminou depois

    const comErro = await novaPartida('comErro');
    await jogar(comErro.id, ['A', 'P', 'R', 'O', 'M', 'I', 'S', 'E']); // 85 pontos

    const perdeu = await novaPartida('perdeu');
    await jogar(perdeu.id, ['A', 'B', 'C', 'D', 'F', 'G']); // derrota: fora do ranking

    const res = await app.inject({ method: 'GET', url: '/api/ranking' });
    expect(res.statusCode).toBe(200);

    const ranking = res.json<ItemRanking[]>();
    expect(ranking.map((item) => item.jogador)).toEqual(['primeira', 'segunda', 'comErro']);
    expect(ranking.map((item) => item.pontos)).toEqual([95, 95, 85]);
    expect(ranking[0].palavra).toBe('PROMISE');
  });
});

describe('bônus e erros gerais', () => {
  it('dica custa 1 vida e só pode ser comprada uma vez', async () => {
    const { id } = await novaPartida();
    const res = await app.inject({ method: 'POST', url: `/api/partidas/${id}/dica` });
    expect(res.statusCode).toBe(200);
    expect(res.json<EstadoPartida>()).toMatchObject({ vidasRestantes: 5, dica: 'Valor que chega no futuro' });

    const deNovo = await app.inject({ method: 'POST', url: `/api/partidas/${id}/dica` });
    expect(deNovo.statusCode).toBe(409);
  });

  it('rota inexistente responde 404 no formato { erro }', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/nao-existe' });
    expect(res.statusCode).toBe(404);
    expect(res.json<RespostaErro>().erro).toBe('Rota não encontrada');
  });
});
