type EstrelasProps = {
  /** Quantas estrelas acesas (0 a 3). */
  quantidade: number;
};

const PONTA = 'M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6 5.6 21.1 7 14l-5.3-5 7.2-.9z';

/** Avaliação da vitória com 3 estrelas que "pulam" uma de cada vez. */
export function Estrelas({ quantidade }: EstrelasProps) {
  return (
    <div className="estrelas" role="img" aria-label={`${quantidade} de 3 estrelas`}>
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 23"
          className={i < quantidade ? 'estrela-premio estrela-premio--acesa' : 'estrela-premio'}
          style={{ animationDelay: `${400 + i * 250}ms` }}
          aria-hidden="true"
        >
          <path d={PONTA} />
        </svg>
      ))}
    </div>
  );
}
