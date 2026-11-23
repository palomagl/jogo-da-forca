type LetrasTentadasProps = {
  tentadas: string[];
  mascara: string;
};

/** Lista as letras na ordem em que foram tentadas, verdes (acerto) ou rosa (erro). */
export function LetrasTentadas({ tentadas, mascara }: LetrasTentadasProps) {
  return (
    <div className="tentadas">
      <span className="tentadas-rotulo">Já tentou</span>
      {tentadas.length === 0 ? (
        <span className="tentadas-vazio">nenhuma letra ainda</span>
      ) : (
        tentadas.map((letra) => (
          <span key={letra} className={mascara.includes(letra) ? 'tentada tentada--acerto' : 'tentada tentada--erro'}>
            {letra}
          </span>
        ))
      )}
    </div>
  );
}
