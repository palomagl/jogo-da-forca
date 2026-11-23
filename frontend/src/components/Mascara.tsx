type MascaraProps = {
  /** Máscara vinda da API, ex.: "PR_M_SE". */
  mascara: string;
  /** Palavra revelada no fim da partida; as letras que faltavam aparecem em rosa. */
  palavra?: string | null;
};

/** Palavras longas usam peças menores para caber numa linha só. */
function classeDeTamanho(tamanho: number): string {
  if (tamanho <= 8) return 'mascara mascara--curta';
  if (tamanho <= 11) return 'mascara mascara--media';
  return 'mascara mascara--longa';
}

/**
 * Mostra a palavra em peças, com espaço entre as letras: P R _ M _ S E.
 * Quando uma letra é revelada, a peça "vira" (animação CSS ao trocar de classe).
 */
export function Mascara({ mascara, palavra = null }: MascaraProps) {
  const letras = [...(palavra ?? mascara)];
  const leitura = [...mascara].join(' ');

  return (
    <div className={classeDeTamanho(letras.length)} role="img" aria-label={`Palavra: ${leitura}`}>
      {letras.map((letra, i) => {
        const oculta = mascara[i] === '_';
        const faltou = palavra !== null && oculta;

        if (faltou) {
          return (
            <span key={i} className="peca peca--faltou" style={{ animationDelay: `${300 + i * 90}ms` }}>
              {letra}
            </span>
          );
        }
        return (
          <span key={i} className={oculta ? 'peca peca--oculta' : 'peca peca--revelada'}>
            {oculta ? '' : letra}
          </span>
        );
      })}
    </div>
  );
}
