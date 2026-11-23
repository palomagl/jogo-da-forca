// Bônus: desenho da forca em SVG que evolui a cada erro.
// O cenário (céu, lua, morros e a forca de madeira) é fixo; o boneco ganha uma parte por erro
// e o rosto muda de humor conforme as vidas acabam.

type Resultado = 'vitoria' | 'derrota' | null;
type Humor = 'tranquilo' | 'preocupado' | 'apavorado' | 'derrotado' | 'feliz';

type CenarioProps = {
  /** Quantidade de erros (0 a 6). Cada erro desenha uma parte do boneco. */
  erros: number;
  /** No fim da partida: na vitória o boneco aparece livre; na derrota ele balança. */
  resultado?: Resultado;
};

const COR = {
  pele: '#FFD3A8',
  cabelo: '#3B2A20',
  moletom: '#7B61FF',
  calca: '#2E5BCE',
  tenis: '#1B1340',
};

// [x, y, raio] das estrelas do céu
const ESTRELAS: [number, number, number][] = [
  [22, 28, 1.6], [64, 16, 1.1], [104, 34, 1.7], [150, 12, 1.2], [182, 70, 1],
  [250, 18, 1.3], [302, 40, 1.5], [36, 86, 1.1], [130, 96, 0.9], [300, 112, 1.2],
];

function humorDoBoneco(erros: number, resultado: Resultado): Humor {
  if (resultado === 'vitoria') return 'feliz';
  if (resultado === 'derrota' || erros >= 6) return 'derrotado';
  if (erros >= 5) return 'apavorado';
  if (erros >= 3) return 'preocupado';
  return 'tranquilo';
}

type RostoProps = { x: number; y: number; humor: Humor };

/** Olhos e boca de acordo com o humor. */
function Rosto({ x, y, humor }: RostoProps) {
  switch (humor) {
    case 'feliz':
      return (
        <g className="rosto">
          <path className="traco" d={`M${x - 9} ${y - 2} q3 -5 6 0 M${x + 3} ${y - 2} q3 -5 6 0`} />
          <path className="boca-aberta" d={`M${x - 7} ${y + 4} q7 9 14 0 z`} />
        </g>
      );
    case 'tranquilo':
      return (
        <g className="rosto">
          <circle className="olho" cx={x - 6} cy={y - 2} r={2.3} />
          <circle className="olho" cx={x + 6} cy={y - 2} r={2.3} />
          <path className="traco" d={`M${x - 6} ${y + 5} q6 5 12 0`} />
        </g>
      );
    case 'preocupado':
      return (
        <g className="rosto">
          <path className="traco" d={`M${x - 10} ${y - 8} l6 2 M${x + 10} ${y - 8} l-6 2`} />
          <circle className="olho" cx={x - 6} cy={y - 1} r={2.3} />
          <circle className="olho" cx={x + 6} cy={y - 1} r={2.3} />
          <path className="traco" d={`M${x - 5} ${y + 7} h10`} />
          <path className="suor" d={`M${x + 15} ${y - 6} q3 5 0 7 q-3 -2 0 -7 z`} />
        </g>
      );
    case 'apavorado':
      return (
        <g className="rosto">
          <circle className="olho-branco" cx={x - 6} cy={y - 2} r={4.2} />
          <circle className="olho-branco" cx={x + 6} cy={y - 2} r={4.2} />
          <circle className="olho" cx={x - 6} cy={y - 1} r={1.8} />
          <circle className="olho" cx={x + 6} cy={y - 1} r={1.8} />
          <ellipse className="boca-aberta" cx={x} cy={y + 8} rx={3.2} ry={4} />
        </g>
      );
    case 'derrotado':
      return (
        <g className="rosto">
          <path className="traco" d={`M${x - 9} ${y - 5} l6 6 m0 -6 l-6 6 M${x + 3} ${y - 5} l6 6 m0 -6 l-6 6`} />
          <path className="traco" d={`M${x - 6} ${y + 8} q3 -3 6 0 q3 3 6 0`} />
        </g>
      );
  }
}

type MembroProps = { d: string; cor: string; ponta: [number, number]; corPonta: string };

/** Braço ou perna: traço grosso com contorno e uma "ponta" (mão ou pé). */
function Membro({ d, cor, ponta, corPonta }: MembroProps) {
  return (
    <>
      <path className="membro-contorno" d={d} />
      <path className="membro" d={d} stroke={cor} />
      <circle className="contorno" cx={ponta[0]} cy={ponta[1]} r={5} fill={corPonta} />
    </>
  );
}

type CabecaProps = { x: number; y: number; raio: number; humor: Humor };

function Cabeca({ x, y, raio, humor }: CabecaProps) {
  return (
    <>
      <circle className="contorno" cx={x} cy={y} r={raio} fill={COR.pele} />
      <path
        className="contorno"
        fill={COR.cabelo}
        d={`M${x - raio} ${y - 2} A${raio} ${raio} 0 0 1 ${x + raio} ${y - 2} Q${x + raio - 6} ${y - 11} ${x + 4} ${y - 9} Q${x - 2} ${y - 15} ${x - 8} ${y - 8} Q${x - raio + 4} ${y - 9} ${x - raio} ${y - 2} Z`}
      />
      <Rosto x={x} y={y + 2} humor={humor} />
    </>
  );
}

/** As 6 partes do boneco pendurado, na ordem em que aparecem (RN01: 6 erros = derrota). */
function bonecoPendurado(humor: Humor) {
  return [
    <g key="cabeca" className="parte">
      <Cabeca x={210} y={120} raio={18} humor={humor} />
    </g>,
    <g key="corpo" className="parte">
      <path className="contorno" fill={COR.moletom} d="M198 138 h24 q6 0 6 6 v40 q0 6 -6 6 h-24 q-6 0 -6 -6 v-40 q0 -6 6 -6 z" />
      <path className="detalhe" d="M204 160 h12" />
    </g>,
    <g key="braco-esquerdo" className="parte">
      <Membro d="M197 148 L180 178" cor={COR.moletom} ponta={[179, 180]} corPonta={COR.pele} />
    </g>,
    <g key="braco-direito" className="parte">
      <Membro d="M223 148 L240 178" cor={COR.moletom} ponta={[241, 180]} corPonta={COR.pele} />
    </g>,
    <g key="perna-esquerda" className="parte">
      <Membro d="M203 190 L195 230" cor={COR.calca} ponta={[193, 233]} corPonta={COR.tenis} />
    </g>,
    <g key="perna-direita" className="parte">
      <Membro d="M217 190 L225 230" cor={COR.calca} ponta={[227, 233]} corPonta={COR.tenis} />
    </g>,
  ];
}

/** Na vitória: o boneco escapou e comemora ao lado da forca. */
function BonecoLivre() {
  return (
    <g className="boneco-livre">
      <Membro d="M264 232 L260 254" cor={COR.calca} ponta={[259, 256]} corPonta={COR.tenis} />
      <Membro d="M276 232 L280 254" cor={COR.calca} ponta={[281, 256]} corPonta={COR.tenis} />
      <path className="contorno" fill={COR.moletom} d="M262 190 h16 q6 0 6 6 v32 q0 6 -6 6 h-16 q-6 0 -6 -6 v-32 q0 -6 6 -6 z" />
      <Membro d="M259 198 L246 172" cor={COR.moletom} ponta={[245, 169]} corPonta={COR.pele} />
      <Membro d="M281 198 L294 172" cor={COR.moletom} ponta={[295, 169]} corPonta={COR.pele} />
      <Cabeca x={270} y={174} raio={16} humor="feliz" />
      <g className="brilhos">
        <path d="M236 150 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 z" />
        <path d="M300 146 l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 z" />
        <path d="M304 196 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 z" />
      </g>
    </g>
  );
}

export function Cenario({ erros, resultado = null }: CenarioProps) {
  const errosVisiveis = Math.max(0, Math.min(erros, 6));
  const humor = humorDoBoneco(errosVisiveis, resultado);
  const partes = resultado === 'vitoria' ? [] : bonecoPendurado(humor).slice(0, errosVisiveis);
  const descricao =
    resultado === 'vitoria'
      ? 'O boneco escapou da forca e está comemorando'
      : `Forca com ${errosVisiveis} de 6 partes do boneco desenhadas`;

  return (
    <svg className="cenario" viewBox="0 0 320 300" role="img" aria-label={descricao}>
      <defs>
        <linearGradient id="ceu-forca" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A1048" />
          <stop offset="0.65" stopColor="#4A2384" />
          <stop offset="1" stopColor="#8A3C8F" />
        </linearGradient>
        <radialGradient id="brilho-lua">
          <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* céu, estrelas, lua e nuvens */}
      <rect width="320" height="300" fill="url(#ceu-forca)" />
      {ESTRELAS.map(([x, y, r], i) => (
        <circle key={i} className="estrela" cx={x} cy={y} r={r} style={{ animationDelay: `${(i % 5) * 0.7}s` }} />
      ))}
      <circle cx="268" cy="64" r="46" fill="url(#brilho-lua)" />
      <circle cx="268" cy="64" r="22" fill="#FFE9A8" />
      <circle cx="260" cy="58" r="4" fill="#F2D37E" />
      <circle cx="274" cy="72" r="3" fill="#F2D37E" />
      <g className="nuvem">
        <ellipse cx="70" cy="62" rx="30" ry="9" />
        <ellipse cx="90" cy="56" rx="18" ry="8" />
      </g>

      {/* morros */}
      <path d="M0 214 Q70 178 150 204 T320 188 V300 H0 Z" fill="#2B1C66" />
      <path d="M0 252 Q90 232 170 248 T320 242 V300 H0 Z" fill="#1F6B4E" />
      <path d="M0 252 Q90 232 170 248 T320 242" fill="none" stroke="#38A06F" strokeWidth="4" />

      {/* forca de madeira */}
      <g className="madeira">
        <rect x="24" y="250" width="150" height="14" rx="4" />
        <rect x="60" y="38" width="16" height="216" rx="4" />
        <rect x="54" y="34" width="174" height="15" rx="4" />
        <path className="madeira-trave-contorno" d="M76 104 L126 49" />
        <path className="madeira-trave" d="M76 104 L126 49" />
        <path className="veio" d="M66 70 v40 M70 150 v50 M100 41 h30 M160 43 h40" />
      </g>

      {/* corda + boneco: na derrota tudo balança junto */}
      <g className={resultado === 'derrota' ? 'pendurado pendurado--balancando' : 'pendurado'}>
        <path className="corda" d="M210 49 V98" />
        <ellipse className="corda" cx="210" cy="104" rx="7" ry="8" />
        {partes}
      </g>

      {resultado === 'vitoria' && <BonecoLivre />}
    </svg>
  );
}
