# Planejamento — Forca Dev

## 1. Tabelas (Prisma + SQLite)

### `palavras` (model `Palavra`)

| Coluna      | Tipo Prisma | Tipo SQLite | Regras                                         |
|-------------|-------------|-------------|------------------------------------------------|
| `id`        | `Int`       | INTEGER     | chave primária, autoincremento                 |
| `texto`     | `String`    | TEXT        | único; MAIÚSCULAS, sem acento/espaço/hífen     |
| `categoria` | `String`    | TEXT        | ex.: JavaScript, TypeScript, React, Banco de Dados |
| `dica`      | `String?`   | TEXT NULL   | bônus "dica paga"                              |

### `partidas` (model `Partida`)

| Coluna            | Tipo Prisma | Tipo SQLite | Regras                                          |
|-------------------|-------------|-------------|-------------------------------------------------|
| `id`              | `Int`       | INTEGER     | chave primária, autoincremento                  |
| `jogador`         | `String`    | TEXT        | apelido de 3 a 20 caracteres                    |
| `palavra_id`      | `Int`       | INTEGER     | chave estrangeira → `palavras.id`               |
| `letras_tentadas` | `String`    | TEXT        | padrão `""`; letras concatenadas, ex.: `"EPRSMA"` |
| `erros`           | `Int`       | INTEGER     | padrão 0; vidas restantes = 6 − erros           |
| `status`          | `String`    | TEXT        | `em_andamento` \| `vitoria` \| `derrota`        |
| `pontos`          | `Int`       | INTEGER     | padrão 0; calculado só na vitória (RN06)        |
| `dica_usada`      | `Boolean`   | BOOLEAN     | padrão `false` (bônus)                          |
| `criada_em`       | `DateTime`  | DATETIME    | padrão `now()`                                  |
| `finalizada_em`   | `DateTime?` | DATETIME    | preenchida na vitória/derrota; desempata o ranking |

Relação: uma `Palavra` tem muitas `Partida`s; cada `Partida` tem uma `Palavra`.

## 2. Rotas da API

| Método | Rota                          | Corpo                  | Sucesso              | Erros          |
|--------|-------------------------------|------------------------|----------------------|----------------|
| POST   | `/api/partidas`               | `{ "jogador": "ana" }` | 201 + EstadoPartida  | 400            |
| GET    | `/api/partidas/:id`           | —                      | 200 + EstadoPartida  | 400, 404       |
| POST   | `/api/partidas/:id/palpites`  | `{ "letra": "a" }`     | 200 + EstadoPartida  | 400, 404, 409  |
| GET    | `/api/ranking`                | —                      | 200 + ItemRanking[]  | —              |
| POST   | `/api/partidas/:id/dica`      | —                      | 200 + EstadoPartida  | 400, 404, 409 (bônus) |

Todo erro responde `{ "erro": "mensagem" }`.

## 3. Tipos TypeScript principais

```ts
type StatusPartida = 'em_andamento' | 'vitoria' | 'derrota';

interface EstadoPartida {
  id: number; jogador: string; categoria: string;
  mascara: string; letrasTentadas: string[];
  vidasRestantes: number; status: StatusPartida;
  pontos: number; palavra: string | null; dica: string | null;
}

interface ItemRanking { jogador: string; pontos: number; palavra: string; finalizadaEm: string; }

// usado só pelas regras (src/game/regras.ts)
interface EstadoJogo { palavra: string; letrasTentadas: string[]; erros: number; status: StatusPartida; }
```

## 4. Camadas do back-end

```
routes  →  controllers  →  services  →  repositories  →  Prisma Client  →  SQLite
                              ↓
                       game/regras.ts (funções puras)
```

- **routes**: só registram as rotas no Fastify (plugin).
- **controllers**: validam a entrada com Zod e chamam o service.
- **services**: orquestram — buscam no banco, aplicam as regras, salvam, montam a resposta.
- **repositories**: única camada que conversa com o Prisma.
- **game/regras.ts**: RN01–RN08 sem banco nem HTTP.

## 5. Ordem de trabalho

1. Setup do back-end (TypeScript, Fastify, Prisma 6.19.3).
2. `schema.prisma` → `prisma migrate dev --name init` → seed com 30+ palavras.
3. Funções puras em `src/game/regras.ts`: `gerarMascara`, `aplicarPalpite`, `calcularPontos`.
4. **Checkpoint 1**.
5. Repositories → services → controllers → routes; Zod; `setErrorHandler`.
6. Testar cada rota com curl/Thunder Client.
7. Testes com Vitest (regras + `app.inject`).
8. Front: Vite + React + TS, proxy, cliente da API, tela inicial e tela de jogo.
9. **Checkpoint 2**.
10. Tela de fim, ranking, carregamento e erros, componentes, CSS.
11. Bônus: teclado físico, forca em SVG, dica paga, níveis.
12. Documentação (README, api, decisões, diário).
13. **Checkpoint 3**.
