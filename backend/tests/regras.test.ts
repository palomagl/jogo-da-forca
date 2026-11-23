import { describe, expect, it } from 'vitest';
import { ErroApp } from '../src/errors';
import {
  aplicarDica,
  aplicarPalpite,
  calcularPontos,
  classificarDificuldade,
  contarLetrasDistintas,
  gerarMascara,
  normalizarLetra,
  pontuarPartida,
  VIDAS_INICIAIS,
  type EstadoJogo,
} from '../src/game/regras';

/** Partida nova de PROMISE, com campos sobrescrevíveis. */
function partida(dados: Partial<EstadoJogo> = {}): EstadoJogo {
  return { palavra: 'PROMISE', letrasTentadas: [], erros: 0, status: 'em_andamento', ...dados };
}

/** Executa a função e devolve o ErroApp lançado (falha se não lançar). */
function capturarErro(fn: () => unknown): ErroApp {
  try {
    fn();
  } catch (erro) {
    if (erro instanceof ErroApp) return erro;
    throw erro;
  }
  throw new Error('Era esperado um ErroApp');
}

describe('gerarMascara', () => {
  it('esconde todas as letras quando nada foi tentado', () => {
    expect(gerarMascara('PROMISE', [])).toBe('_______');
  });

  it('mostra só as letras já tentadas, em todas as posições', () => {
    expect(gerarMascara('PROMISE', ['P', 'E'])).toBe('P_____E');
    expect(gerarMascara('CALLBACK', ['L', 'C'])).toBe('C_LL__C_');
  });
});

describe('normalizarLetra (RN02)', () => {
  it('converte uma letra minúscula para maiúscula', () => {
    expect(normalizarLetra('a')).toBe('A');
    expect(normalizarLetra('Z')).toBe('Z');
  });

  it.each(['ab', '1', '', 'ç', ' '])('recusa %j', (entrada) => {
    expect(normalizarLetra(entrada)).toBeNull();
  });
});

describe('aplicarPalpite', () => {
  it('começa com 6 vidas (RN01)', () => {
    expect(VIDAS_INICIAIS).toBe(6);
  });

  it('acerto não consome vida e registra a letra', () => {
    const nova = aplicarPalpite(partida(), 'p');
    expect(nova.erros).toBe(0);
    expect(nova.letrasTentadas).toEqual(['P']);
    expect(nova.status).toBe('em_andamento');
  });

  it('erro consome 1 vida (RN01)', () => {
    const nova = aplicarPalpite(partida(), 'A');
    expect(nova.erros).toBe(1);
    expect(nova.letrasTentadas).toEqual(['A']);
  });

  it('não altera a partida recebida (função pura)', () => {
    const original = partida();
    aplicarPalpite(original, 'A');
    expect(original).toEqual(partida());
  });

  it('letra inválida lança erro 400 (RN02)', () => {
    expect(capturarErro(() => aplicarPalpite(partida(), 'ab')).status).toBe(400);
  });

  it('letra repetida lança erro 409 e não consome vida (RN03)', () => {
    const atual = partida({ letrasTentadas: ['A'], erros: 1 });
    const erro = capturarErro(() => aplicarPalpite(atual, 'a'));
    expect(erro.status).toBe(409);
    expect(atual.erros).toBe(1);
  });

  it('partida encerrada não aceita palpites (RN04)', () => {
    expect(capturarErro(() => aplicarPalpite(partida({ status: 'vitoria' }), 'Z')).status).toBe(409);
    expect(capturarErro(() => aplicarPalpite(partida({ status: 'derrota' }), 'Z')).status).toBe(409);
  });

  it('vitória quando a última letra que faltava é revelada (RN05)', () => {
    const quase = partida({ letrasTentadas: ['P', 'R', 'O', 'M', 'I', 'S'] });
    expect(aplicarPalpite(quase, 'E').status).toBe('vitoria');
  });

  it('derrota quando o sexto erro zera as vidas (RN05)', () => {
    const quase = partida({ letrasTentadas: ['A', 'B', 'C', 'D', 'F'], erros: 5 });
    const nova = aplicarPalpite(quase, 'G');
    expect(nova.erros).toBe(6);
    expect(nova.status).toBe('derrota');
  });
});

describe('pontuação (RN06)', () => {
  it('conta letras distintas', () => {
    expect(contarLetrasDistintas('PROMISE')).toBe(7);
    expect(contarLetrasDistintas('CALLBACK')).toBe(5);
  });

  it('exemplo do enunciado: PROMISE com 4 vidas vale 75 pontos', () => {
    expect(calcularPontos('PROMISE', 4)).toBe(75);
  });

  it('vitória pontua e derrota vale 0', () => {
    expect(pontuarPartida(partida({ status: 'vitoria', erros: 2 }))).toBe(75);
    expect(pontuarPartida(partida({ status: 'derrota', erros: 6 }))).toBe(0);
    expect(pontuarPartida(partida())).toBe(0);
  });
});

describe('bônus', () => {
  it('dica custa 1 vida e só pode ser usada uma vez', () => {
    expect(aplicarDica(partida(), false).erros).toBe(1);
    expect(capturarErro(() => aplicarDica(partida(), true)).status).toBe(409);
  });

  it('dica não é vendida com apenas 1 vida', () => {
    expect(capturarErro(() => aplicarDica(partida({ erros: 5 }), false)).status).toBe(409);
  });

  it('classifica a dificuldade pelo tamanho da palavra', () => {
    expect(classificarDificuldade('ESTADO')).toBe('facil'); // 6 letras
    expect(classificarDificuldade('PROMISE')).toBe('medio'); // 7 letras
    expect(classificarDificuldade('INTERFACE')).toBe('medio'); // 9 letras
    expect(classificarDificuldade('COMPONENTE')).toBe('dificil'); // 10 letras
  });
});
