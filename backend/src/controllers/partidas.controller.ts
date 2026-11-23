import type { FastifyReply, FastifyRequest } from 'fastify';
import { idSchema, novaPartidaSchema, palpiteSchema } from '../schemas/partida.schemas';
import * as service from '../services/partidas.service';

// Controllers: validam a entrada (Zod) e chamam o service.
// Não precisam de try/catch: um erro lançado aqui vai direto para o setErrorHandler.
// Regra do Fastify: retorne o objeto OU `reply.send(...)`; nunca deixe sem retorno.

/** POST /api/partidas → 201 */
export async function criar(req: FastifyRequest, reply: FastifyReply) {
  const { jogador, dificuldade } = novaPartidaSchema.parse(req.body); // req.body é unknown
  const partida = await service.criarPartida(jogador, dificuldade);
  return reply.status(201).send(partida);
}

/** GET /api/partidas/:id → 200 */
export async function buscar(req: FastifyRequest) {
  const { id } = idSchema.parse(req.params);
  return service.buscarPartida(id);
}

/** POST /api/partidas/:id/palpites → 200 */
export async function palpitar(req: FastifyRequest) {
  const { id } = idSchema.parse(req.params);
  const { letra } = palpiteSchema.parse(req.body);
  return service.registrarPalpite(id, letra);
}

/** POST /api/partidas/:id/dica → 200 (bônus) */
export async function dica(req: FastifyRequest) {
  const { id } = idSchema.parse(req.params);
  return service.comprarDica(id);
}

/** GET /api/ranking → 200 */
export async function ranking() {
  return service.listarRanking();
}
