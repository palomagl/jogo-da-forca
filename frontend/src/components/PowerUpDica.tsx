type PowerUpDicaProps = {
  /** Texto da dica, ou null se ainda não foi comprada. */
  dica: string | null;
  vidasRestantes: number;
  carregando: boolean;
  onComprar: () => void;
};

/** Bônus "dica paga": troca 1 vida pela dica da palavra (exige pelo menos 2 vidas). */
export function PowerUpDica({ dica, vidasRestantes, carregando, onComprar }: PowerUpDicaProps) {
  if (dica !== null) {
    return (
      <div className="dica">
        <span className="dica-icone" aria-hidden="true">💡</span>
        <p>
          <strong>Dica:</strong> {dica}
        </p>
      </div>
    );
  }

  const podeComprar = vidasRestantes >= 2;
  return (
    <button
      type="button"
      className="powerup"
      onClick={onComprar}
      disabled={!podeComprar || carregando}
      aria-label="Usar dica (custa 1 vida)"
    >
      <span className="powerup-icone" aria-hidden="true">💡</span>
      <span className="powerup-texto">
        Usar dica
        <small>{podeComprar ? 'custa 1 vida' : 'precisa de 2 vidas'}</small>
      </span>
      <span className="powerup-custo" aria-hidden="true">−1 ♥</span>
    </button>
  );
}
