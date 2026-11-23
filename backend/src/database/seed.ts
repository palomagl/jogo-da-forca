import { prisma } from './prisma';

// [texto, categoria, dica] — texto em MAIÚSCULAS, sem acento, sem espaço e sem hífen
const palavras: [string, string, string][] = [
  // JavaScript
  ['PROMISE', 'JavaScript', 'Objeto que representa um valor que vai chegar no futuro'],
  ['CALLBACK', 'JavaScript', 'Função passada como argumento para ser chamada depois'],
  ['CLOSURE', 'JavaScript', 'Função que lembra as variáveis do escopo onde foi criada'],
  ['ARRAY', 'JavaScript', 'Lista ordenada de valores acessados por índice'],
  ['HOISTING', 'JavaScript', 'Declarações se comportam como se fossem içadas para o topo do escopo'],
  ['EVENTLOOP', 'JavaScript', 'Mecanismo que decide quando cada callback assíncrono vai rodar'],
  ['ASYNC', 'JavaScript', 'Palavra-chave que faz uma função devolver uma Promise'],
  ['JSON', 'JavaScript', 'Formato de texto usado para trocar dados entre front e back'],
  ['DESESTRUTURACAO', 'JavaScript', 'Sintaxe que extrai valores de objetos e arrays direto para variáveis'],

  // TypeScript
  ['INTERFACE', 'TypeScript', 'Descreve o formato que um objeto deve ter'],
  ['GENERICS', 'TypeScript', 'Tipos que recebem outros tipos como parâmetro, como Array<T>'],
  ['ENUM', 'TypeScript', 'Conjunto nomeado de constantes'],
  ['TUPLA', 'TypeScript', 'Array de tamanho fixo em que cada posição tem seu próprio tipo'],
  ['NEVER', 'TypeScript', 'Tipo de algo que nunca acontece, como uma função que sempre lança erro'],
  ['UNION', 'TypeScript', 'Tipo que aceita uma opção OU outra, escrito com a barra vertical'],
  ['DECORATOR', 'TypeScript', 'Anotação com @ que modifica classes ou métodos'],
  ['TYPESCRIPT', 'TypeScript', 'Superconjunto do JavaScript com tipagem estática'],
  ['INFERENCIA', 'TypeScript', 'Quando o compilador descobre o tipo sozinho, sem você escrever'],

  // React
  ['COMPONENTE', 'React', 'Função que recebe props e devolve JSX'],
  ['ESTADO', 'React', 'Dado que, quando muda, faz a tela ser desenhada de novo'],
  ['HOOK', 'React', 'Função especial do React cujo nome começa com use'],
  ['PROPS', 'React', 'Dados que o componente pai passa para o filho'],
  ['USEEFFECT', 'React', 'Hook usado para efeitos colaterais, como buscar dados da API'],
  ['RENDERIZACAO', 'React', 'Processo de transformar componentes em elementos na tela'],
  ['CONTEXTO', 'React', 'Compartilha dados entre componentes sem repassar props manualmente'],
  ['FRAGMENT', 'React', 'Agrupa elementos sem criar uma div extra no HTML'],

  // Banco de Dados
  ['SQLITE', 'Banco de Dados', 'Banco de dados que fica inteiro dentro de um único arquivo'],
  ['TABELA', 'Banco de Dados', 'Estrutura com linhas e colunas onde os registros ficam guardados'],
  ['MIGRATION', 'Banco de Dados', 'Arquivo versionado que altera a estrutura do banco'],
  ['CHAVEPRIMARIA', 'Banco de Dados', 'Coluna que identifica cada linha de forma única'],
  ['CONSULTA', 'Banco de Dados', 'Pedido de dados feito ao banco, como um SELECT'],
  ['INDICE', 'Banco de Dados', 'Estrutura que acelera as buscas em uma coluna'],
  ['RELACIONAMENTO', 'Banco de Dados', 'Ligação entre duas tabelas feita por uma chave estrangeira'],
  ['TRANSACAO', 'Banco de Dados', 'Grupo de operações que acontece por inteiro ou não acontece'],
];

async function main() {
  // upsert não duplica se o seed rodar de novo
  // (no SQLite, createMany NÃO aceita skipDuplicates)
  await prisma.$transaction(
    palavras.map(([texto, categoria, dica]) =>
      prisma.palavra.upsert({
        where: { texto },
        update: { categoria, dica },
        create: { texto, categoria, dica },
      }),
    ),
  );
  console.log('Seed concluído:', await prisma.palavra.count(), 'palavras');
}

main()
  .catch((erro: unknown) => {
    console.error('Falha no seed:', erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
