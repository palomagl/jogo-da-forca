import { criarApp } from './app';

// Só sobe o servidor; os testes usam criarApp() direto, sem abrir porta.
const PORTA = Number(process.env.PORT ?? 3333);
const app = criarApp();

app
  .listen({ port: PORTA })
  .then(() => console.log(`API do Forca Dev em http://localhost:${PORTA}`))
  .catch((erro: unknown) => {
    console.error(erro);
    process.exit(1);
  });
