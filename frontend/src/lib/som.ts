// Efeitos sonoros gerados na hora com a Web Audio API: não há arquivos de áudio no projeto.
// Cada efeito é uma sequência curta de notas (frequência em Hz, início e duração em segundos).

export type Efeito = 'acerto' | 'erro' | 'vitoria' | 'derrota' | 'dica' | 'inicio';

type Nota = [frequencia: number, inicio: number, duracao: number];

const EFEITOS: Record<Efeito, { onda: OscillatorType; volume: number; notas: Nota[] }> = {
  acerto: { onda: 'triangle', volume: 0.2, notas: [[660, 0, 0.09], [990, 0.08, 0.16]] },
  erro: { onda: 'sawtooth', volume: 0.08, notas: [[200, 0, 0.12], [130, 0.1, 0.25]] },
  vitoria: { onda: 'triangle', volume: 0.2, notas: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.45]] },
  derrota: { onda: 'triangle', volume: 0.18, notas: [[392, 0, 0.22], [330, 0.22, 0.22], [262, 0.44, 0.22], [196, 0.66, 0.5]] },
  dica: { onda: 'sine', volume: 0.2, notas: [[880, 0, 0.1], [1175, 0.1, 0.1], [1568, 0.2, 0.22]] },
  inicio: { onda: 'square', volume: 0.06, notas: [[392, 0, 0.08], [523, 0.08, 0.08], [784, 0.16, 0.14]] },
};

const CHAVE = 'forca-dev:som';
let contexto: AudioContext | null = null;
let ligado = lerPreferencia();

function lerPreferencia(): boolean {
  try {
    return localStorage.getItem(CHAVE) !== 'desligado';
  } catch {
    return true;
  }
}

export function somLigado(): boolean {
  return ligado;
}

/** Liga/desliga o som e lembra a escolha no navegador. */
export function alternarSom(): boolean {
  ligado = !ligado;
  try {
    localStorage.setItem(CHAVE, ligado ? 'ligado' : 'desligado');
  } catch {
    // sem localStorage: a escolha vale só até recarregar a página
  }
  return ligado;
}

export function tocar(efeito: Efeito): void {
  if (!ligado) return;
  try {
    const audio = (contexto ??= new AudioContext());
    if (audio.state === 'suspended') void audio.resume();

    const { onda, volume, notas } = EFEITOS[efeito];
    const agora = audio.currentTime;

    for (const [frequencia, inicio, duracao] of notas) {
      const oscilador = audio.createOscillator();
      const ganho = audio.createGain();
      oscilador.type = onda;
      oscilador.frequency.value = frequencia;
      // envelope: sobe rápido e some suave, para não "estalar"
      ganho.gain.setValueAtTime(0.0001, agora + inicio);
      ganho.gain.exponentialRampToValueAtTime(volume, agora + inicio + 0.015);
      ganho.gain.exponentialRampToValueAtTime(0.0001, agora + inicio + duracao);
      oscilador.connect(ganho).connect(audio.destination);
      oscilador.start(agora + inicio);
      oscilador.stop(agora + inicio + duracao + 0.05);
    }
  } catch {
    // navegador sem áudio: o jogo continua normalmente, só sem som
  }
}
