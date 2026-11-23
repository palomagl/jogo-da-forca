import { PrismaClient } from '@prisma/client';

// UMA instância para o app inteiro: todos os repositories importam este `prisma`.
// Criar vários PrismaClient abriria várias conexões com o banco sem necessidade.
export const prisma = new PrismaClient();
