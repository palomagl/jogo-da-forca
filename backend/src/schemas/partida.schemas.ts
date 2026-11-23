import { z } from 'zod';

// No handler: .parse() lança ZodError se o dado for inválido → o setErrorHandler devolve 400.

export const novaPartidaSchema = z.object(
  {
    jogador: z
      .string({ error: 'Informe o apelido do jogador' })
      .trim()
      .min(3, 'O apelido precisa ter pelo menos 3 caracteres')
      .max(20, 'O apelido pode ter no máximo 20 caracteres'),
    // bônus: opcional; sem ela, sorteia entre todas as palavras
    dificuldade: z
      .enum(['facil', 'medio', 'dificil'], { error: 'A dificuldade deve ser facil, medio ou dificil' })
      .optional(),
  },
  { error: 'Envie um JSON com o campo jogador' },
);

// RN02: exatamente uma letra de A a Z; o servidor converte para maiúscula
export const palpiteSchema = z.object(
  {
    letra: z
      .string({ error: 'Informe a letra do palpite' })
      .regex(/^[a-zA-Z]$/, 'Envie uma única letra de A a Z')
      .transform((l) => l.toUpperCase()),
  },
  { error: 'Envie um JSON com o campo letra' },
);

// Os parâmetros da URL chegam como texto: coerce converte "7" em 7
export const idSchema = z.object({
  id: z.coerce
    .number({ error: 'O id da partida precisa ser um número' })
    .int('O id da partida precisa ser um número inteiro')
    .positive('O id da partida precisa ser positivo'),
});
