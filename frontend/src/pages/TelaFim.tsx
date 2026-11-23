import { useEffect, useRef } from 'react';
import { Cenario } from '../components/Cenario';
import { Confete } from '../components/Confete';
import { Estrelas } from '../components/Estrelas';
import { Mascara } from '../components/Mascara';
import { Ranking } from '../components/Ranking';
import { useContagem } from '../hooks/useContagem';
import { useRanking } from '../hooks/useRanking';
import { calcularEstrelas, VIDAS_INICIAIS } from '../lib/jogo';
import { tocar } from '../lib/som';
import type { EstadoPartida } from '../types';

type TelaFimProps = {
  partida: EstadoPartida;
  carregando: boolean;
  onJogarDeNovo: () => void;
  onTrocarApelido: () => void;
};

export function TelaFim({ partida, carregando, onJogarDeNovo, onTrocarApelido }: TelaFimProps) {
  // o ranking é buscado de novo aqui, então já mostra esta partida se ela entrou no top 10
  const ranking = useRanking();
  const venceu = partida.status === 'vitoria';
  const pontosNaTela = useContagem(partida.pontos);
  const letrasDistintas = new Set(partida.palavra ?? '').size;

  // toca o som do resultado uma vez só (o ref sobrevive ao "efeito duplo" do StrictMode)
  const somTocado = useRef(false);
  useEffect(() => {
    if (somTocado.current) return;
    somTocado.current = true;
    tocar(venceu ? 'vitoria' : 'derrota');
  }, [venceu]);

  const posicao = ranking.itens.findIndex(
    (item) => item.jogador === partida.jogador && item.palavra === partida.palavra && item.pontos === partida.pontos,
  );
  const destaque = venceu && partida.palavra ? { jogador: partida.jogador, palavra: partida.palavra, pontos: partida.pontos } : undefined;

  return (
    <div className="fim-tela">
      {venceu && <Confete />}

      <section className={venceu ? 'painel fim fim--vitoria' : 'painel fim fim--derrota'} aria-live="polite">
        <div className="palco fim-palco">
          <Cenario erros={VIDAS_INICIAIS - partida.vidasRestantes} resultado={venceu ? 'vitoria' : 'derrota'} />
        </div>

        <div className="fim-resultado">
          <h2 className="fim-titulo">{venceu ? 'Vitória!' : 'Derrota'}</h2>
          <p className="fim-subtitulo">{venceu ? 'Você salvou o dev!' : 'O dev ficou na forca desta vez.'}</p>
          {venceu && <Estrelas quantidade={calcularEstrelas(partida.vidasRestantes)} />}

          <p className="fim-rotulo">A palavra era</p>
          <Mascara mascara={partida.mascara} palavra={partida.palavra} />

          <div className="fim-placar">
            <strong className="fim-pontos">{pontosNaTela}</strong>
            <span>pontos</span>
          </div>
          <p className="fim-conta">
            {venceu
              ? `${partida.vidasRestantes} vidas × 10 + ${letrasDistintas} letras diferentes × 5`
              : 'Derrota não pontua. As letras em rosa foram as que faltaram.'}
          </p>
          {venceu && !ranking.carregando && !ranking.erro && (
            <p className="fim-posicao">
              {posicao >= 0 ? `🏆 Você entrou no ranking em ${posicao + 1}º lugar!` : 'Faltou pouco para entrar no top 10.'}
            </p>
          )}

          <div className="fim-acoes">
            <button type="button" className="botao botao--grande" onClick={onJogarDeNovo} disabled={carregando} autoFocus>
              {carregando ? 'Sorteando palavra…' : 'Jogar de novo'}
            </button>
            <button type="button" className="botao botao--secundario" onClick={onTrocarApelido} disabled={carregando}>
              Trocar apelido
            </button>
          </div>
        </div>
      </section>

      <Ranking itens={ranking.itens} carregando={ranking.carregando} erro={ranking.erro} destaque={destaque} />
    </div>
  );
}
