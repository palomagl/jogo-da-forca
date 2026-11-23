import type { Dificuldade, EstadoPartida, ItemRanking } from '../types';

/** Erro vindo da API (ou da falta dela). `status` é null quando nem houve resposta. */
export class ErroApi extends Error {
  readonly status: number | null;

  constructor(mensagem: string, status: number | null) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

const SERVIDOR_FORA_DO_AR =
  'Servidor fora do ar. Confira se o back-end está rodando (npm run dev na pasta backend).';

/** Lê `{ erro: "..." }` de um corpo desconhecido (unknown), com checagem de tipo. */
function lerCampoErro(corpo: unknown): string | null {
  if (typeof corpo === 'object' && corpo !== null && 'erro' in corpo && typeof corpo.erro === 'string') {
    return corpo.erro;
  }
  return null;
}

async function requisitar<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    // fetch só lança quando não consegue nem conectar
    throw new ErroApi(SERVIDOR_FORA_DO_AR, null);
  }

  // se o back-end cair, o proxy do Vite responde 500 sem corpo JSON
  const corpo: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const mensagem = lerCampoErro(corpo) ?? (res.status >= 500 ? SERVIDOR_FORA_DO_AR : `Erro ${res.status}`);
    throw new ErroApi(mensagem, res.status);
  }
  return corpo as T;
}

/** POST com JSON. Sem corpo, não envia Content-Type (o Fastify recusaria JSON vazio). */
function enviar<T>(url: string, corpo?: object): Promise<T> {
  if (corpo === undefined) return requisitar<T>(url, { method: 'POST' });
  return requisitar<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
}

export const api = {
  novaPartida: (jogador: string, dificuldade: Dificuldade | null) =>
    enviar<EstadoPartida>('/api/partidas', dificuldade ? { jogador, dificuldade } : { jogador }),

  buscarPartida: (id: number) => requisitar<EstadoPartida>(`/api/partidas/${id}`),

  palpitar: (id: number, letra: string) => enviar<EstadoPartida>(`/api/partidas/${id}/palpites`, { letra }),

  comprarDica: (id: number) => enviar<EstadoPartida>(`/api/partidas/${id}/dica`),

  ranking: () => requisitar<ItemRanking[]>('/api/ranking'),
};

/** Texto amigável para qualquer erro capturado num catch. */
export function mensagemDoErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message;
  return 'Algo deu errado. Tente de novo.';
}
