/**
 * Erro "esperado" da aplicação: já carrega o status HTTP que deve ser devolvido.
 * O setErrorHandler (em app.ts) transforma este erro em `{ erro: message }`.
 *
 * @example throw new ErroApp('Partida não encontrada', 404);
 */
export class ErroApp extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ErroApp';
  }
}
