const CORES = ['#FFC93C', '#FF4F87', '#34D399', '#4CC9F0', '#A78BFA', '#FF8A3D'];
const QUANTIDADE = 70;

/** Número "aleatório" fixo para cada índice: o confete sai igual a cada render. */
function pseudoAleatorio(semente: number): number {
  const x = Math.sin(semente * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Chuva de confete na vitória (só CSS; some sozinho e respeita "reduzir movimento"). */
export function Confete() {
  return (
    <div className="confete" aria-hidden="true">
      {Array.from({ length: QUANTIDADE }, (_, i) => {
        const r = pseudoAleatorio(i + 1);
        const r2 = pseudoAleatorio(i + 101);
        return (
          <span
            key={i}
            className={i % 3 === 0 ? 'confete-peca confete-peca--redonda' : 'confete-peca'}
            style={{
              left: `${r * 100}%`,
              background: CORES[i % CORES.length],
              animationDelay: `${r2 * 1.2}s`,
              animationDuration: `${2.4 + r * 1.8}s`,
              transform: `rotate(${r2 * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
