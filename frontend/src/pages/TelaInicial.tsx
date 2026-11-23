import { useState, type FormEvent } from 'react';
import { Avatar } from '../components/Avatar';
import { Logo } from '../components/Logo';
import { Ranking } from '../components/Ranking';
import { useRanking } from '../hooks/useRanking';
import { tocar } from '../lib/som';
import type { Dificuldade } from '../types';

type TelaInicialProps = {
  apelidoInicial: string;
  dificuldadeInicial: Dificuldade | null;
  carregando: boolean;
  onJogar: (jogador: string, dificuldade: Dificuldade | null) => void;
};

const APELIDO_MIN = 3;
const APELIDO_MAX = 20;

const NIVEIS: { valor: Dificuldade | null; rotulo: string; detalhe: string; icone: string }[] = [
  { valor: null, rotulo: 'Surpresa', detalhe: 'qualquer palavra', icone: '🎲' },
  { valor: 'facil', rotulo: 'Fácil', detalhe: 'até 6 letras', icone: '★' },
  { valor: 'medio', rotulo: 'Médio', detalhe: '7 a 9 letras', icone: '★★' },
  { valor: 'dificil', rotulo: 'Difícil', detalhe: '10 letras ou mais', icone: '★★★' },
];

function plural(n: number, palavra: string) {
  return `${n} ${palavra}${n === 1 ? '' : 's'}`;
}

/** RF01: apelido de 3 a 20 caracteres (sem contar espaços nas pontas). */
function ajudaDoApelido(tamanho: number): string {
  if (tamanho === 0) return `Use de ${APELIDO_MIN} a ${APELIDO_MAX} caracteres.`;
  if (tamanho < APELIDO_MIN) return `Falta ${plural(APELIDO_MIN - tamanho, 'caractere')}.`;
  if (tamanho > APELIDO_MAX) return `Passou ${plural(tamanho - APELIDO_MAX, 'caractere')} do limite de ${APELIDO_MAX}.`;
  return 'Apelido pronto!';
}

export function TelaInicial({ apelidoInicial, dificuldadeInicial, carregando, onJogar }: TelaInicialProps) {
  const [apelido, setApelido] = useState(apelidoInicial);
  const [dificuldade, setDificuldade] = useState<Dificuldade | null>(dificuldadeInicial);
  const ranking = useRanking();

  const tamanho = apelido.trim().length;
  const valido = tamanho >= APELIDO_MIN && tamanho <= APELIDO_MAX;

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!valido || carregando) return;
    tocar('inicio');
    onJogar(apelido.trim(), dificuldade);
  }

  return (
    <div className="inicio">
      <Logo />
      <p className="slogan">Adivinhe o termo de programação antes que o dev fique na forca.</p>

      <div className="inicio-grade">
        <div className="inicio-coluna">
          <form className="painel novo-jogo" onSubmit={aoEnviar} noValidate>
            <h2 className="painel-titulo">Novo jogo</h2>

            <label className="campo-rotulo" htmlFor="apelido">
              Seu apelido
            </label>
            <div className="campo-apelido">
              <Avatar nome={apelido || '?'} tamanho="grande" />
              <input
                id="apelido"
                className="campo"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="ex.: ana_dev"
                autoComplete="nickname"
                autoFocus
                aria-describedby="apelido-ajuda"
                aria-invalid={tamanho > 0 && !valido}
              />
            </div>
            <p id="apelido-ajuda" className={tamanho > 0 && !valido ? 'ajuda ajuda--erro' : valido ? 'ajuda ajuda--ok' : 'ajuda'}>
              {ajudaDoApelido(tamanho)}
            </p>

            <fieldset className="niveis">
              <legend className="campo-rotulo">Dificuldade</legend>
              {NIVEIS.map((nivel) => (
                <label key={nivel.valor ?? 'surpresa'} className="nivel">
                  <input
                    type="radio"
                    name="dificuldade"
                    checked={dificuldade === nivel.valor}
                    onChange={() => setDificuldade(nivel.valor)}
                  />
                  <span className="nivel-cartao">
                    <span className="nivel-icone" aria-hidden="true">
                      {nivel.icone}
                    </span>
                    <strong>{nivel.rotulo}</strong>
                    <small>{nivel.detalhe}</small>
                  </span>
                </label>
              ))}
            </fieldset>

            <button type="submit" className="botao botao--grande" disabled={!valido || carregando}>
              {carregando ? (
                <>
                  <span className="girando" aria-hidden="true" /> Sorteando palavra…
                </>
              ) : (
                'Jogar'
              )}
            </button>
          </form>

          <section className="painel como-jogar" aria-labelledby="titulo-como-jogar">
            <h2 id="titulo-como-jogar" className="painel-titulo">
              Como jogar
            </h2>
            <ul>
              <li>
                <span className="regra-icone regra-icone--vida" aria-hidden="true">♥</span>
                Você tem 6 vidas. Cada letra errada custa uma.
              </li>
              <li>
                <span className="regra-icone regra-icone--ponto" aria-hidden="true">★</span>
                Vitória vale vidas × 10 + letras diferentes × 5.
              </li>
              <li>
                <span className="regra-icone regra-icone--dica" aria-hidden="true">💡</span>
                Travou? Troque 1 vida por uma dica.
              </li>
              <li>
                <span className="regra-icone regra-icone--tecla" aria-hidden="true">A</span>
                Clique nas letras ou digite no teclado do computador.
              </li>
            </ul>
          </section>
        </div>

        <Ranking itens={ranking.itens} carregando={ranking.carregando} erro={ranking.erro} />
      </div>
    </div>
  );
}
