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

export const SEED_ACADEMIC_NOTES: AcademicNote[] = []

export const INITIAL_ACADEMIC_DATA: AcademicData = {
  subjects: DEFAULT_SUBJECTS,
  notes: SEED_ACADEMIC_NOTES,
  version: 1,
}
