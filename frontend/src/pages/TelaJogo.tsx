import { useEffect, useRef } from 'react';
import { Cenario } from '../components/Cenario';
import { Hud } from '../components/Hud';
import { LetrasTentadas } from '../components/LetrasTentadas';
import { Mascara } from '../components/Mascara';
import { PowerUpDica } from '../components/PowerUpDica';
import { Teclado } from '../components/Teclado';
import { useCronometro } from '../hooks/useCronometro';
import { useFeedback } from '../hooks/useFeedback';
import { calcularCombo, prefereMenosMovimento, VIDAS_INICIAIS } from '../lib/jogo';
import type { EstadoPartida } from '../types';

type TelaJogoProps = {
  partida: EstadoPartida;
  carregando: boolean;
  onLetra: (letra: string) => void;
  onDica: () => void;
};

// "tremida" do palco quando o jogador erra
const TREMIDA: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-10px) rotate(-1deg)' },
  { transform: 'translateX(9px) rotate(1deg)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(4px)' },
  { transform: 'translateX(0)' },
];

export function TelaJogo({ partida, carregando, onLetra, onDica }: TelaJogoProps) {
  const segundos = useCronometro(true);
  const feedback = useFeedback(partida);
  const palco = useRef<HTMLDivElement>(null);

  // Bônus: teclado físico — digitar a letra também conta como palpite
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      if (/^[a-z]$/i.test(e.key)) onLetra(e.key.toUpperCase());
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar); // limpeza!
  }, [onLetra]);

  // erro: o palco treme (Web Animations API)
  useEffect(() => {
    if (feedback?.tipo !== 'erro' || prefereMenosMovimento()) return;
    palco.current?.animate(TREMIDA, { duration: 450, easing: 'ease-out' });
  }, [feedback]);

  const erros = VIDAS_INICIAIS - partida.vidasRestantes;
  const combo = calcularCombo(partida.letrasTentadas, partida.mascara);

  return (
    <section className="jogo" aria-busy={carregando}>
      <Hud
        jogador={partida.jogador}
        categoria={partida.categoria}
        vidasRestantes={partida.vidasRestantes}
        totalVidas={VIDAS_INICIAIS}
        segundos={segundos}
        carregando={carregando}
      />

      <div className="jogo-area">
        <div className="palco" ref={palco}>
          <Cenario erros={erros} />
          {feedback && (
            <span key={`feedback-${feedback.chave}`} className={`flutuante flutuante--${feedback.tipo}`} aria-hidden="true">
              {feedback.tipo === 'erro' ? '−1 ♥' : 'Boa!'}
            </span>
          )}
          {combo >= 2 && (
            <span key={`combo-${combo}`} className="combo">
              Combo x{combo}
            </span>
          )}
        </div>

        <div className="painel jogo-palavra">
          <p className="jogo-instrucao">
            Descubra o termo de <strong>{partida.categoria}</strong> com {partida.mascara.length} letras
          </p>
          <Mascara mascara={partida.mascara} />
          <LetrasTentadas tentadas={partida.letrasTentadas} mascara={partida.mascara} />
          <PowerUpDica
            dica={partida.dica}
            vidasRestantes={partida.vidasRestantes}
            carregando={carregando}
            onComprar={onDica}
          />
        </div>
      </div>

      <Teclado tentadas={partida.letrasTentadas} mascara={partida.mascara} desabilitado={carregando} onLetra={onLetra} />

      <p className="status" aria-live="polite">
        {carregando ? 'Enviando para o servidor…' : 'Clique numa letra ou digite no teclado do computador.'}
      </p>
    </section>
  );
}
