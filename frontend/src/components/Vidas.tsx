type VidasProps = {
  restantes: number;
  total: number;
};

/** Corações cheios para as vidas que restam; o coração perdido "quebra" (animação CSS). */
export function Vidas({ restantes, total }: VidasProps) {
  const coracoes = Array.from({ length: total }, (_, i) => i < restantes);

  return (
    <div className="vidas" role="img" aria-label={`${restantes} de ${total} vidas`}>
      {coracoes.map((cheio, i) => (
        <svg key={i} className={cheio ? 'coracao' : 'coracao coracao--perdido'} viewBox="0 0 24 22" aria-hidden="true">
          <path d="M12 21C5 15 1 11.5 1 7c0-3.5 2.7-6 6-6 2.2 0 4 1.2 5 3 1-1.8 2.8-3 5-3 3.3 0 6 2.5 6 6 0 4.5-4 8-11 14z" />
          <path className="coracao-brilho" d="M5.5 5.5c.6-1.2 1.6-1.8 2.8-1.8" />
        </svg>
      ))}
    </div>
  );
}
