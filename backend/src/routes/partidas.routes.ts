import type { FastifyInstance } from 'fastify';
import * as controller from '../controllers/partidas.controller';

// Toda rota é registrada dentro de um plugin: uma função async que recebe o app.
// O prefixo /api é dado em app.ts: app.register(rotasPartidas, { prefix: '/api' }).
export async function rotasPartidas(app: FastifyInstance) {
  app.post('/partidas', controller.criar);
  app.get('/partidas/:id', controller.buscar);
  app.post('/partidas/:id/palpites', controller.palpitar);
  app.post('/partidas/:id/dica', controller.dica); // bônus
  app.get('/ranking', controller.ranking);
}
