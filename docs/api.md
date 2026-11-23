# API do Forca Dev

Base: `http://localhost:3333/api`. Todas as respostas são JSON.

Todo erro responde no formato:

```json
{ "erro": "mensagem legível" }
```

Erros de validação (Zod) trazem também `detalhes`, com o campo e a mensagem de cada problema:

```json
{
  "erro": "O apelido precisa ter pelo menos 3 caracteres",
  "detalhes": [{ "campo": "jogador", "mensagem": "O apelido precisa ter pelo menos 3 caracteres" }]
}
```

## Tipos devolvidos

```ts
type StatusPartida = 'em_andamento' | 'vitoria' | 'derrota';

interface EstadoPartida {
  id: number;
  jogador: string;
  categoria: string;
  mascara: string;          // ex.: "PR_M_SE"
  letrasTentadas: string[]; // ex.: ["E", "P", "R", "S", "M", "A"]
  vidasRestantes: number;   // 0 a 6
  status: StatusPartida;
  pontos: number;           // 0 enquanto não houver vitória
  palavra: string | null;   // null enquanto status === 'em_andamento' (RN07)
  dica: string | null;      // bônus: null até o jogador comprar a dica
}

interface ItemRanking {
  jogador: string;
  pontos: number;
  palavra: string;
  finalizadaEm: string;     // data ISO
}
```

---

## `POST /api/partidas`: criar partida

Sorteia uma palavra do banco e cria a partida com 6 vidas.

**Corpo**

```json
{ "jogador": "ana" }
```

| Campo         | Tipo   | Obrigatório | Regra |
|---------------|--------|-------------|-------|
| `jogador`     | string | sim | 3 a 20 caracteres (espaços nas pontas são removidos) |
| `dificuldade` | string | não | bônus: `facil` (até 6 letras), `medio` (7 a 9) ou `dificil` (10+) |

**Sucesso: `201 Created`**

```json
{
  "id": 7,
  "jogador": "ana",
  "categoria": "JavaScript",
  "mascara": "_______",
  "letrasTentadas": [],
  "vidasRestantes": 6,
  "status": "em_andamento",
  "pontos": 0,
  "palavra": null,
  "dica": null
}
```

**Erros**

| Status | Quando | Exemplo de `erro` |
|--------|--------|-------------------|
| 400 | apelido ausente, menor que 3 ou maior que 20 caracteres | `"O apelido precisa ter pelo menos 3 caracteres"` |
| 400 | dificuldade diferente de `facil`, `medio` e `dificil` | `"A dificuldade deve ser facil, medio ou dificil"` |
| 400 | corpo ausente ou JSON malformado | `"Envie um JSON com o campo jogador"` |
| 404 | não há palavra cadastrada para a dificuldade pedida | `"Nenhuma palavra cadastrada para a dificuldade \"dificil\""` |
| 500 | banco sem nenhuma palavra (seed não foi rodado) | `"Nenhuma palavra cadastrada. Rode \"npm run seed\" no back-end."` |

---

## `GET /api/partidas/:id`: consultar partida

Devolve o estado atual (o front usa para retomar a partida depois de recarregar a página).

**Sucesso: `200 OK`**: `EstadoPartida` (mesmo formato acima).

**Erros**

| Status | Quando | Exemplo de `erro` |
|--------|--------|-------------------|
| 400 | `:id` não é um número inteiro positivo (ex.: `/api/partidas/abc`) | `"O id da partida precisa ser um número"` |
| 404 | não existe partida com esse id | `"Partida não encontrada"` |

---

## `POST /api/partidas/:id/palpites`: chutar uma letra

**Corpo**

```json
{ "letra": "a" }
```

`letra` precisa ser **exatamente uma letra de A a Z**; o servidor converte para maiúscula (RN02).

**Sucesso: `200 OK`**

Partida continua (letra errada: perdeu 1 vida):

```json
{
  "id": 7, "jogador": "ana", "categoria": "JavaScript",
  "mascara": "PR_M_SE",
  "letrasTentadas": ["E", "P", "R", "S", "M", "A"],
  "vidasRestantes": 5, "status": "em_andamento", "pontos": 0,
  "palavra": null, "dica": null
}
```

Vitória (a palavra é revelada e os pontos calculados: 5 × 10 + 7 × 5 = 85):

```json
{
  "id": 7, "jogador": "ana", "categoria": "JavaScript",
  "mascara": "PROMISE",
  "letrasTentadas": ["E", "P", "R", "S", "M", "A", "O", "I"],
  "vidasRestantes": 5, "status": "vitoria", "pontos": 85,
  "palavra": "PROMISE", "dica": null
}
```

Derrota (`vidasRestantes` chega a 0; pontos = 0; a palavra é revelada):

```json
{
  "id": 8, "jogador": "ana", "categoria": "React",
  "mascara": "_S___O",
  "letrasTentadas": ["S", "O", "B", "C", "F", "G", "H", "I"],
  "vidasRestantes": 0, "status": "derrota", "pontos": 0,
  "palavra": "ESTADO", "dica": null
}
```

**Erros**

| Status | Quando | Exemplo de `erro` |
|--------|--------|-------------------|
| 400 | `letra` não é uma única letra A–Z: `"ab"`, `"1"`, `""`, `"ç"` (RN02) | `"Envie uma única letra de A a Z"` |
| 400 | campo `letra` ausente | `"Informe a letra do palpite"` |
| 400 | `:id` não é um número inteiro positivo | `"O id da partida precisa ser um número"` |
| 404 | partida não existe | `"Partida não encontrada"` |
| 409 | letra já tentada; **não consome vida** (RN03) | `"A letra A já foi tentada"` |
| 409 | partida já terminou em vitória ou derrota (RN04) | `"Esta partida já terminou e não aceita mais palpites"` |

---

## `GET /api/ranking`: top 10

As 10 vitórias com mais pontos. No empate, quem terminou primeiro fica à frente (RN08). Derrotas não entram.

**Sucesso: `200 OK`**

```json
[
  { "jogador": "ana", "pontos": 95, "palavra": "PROMISE", "finalizadaEm": "2026-11-12T22:10:31.512Z" },
  { "jogador": "beto", "pontos": 95, "palavra": "CLOSURE", "finalizadaEm": "2026-11-12T22:14:02.004Z" },
  { "jogador": "carla", "pontos": 55, "palavra": "HOOK", "finalizadaEm": "2026-11-12T22:20:45.190Z" }
]
```

Sem vitórias ainda: `[]`.

**Erros:** nenhum esperado.

---

## `POST /api/partidas/:id/dica`: comprar dica (bônus)

Revela a dica da palavra e custa **1 vida**. Não tem corpo (envie sem `Content-Type: application/json`, ou com o corpo `{}`).

**Sucesso: `200 OK`**

```json
{
  "id": 7, "jogador": "ana", "categoria": "JavaScript",
  "mascara": "P_____E",
  "letrasTentadas": ["P", "E"],
  "vidasRestantes": 5, "status": "em_andamento", "pontos": 0,
  "palavra": null,
  "dica": "Objeto que representa um valor que vai chegar no futuro"
}
```

**Erros**

| Status | Quando | Exemplo de `erro` |
|--------|--------|-------------------|
| 400 | `:id` não é um número inteiro positivo | `"O id da partida precisa ser um número"` |
| 404 | partida não existe | `"Partida não encontrada"` |
| 409 | a dica desta partida já foi comprada | `"A dica desta partida já foi revelada"` |
| 409 | resta só 1 vida (a dica nunca causa derrota) | `"Você precisa de pelo menos 2 vidas para comprar a dica"` |
| 409 | a partida já terminou | `"Esta partida já terminou"` |
| 409 | a palavra não tem dica cadastrada | `"Esta palavra não tem dica cadastrada"` |

---

## Erros gerais

| Status | Quando | `erro` |
|--------|--------|--------|
| 404 | rota inexistente (ex.: `GET /api/nao-existe`) | `"Rota não encontrada"` |
| 400 | `Content-Type: application/json` com corpo vazio ou JSON malformado | `"Requisição inválida: …"` (mensagem do Fastify) |
| 500 | erro inesperado no servidor | `"Erro interno no servidor"` |

## Testando com curl

```bash
curl -X POST http://localhost:3333/api/partidas -H "Content-Type: application/json" -d "{\"jogador\":\"ana\"}"
curl -X POST http://localhost:3333/api/partidas/1/palpites -H "Content-Type: application/json" -d "{\"letra\":\"e\"}"
curl http://localhost:3333/api/partidas/1
curl http://localhost:3333/api/ranking
curl -X POST http://localhost:3333/api/partidas/1/dica
```
