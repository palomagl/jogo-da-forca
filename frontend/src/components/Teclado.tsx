type TecladoProps = {
  tentadas: string[];
  /** Usada para saber se cada letra tentada foi acerto (aparece na máscara) ou erro. */
  mascara: string;
  desabilitado: boolean;
  onLetra: (letra: string) => void;
};

// Teclado virtual com as 26 letras de A a Z, no layout QWERTY (igual ao teclado físico)
const LINHAS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

/** Letras já tentadas ficam desabilitadas: verdes se acertou, rosa e riscadas se errou. */
export function Teclado({ tentadas, mascara, desabilitado, onLetra }: TecladoProps) {
  return (
    <div className="teclado" role="group" aria-label="Teclado de letras">
      {LINHAS.map((linha) => (
        <div key={linha} className="teclado-linha">
          {[...linha].map((letra) => {
            const tentada = tentadas.includes(letra);
            const acertou = tentada && mascara.includes(letra);
            const classe = tentada ? (acertou ? 'tecla tecla--acerto' : 'tecla tecla--erro') : 'tecla';
            const situacao = tentada ? (acertou ? ', acertou' : ', errou') : '';

            return (
              <button
                key={letra}
                type="button"
                className={classe}
                disabled={desabilitado || tentada}
                onClick={() => onLetra(letra)}
                aria-label={`Letra ${letra}${situacao}`}
              >
                {letra}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
