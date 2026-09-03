import type { AcademicData, Subject, AcademicNote } from '../types/academic'

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-calc',
    name: 'Cálculo Diferencial e Integral',
    color: 'indigo',
    code: 'MAT-101',
    icon: 'Calculator',
  },
  {
    id: 'sub-eda',
    name: 'Estruturas de Dados e Algoritmos',
    color: 'emerald',
    code: 'CC-201',
    icon: 'Binary',
  },
  {
    id: 'sub-redes',
    name: 'Redes de Computadores',
    color: 'sky',
    code: 'CC-302',
    icon: 'Network',
  },
  {
    id: 'sub-bd',
    name: 'Banco de Dados',
    color: 'amber',
    code: 'CC-204',
    icon: 'Database',
  },
  {
    id: 'sub-ia',
    name: 'Inteligência Artificial',
    color: 'purple',
    code: 'CC-401',
    icon: 'Brain',
  },
]

const today = new Date().toISOString().split('T')[0]

export const SEED_ACADEMIC_NOTES: AcademicNote[] = [
  {
    id: 'note-1',
    title: 'Teorema Fundamental do Cálculo e Aplicações de Derivadas',
    content:
      'Revisão dos conceitos essenciais: taxas de variação instantânea, regra da cadeia e interpretação geométrica da reta tangente. Aplicação em otimização de máximos e mínimos.',
    subjectId: 'sub-calc',
    status: 'in_progress',
    tags: ['Cálculo', 'Derivadas', 'Otimização'],
    isPinned: true,
    examDate: today,
    reviewDate: today,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'note-2',
    title: 'Árvores Balanceadas: AVL e Rubro-Negra',
    content:
      'Comparativo de rotações simples e duplas na AVL versus nós pretos/vermelhos em árvores Red-Black. Análise assintótica de busca, inserção e deleção em O(log n).',
    subjectId: 'sub-eda',
    status: 'to_review',
    tags: ['Estruturas de Dados', 'Árvores', 'Complexidade'],
    isPinned: true,
    examDate: today,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'note-3',
    title: 'Camada de Transporte: TCP vs UDP e Handshake de 3 Vias',
    content:
      'Diferença entre controle de fluxo e controle de congestionamento (janela deslizante, slow start). Mecanismo SYN, SYN-ACK, ACK e garantia de integridade sequencial.',
    subjectId: 'sub-redes',
    status: 'mastered',
    tags: ['Redes', 'TCP/IP', 'Protocolos'],
    isPinned: false,
    reviewDate: today,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'note-4',
    title: 'Propriedades ACID e Isolamento de Transações',
    content:
      'Atomicidade, Consistência, Isolamento e Durabilidade. Níveis de isolamento ANSI SQL: Read Uncommitted, Read Committed, Repeatable Read e Serializable. Fenômenos de anomalias (dirty read, non-repeatable read, phantom read).',
    subjectId: 'sub-bd',
    status: 'in_progress',
    tags: ['Banco de Dados', 'SQL', 'Transações'],
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'note-5',
    title: 'Backpropagation e Otimizadores Gradiente Descendente',
    content:
      'Cálculo do gradiente com aplicação repetida da regra da cadeia computacional. Comparação entre SGD, Momentum, RMSprop e Adam com decay adaptativo de taxa de aprendizado.',
    subjectId: 'sub-ia',
    status: 'to_review',
    tags: ['Machine Learning', 'Deep Learning', 'Otimização'],
    isPinned: false,
    reviewDate: today,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'note-6',
    title: 'Algoritmos em Grafos: Dijkstra e Bellman-Ford',
    content:
      'Encontrar caminhos mínimos em grafos ponderados. Dijkstra com fila de prioridade O((V + E) log V). Bellman-Ford para grafos com arestas de peso negativo e detecção de ciclos negativos.',
    subjectId: 'sub-eda',
    status: 'mastered',
    tags: ['Estruturas de Dados', 'Grafos', 'Algoritmos'],
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
]

export const INITIAL_ACADEMIC_DATA: AcademicData = {
  subjects: DEFAULT_SUBJECTS,
  notes: SEED_ACADEMIC_NOTES,
  version: 1,
}
