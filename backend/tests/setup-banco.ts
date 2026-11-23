import { execSync } from 'node:child_process';

/** Roda uma vez antes de todos os testes: cria/atualiza as tabelas do banco de testes. */
export default function setup() {
  // db push cria/atualiza as tabelas a partir do schema, sem criar migration
  execSync('npx prisma db push --skip-generate', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'inherit',
  });
}
