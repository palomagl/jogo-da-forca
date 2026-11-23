type LogoProps = {
  tamanho?: 'grande' | 'pequeno';
};

const LINHAS = ['FORCA', 'DEV'];

/** Logo em peças, como as letras da palavra. No tamanho grande as peças entram uma a uma. */
export function Logo({ tamanho = 'grande' }: LogoProps) {
  return (
    <h1 className={`logo logo--${tamanho}`} aria-label="Forca Dev">
      {LINHAS.map((palavra, linha) => (
        <span key={palavra} className={`logo-linha logo-linha--${linha}`} aria-hidden="true">
          {[...palavra].map((letra, i) => {
            const ordem = (linha === 0 ? 0 : LINHAS[0].length) + i;
            return (
              <span key={i} className="logo-peca" style={{ animationDelay: `${ordem * 80}ms` }}>
                {letra}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
