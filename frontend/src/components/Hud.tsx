import { useState } from 'react';
import { estiloDaCategoria, formatarTempo } from '../lib/jogo';
import { alternarSom, somLigado } from '../lib/som';
import { Avatar } from './Avatar';
import { Vidas } from './Vidas';

type HudProps = {
  jogador: string;
  categoria: string;
  vidasRestantes: number;
  totalVidas: number;
  segundos: number;
  carregando: boolean;
};

/** Barra do topo da partida: jogador, categoria, vidas, bônus de vidas, tempo e som. */
export function Hud({ jogador, categoria, vidasRestantes, totalVidas, segundos, carregando }: HudProps) {
  const [som, setSom] = useState(somLigado);
  const selo = estiloDaCategoria(categoria);

  return (
    <header className="hud">
      <div className="hud-jogador">
        <Avatar nome={jogador} />
        <span className="hud-nome">{jogador}</span>
      </div>

      <div className="hud-categoria">
        <span className="selo" style={{ background: selo.fundo, color: selo.texto }} aria-hidden="true">
          {selo.sigla}
        </span>
        <span>
          <small>Categoria</small>
          <strong>{categoria}</strong>
        </span>
      </div>

      <Vidas restantes={vidasRestantes} total={totalVidas} />

      <div className="hud-numeros">
        <span className="hud-numero" title="Cada vida restante vale 10 pontos na vitória">
          <small>Bônus de vidas</small>
          <strong>+{vidasRestantes * 10}</strong>
        </span>
        <span className="hud-numero">
          <small>Tempo</small>
          <strong>{formatarTempo(segundos)}</strong>
        </span>
      </div>

      <div className="hud-acoes">
        {carregando && <span className="girando" aria-label="Enviando para o servidor" role="status" />}
        <button
          type="button"
          className="botao-icone"
          onClick={() => setSom(alternarSom())}
          aria-label={som ? 'Desligar som' : 'Ligar som'}
          aria-pressed={som}
        >
          {som ? '🔊' : '🔇'}
        </button>
      </div>
    </header>
  );
}
