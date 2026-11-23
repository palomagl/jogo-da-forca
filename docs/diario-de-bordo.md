# Diário de bordo — Forca Dev

> ✏️ = trecho que só você pode escrever. Substitua antes de entregar: o diário vale nota por ser **honesto**.

## Aula 1 — Teoria e fundação do back-end

**O que fiz**
- Escrevi o planejamento (`docs/planejamento.md`): tabelas, rotas, tipos e ordem de trabalho.
- Configurei o back-end: TypeScript (`strict`), Fastify, Zod, Prisma 6.19.3 com SQLite.
- Modelei `palavras` e `partidas` no `schema.prisma` e criei a migration inicial.
- Seed com 34 palavras em 4 categorias (JavaScript, TypeScript, React, Banco de Dados), cada uma com dica.
- Funções puras das regras em `src/game/regras.ts` (`gerarMascara`, `aplicarPalpite`, `calcularPontos`, …) com TSDoc.

**Onde travei e como resolvi**
- ✏️ Ex.: "o `npx prisma migrate dev` reclamou que faltava o `.env`; criei a partir do `.env.example`".

**O que falta**
- Rotas da API, validação com Zod, `setErrorHandler`, testes e todo o front-end.

**O que consultei (inclusive uso de IA)**
- Enunciado e colinha do professor; documentação do Prisma ORM e do Fastify.
- IA: usei o Claude (assistente da Anthropic) para gerar a estrutura e o código desta etapa a partir do enunciado e da colinha.
- ✏️ Descreva o que você conferiu/entendeu do código gerado.

## Aula 2 — API completa, testes e início da interface

**O que fiz**
- Camadas do back-end: `routes → controllers → services → repositories`, com as regras chamadas pelo service.
- Validação com Zod (`novaPartidaSchema`, `palpiteSchema`, `idSchema`) e `setErrorHandler` central devolvendo sempre `{ erro }`.
- As 4 rotas do contrato e a rota bônus de dica.
- 38 testes no Vitest: regras puras e rotas com `app.inject`, usando o banco separado `test.db`.
- Front com Vite + React + TS strict, proxy `/api`, cliente tipado, tela inicial e tela de jogo.

**Onde travei e como resolvi**
- Um teste de `gerarMascara` falhou porque eu escrevi a máscara esperada de CALLBACK errada (`C_LL___C` em vez de `C_LL__C_`); o código estava certo, corrigi o teste.
- POST sem corpo com `Content-Type: application/json` dá 400 no Fastify; no cliente do front, o header só vai quando há corpo (rota da dica).
- ✏️ Anote aqui o que aconteceu quando você rodou `npm install`, `npm test` e as rotas no Thunder Client/curl.

**O que falta**
- Tela de fim, ranking, estados de carregamento/erro, estilo e documentação.

**O que consultei (inclusive uso de IA)**
- Colinha do professor (Fastify, Zod, `app.inject`, proxy do Vite); documentação do Fastify e do Zod.
- IA: o Claude (Anthropic) gerou o código desta etapa e os testes.
- ✏️ Descreva o que você testou por conta própria e o que entendeu de cada camada.

## Aula 3 — Interface final, documentação e defesa

**O que fiz**
- Tela de fim (vitória/derrota, palavra revelada com as letras que faltaram em vermelho, pontos com a conta, Jogar de novo).
- Ranking top 10 em tabela na tela inicial e na de fim, destacando quem acabou de jogar.
- Carregamento (botões travados e "Enviando para o servidor…") e mensagens de erro da API, inclusive "Servidor fora do ar".
- Componentes com props tipadas: `Cenario`, `Mascara`, `Teclado`, `Hud`, `Vidas`, `LetrasTentadas`, `PowerUpDica`, `Avatar`, `Estrelas`, `Confete`, `Ranking`, `Aviso`, `Logo`.
- Primeira versão com visual de caderno quadriculado; depois refiz o visual para parecer um jogo de verdade: cenário noturno animado em SVG com o boneco mudando de humor, palavra em peças que viram, teclado com relevo, HUD com avatar, cronômetro e combo, sons com a Web Audio API, estrelas, contagem de pontos e confete no fim.
- Bônus: teclado físico, forca em SVG, dica paga e níveis de dificuldade.
- README, `docs/api.md`, `docs/decisoes.md` e este diário.

**Onde travei e como resolvi**
- Palavras longas (ex.: DESESTRUTURACAO, 15 letras) quebravam a máscara em duas linhas; usei container queries (`cqw`) para as peças encolherem conforme a largura da coluna e, no celular, deixei quebrar em duas linhas com um tamanho mínimo.
- O console do React avisou "two children with the same key": o "Boa!" e o selo de combo usavam números como `key` no mesmo lugar (ex.: 2 e 2). Resolvi com prefixos (`feedback-2`, `combo-2`).
- ✏️ Anote o que aconteceu ao rodar o projeto na sua máquina seguindo o README.

**O que falta**
- ✏️ Ex.: "nada obrigatório; se sobrar tempo, adicionar mais palavras ao seed".

**O que consultei (inclusive uso de IA)**
- Documentação do React (useState/useEffect) e do Vite.
- IA: o Claude (Anthropic) gerou o front-end e a documentação, e testou o jogo de ponta a ponta num navegador automatizado.
- ✏️ Descreva o que você revisou e o que treinou para a defesa oral.
