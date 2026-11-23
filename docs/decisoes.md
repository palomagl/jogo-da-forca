# Decisões técnicas

## Decisão 1: a palavra secreta fica só no servidor

- **Contexto:** o front precisa mostrar o progresso, mas não pode permitir trapaça.
- **Decisão:** a API devolve só a máscara (`PR_M_SE`); `palavra` vem `null` enquanto o status for `em_andamento` (RN07). Quem monta a resposta é `montarEstado()` em `partidas.service.ts`, e todas as regras rodam no servidor (`aplicarPalpite` em `src/game/regras.ts`).
- **Alternativa descartada:** mandar a palavra e esconder no front. Qualquer um veria a resposta na aba Network do DevTools.
- **Consequência:** cada palpite exige uma requisição ao servidor. Em troca, o ranking é confiável: os pontos são calculados no back e o front só exibe o que recebe.

## Decisão 2: regras do jogo em funções puras, separadas do banco e do HTTP

- **Contexto:** as regras RN01–RN06 são o coração do jogo e precisam de testes rápidos e confiáveis.
- **Decisão:** `src/game/regras.ts` recebe um `EstadoJogo` simples (`palavra`, `letrasTentadas`, `erros`, `status`) e devolve um **novo** objeto, sem alterar o recebido. O service só busca a partida, chama a regra e salva o resultado. Erros de regra são `ErroApp` com o status HTTP (409 para letra repetida ou partida encerrada), e o `setErrorHandler` transforma em `{ erro }`.
- **Alternativa descartada:** escrever as regras direto no service ou no handler da rota, misturadas com chamadas ao Prisma.
- **Consequência:** os testes de `regras.test.ts` rodam sem banco e sem servidor. A desvantagem é ter uma conversão a mais (linha do banco → `EstadoJogo`), feita por `paraEstadoJogo()` no service.

## Decisão 3: guardar `erros` e `letrasTentadas` como texto, e calcular o resto

- **Contexto:** o SQLite não tem coluna do tipo lista, e vidas restantes e máscara podem ser derivadas de outros dados.
- **Decisão:** a tabela `partidas` guarda `letras_tentadas` como texto (`"EPRSMA"`) e `erros` como inteiro. `vidasRestantes` (6 − erros) e `mascara` são **calculadas** a cada resposta por `calcularVidasRestantes()` e `gerarMascara()`.
- **Alternativa descartada:** guardar `vidasRestantes` e `mascara` em colunas próprias, ou criar uma tabela `palpites` com uma linha por letra.
- **Consequência:** não há como a máscara salva "desencontrar" das letras tentadas, porque ela nem é salva. Uma tabela de palpites seria mais flexível (horário de cada chute), mas exigiria mais consultas para um ganho que o jogo não usa.

## Decisão 4: status como `String` no Prisma, validado no TypeScript

- **Contexto:** o status só pode ser `em_andamento`, `vitoria` ou `derrota`, mas a coluna no SQLite é texto.
- **Decisão:** o schema usa `status String`, como na colinha do professor, e o service converte o texto do banco para o tipo `StatusPartida` com `paraStatus()`, que lança erro se aparecer um valor desconhecido. Assim o resto do back-end trabalha com o tipo fechado, sem `any` e sem conversão forçada (`as`).
- **Alternativa descartada:** usar um `enum` do Prisma. Preferi seguir o schema da colinha e garantir o tipo no TypeScript, que é onde o resto do código já valida os dados.
- **Consequência:** o banco aceitaria um texto inválido se alguém editasse direto (ex.: no Prisma Studio), mas o erro aparece na hora em que a partida for lida, em vez de virar um bug silencioso.

## Decisão 5: sorteio da palavra em memória (com filtro de dificuldade)

- **Contexto:** o Prisma não tem `ORDER BY RANDOM()`, e o bônus de níveis precisa filtrar palavras pelo **tamanho do texto**, algo que o Prisma não filtra no SQLite.
- **Decisão:** `sortearPalavra()` busca todas as palavras (`listarTodas()`), filtra pela dificuldade com `classificarDificuldade()` (função pura) e sorteia com `Math.random()`.
- **Alternativa descartada:** `count()` + `findFirst({ skip })` (sugestão da colinha), que não consegue filtrar por tamanho; ou guardar uma coluna `tamanho` só para isso.
- **Consequência:** simples e correto para ~30 palavras. Com milhares de palavras, valeria guardar o tamanho numa coluna e voltar ao `count` + `skip`.

## Decisão 6: testes da API com banco separado

- **Contexto:** os testes criam e apagam partidas; rodar no banco do jogo apagaria o ranking de verdade.
- **Decisão:** o `vitest.config.mts` define `DATABASE_URL=file:./test.db`, e `tests/setup-banco.ts` roda `prisma db push` antes dos testes. O `api.test.ts` limpa o banco e cadastra uma só palavra (PROMISE), o que deixa o sorteio previsível e permite testar vitória, pontos e ranking pela API.
- **Alternativa descartada:** testar no `forca.db`, ou criar repositórios falsos (mocks) em memória.
- **Consequência:** os testes exercitam o Prisma e o SQLite de verdade. São um pouco mais lentos que testes com mocks e rodam em sequência (`fileParallelism: false`).

## Decisão 7: proxy do Vite no desenvolvimento (e CORS liberado)

- **Contexto:** o front roda na porta 5173 e a API na 3333; o navegador bloquearia chamadas entre portas diferentes sem CORS.
- **Decisão:** o front chama sempre `/api/...` e o `vite.config.ts` repassa para `http://localhost:3333`. O back também registra `@fastify/cors`, para quem quiser chamar a API direto (ex.: Thunder Client ou outro front).
- **Alternativa descartada:** colocar `http://localhost:3333` fixo no front, o que exigiria CORS e trocar a URL em cada ambiente.
- **Consequência:** o código do front não sabe em que porta está a API. Quando o back cai, o proxy responde 500 sem corpo, e o cliente (`api/cliente.ts`) traduz isso para "Servidor fora do ar".

## Decisão 8: reações de acerto/erro calculadas no front, sem mudar a API

- **Contexto:** para parecer um jogo, cada palpite precisa de uma reação (palco tremendo, "Boa!", combo, som), mas a API só devolve o estado novo da partida, sem dizer se o último chute acertou.
- **Decisão:** o hook `useFeedback` guarda o estado anterior num `useRef` e compara com o novo: se `vidasRestantes` caiu, foi erro; se só cresceu `letrasTentadas`, foi acerto. O combo é calculado por `calcularCombo()` a partir da ordem de `letrasTentadas`. Os sons são gerados com a Web Audio API (`lib/som.ts`), sem arquivos de áudio.
- **Alternativa descartada:** acrescentar um campo `ultimoPalpite: 'acerto' | 'erro'` na resposta da API.
- **Consequência:** o contrato da API continua exatamente o do enunciado, e o front segue sem saber a palavra. O custo é um hook a mais no front, e as reações só existem enquanto a página está aberta (ao recarregar, a partida volta sem animação).
