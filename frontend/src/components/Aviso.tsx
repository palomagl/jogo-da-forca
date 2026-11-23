type AvisoProps = {
  mensagem: string;
  onFechar: () => void;
};

/** Notificação com a mensagem de erro da API (ou de servidor fora do ar). */
export function Aviso({ mensagem, onFechar }: AvisoProps) {
  return (
    <div className="aviso" role="alert">
      <span className="aviso-icone" aria-hidden="true">!</span>
      <p>{mensagem}</p>
      <button type="button" className="aviso-fechar" onClick={onFechar} aria-label="Fechar aviso">
        ×
      </button>
    </div>
  );
}
