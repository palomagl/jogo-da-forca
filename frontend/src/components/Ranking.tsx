import type { ItemRanking } from '../types';
import { Avatar } from './Avatar';

type RankingProps = {
  itens: ItemRanking[];
  carregando: boolean;
  erro: string | null;
  /** Linha a destacar (ex.: a vitória que acabou de acontecer). */
  destaque?: Pick<ItemRanking, 'jogador' | 'palavra' | 'pontos'>;
};

const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const MEDALHAS = ['ouro', 'prata', 'bronze'];

function ehDestaque(item: ItemRanking, destaque: RankingProps['destaque']): boolean {
  return (
    destaque !== undefined &&
    item.jogador === destaque.jogador &&
    item.palavra === destaque.palavra &&
    item.pontos === destaque.pontos
  );
}

/** Top 10 vitórias (RN08), em tabela, com medalhas para os 3 primeiros. */
export function Ranking({ itens, carregando, erro, destaque }: RankingProps) {
  return (
    <section className="painel ranking" aria-labelledby="titulo-ranking">
      <h2 id="titulo-ranking" className="painel-titulo">
        <span aria-hidden="true">🏆</span> Ranking
      </h2>

      {carregando && (
        <p className="ranking-mensagem">
          <span className="girando" aria-hidden="true" /> Carregando ranking…
        </p>
      )}
      {!carregando && erro && <p className="ranking-mensagem ranking-mensagem--erro">Não deu para carregar o ranking: {erro}</p>}
      {!carregando && !erro && itens.length === 0 && (
        <p className="ranking-mensagem">Ninguém venceu ainda. A primeira vitória fica com o ouro!</p>
      )}

      {!carregando && !erro && itens.length > 0 && (
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Jogador</th>
              <th scope="col">Palavra</th>
              <th scope="col" className="numero">Pontos</th>
              <th scope="col" className="data">Quando</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, i) => (
              <tr key={`${item.jogador}-${item.finalizadaEm}`} className={ehDestaque(item, destaque) ? 'ranking-destaque' : undefined}>
                <td>
                  <span className={i < 3 ? `posicao posicao--${MEDALHAS[i]}` : 'posicao'}>{i + 1}</span>
                </td>
                <td>
                  <span className="ranking-jogador">
                    <Avatar nome={item.jogador} tamanho="pequeno" />
                    {item.jogador}
                  </span>
                </td>
                <td className="ranking-palavra">{item.palavra}</td>
                <td className="numero">{item.pontos}</td>
                <td className="data">{formatoData.format(new Date(item.finalizadaEm))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
