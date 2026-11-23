import { useEffect, useState } from 'react';
import { api, mensagemDoErro } from './api/cliente';
import { Aviso } from './components/Aviso';
import { Logo } from './components/Logo';
import { TelaFim } from './pages/TelaFim';
import { TelaInicial } from './pages/TelaInicial';
import { TelaJogo } from './pages/TelaJogo';
import type { Dificuldade, EstadoPartida } from './types';

const CHAVE_PARTIDA = 'forca-dev:partida';

/** Guarda o id da partida para retomar se a página for recarregada. */
function lembrarPartida(id: number | null) {
  try {
    if (id === null) localStorage.removeItem(CHAVE_PARTIDA);
    else localStorage.setItem(CHAVE_PARTIDA, String(id));
  } catch {
    // navegador sem localStorage: só não retoma a partida
  }
}

function partidaLembrada(): number | null {
  try {
    const id = Number(localStorage.getItem(CHAVE_PARTIDA));
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [partida, setPartida] = useState<EstadoPartida | null>(null);
  const [apelido, setApelido] = useState('');
  const [dificuldade, setDificuldade] = useState<Dificuldade | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Ao abrir a página, retoma a partida em andamento (o estado verdadeiro está no servidor)
  useEffect(() => {
    const id = partidaLembrada();
    if (id === null) return;
    let ativo = true;
    api
      .buscarPartida(id)
      .then((salva) => {
        if (!ativo) return;
        if (salva.status === 'em_andamento') {
          setPartida(salva);
          setApelido(salva.jogador);
        } else {
          lembrarPartida(null);
        }
      })
      .catch(() => lembrarPartida(null));
    return () => {
      ativo = false;
    };
  }, []);

  /** Chama a API, mostra o carregamento e exibe a mensagem de erro, se houver. */
  async function executar(acao: () => Promise<EstadoPartida>) {
    if (carregando) return;
    setCarregando(true);
    setErro(null);
    try {
      const nova = await acao(); // o servidor devolve o estado novo; o front só exibe
      setPartida(nova);
      lembrarPartida(nova.status === 'em_andamento' ? nova.id : null);
    } catch (e) {
      setErro(mensagemDoErro(e));
    } finally {
      setCarregando(false);
    }
  }

  function jogar(jogador: string, nivel: Dificuldade | null) {
    setApelido(jogador);
    setDificuldade(nivel);
    void executar(() => api.novaPartida(jogador, nivel));
  }

  function palpitar(letra: string) {
    if (!partida || partida.status !== 'em_andamento') return;
    const id = partida.id;
    void executar(() => api.palpitar(id, letra));
  }

  function comprarDica() {
    if (!partida) return;
    const id = partida.id;
    void executar(() => api.comprarDica(id));
  }

  /** Volta para a tela inicial (a partida em andamento fica salva no servidor, só não é retomada). */
  function trocarApelido() {
    setPartida(null);
    setErro(null);
    lembrarPartida(null);
  }

  // a "key" muda a cada tela (e a cada partida nova), o que reinicia a animação de entrada
  const chaveDaTela = partida === null ? 'inicio' : `${partida.status === 'em_andamento' ? 'jogo' : 'fim'}-${partida.id}`;

  return (
    <main className="app">
      {partida !== null && (
        <div className="topo">
          <Logo tamanho="pequeno" />
          {partida.status === 'em_andamento' && (
            <button type="button" className="botao-texto" onClick={trocarApelido}>
              Sair da partida
            </button>
          )}
        </div>
      )}

      {erro && <Aviso mensagem={erro} onFechar={() => setErro(null)} />}

      <div key={chaveDaTela} className="tela">
        {partida === null && (
          <TelaInicial
            apelidoInicial={apelido}
            dificuldadeInicial={dificuldade}
            carregando={carregando}
            onJogar={jogar}
          />
        )}

        {partida?.status === 'em_andamento' && (
          <TelaJogo partida={partida} carregando={carregando} onLetra={palpitar} onDica={comprarDica} />
        )}

        {partida && partida.status !== 'em_andamento' && (
          <TelaFim
            partida={partida}
            carregando={carregando}
            onJogarDeNovo={() => jogar(partida.jogador, dificuldade)}
            onTrocarApelido={trocarApelido}
          />
        )}
      </div>
    </main>
  );
}
