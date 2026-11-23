import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import { ErroApp } from './errors';
import { rotasPartidas } from './routes/partidas.routes';

/** Cria o app sem abrir porta: o server.ts chama listen() e os testes usam app.inject(). */
export function criarApp() {
  const app = Fastify(); // o JSON do corpo já é lido sozinho

  // Um único lugar para transformar QUALQUER erro em resposta { erro }.
  // Registrado antes das rotas para valer para todos os plugins.
  app.setErrorHandler((err: FastifyError, _req, reply) => {
    // dados inválidos (Zod) → 400 com a primeira mensagem
    if (err instanceof ZodError) {
      return reply.status(400).send({
        erro: err.issues[0]?.message ?? 'Dados inválidos',
        detalhes: err.issues.map((issue) => ({
          campo: issue.path.map(String).join('.'),
          mensagem: issue.message,
        })),
      });
    }

    // erros esperados do jogo/serviço → status escolhido por nós (404, 409, …)
    if (err instanceof ErroApp) {
      return reply.status(err.status).send({ erro: err.message });
    }

    // erros do próprio Fastify, ex.: JSON malformado (400) ou corpo vazio
    if (err.statusCode !== undefined && err.statusCode < 500) {
      return reply.status(err.statusCode).send({ erro: `Requisição inválida: ${err.message}` });
    }

    console.error(err);
    return reply.status(500).send({ erro: 'Erro interno no servidor' });
  });

  app.setNotFoundHandler((_req, reply) => reply.status(404).send({ erro: 'Rota não encontrada' }));

  // o front usa o proxy do Vite; o CORS libera chamadas diretas (ex.: front em outra porta)
  app.register(cors);
  app.register(rotasPartidas, { prefix: '/api' });

  return app;
}
