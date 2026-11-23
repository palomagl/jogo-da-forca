import { defineConfig } from 'vitest/config';

// extensão .mts evita um aviso do Vitest
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    env: { DATABASE_URL: 'file:./test.db' }, // banco só de testes: o forca.db fica intacto
    globalSetup: './tests/setup-banco.ts', // cria as tabelas antes dos testes
    fileParallelism: false, // os arquivos usam o mesmo banco
  },
});
