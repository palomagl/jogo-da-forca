import { corDoJogador, inicialDoJogador } from '../lib/jogo';

type AvatarProps = {
  nome: string;
  tamanho?: 'pequeno' | 'medio' | 'grande';
};

/** Bolinha colorida com a inicial do apelido (a cor vem do próprio nome). */
export function Avatar({ nome, tamanho = 'medio' }: AvatarProps) {
  return (
    <span className={`avatar avatar--${tamanho}`} style={{ background: corDoJogador(nome) }} aria-hidden="true">
      {inicialDoJogador(nome)}
    </span>
  );
}
