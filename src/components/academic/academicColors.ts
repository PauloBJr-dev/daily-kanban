export interface SubjectColorConfig {
  id: string
  name: string
  bg: string
  bgSubtle: string
  text: string
  border: string
  ring: string
  dot: string
}

export const SUBJECT_COLORS: Record<string, SubjectColorConfig> = {
  indigo: {
    id: 'indigo',
    name: 'Índigo',
    bg: 'bg-indigo-600',
    bgSubtle: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800/70',
    ring: 'focus:ring-indigo-500',
    dot: 'bg-indigo-500',
  },
  emerald: {
    id: 'emerald',
    name: 'Esmeralda',
    bg: 'bg-emerald-600',
    bgSubtle: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/70',
    ring: 'focus:ring-emerald-500',
    dot: 'bg-emerald-500',
  },
  violet: {
    id: 'violet',
    name: 'Violeta',
    bg: 'bg-violet-600',
    bgSubtle: 'bg-violet-50 dark:bg-violet-950/60',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800/70',
    ring: 'focus:ring-violet-500',
    dot: 'bg-violet-500',
  },
  amber: {
    id: 'amber',
    name: 'Âmbar',
    bg: 'bg-amber-600',
    bgSubtle: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/70',
    ring: 'focus:ring-amber-500',
    dot: 'bg-amber-500',
  },
  rose: {
    id: 'rose',
    name: 'Rosa',
    bg: 'bg-rose-600',
    bgSubtle: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/70',
    ring: 'focus:ring-rose-500',
    dot: 'bg-rose-500',
  },
  sky: {
    id: 'sky',
    name: 'Céu',
    bg: 'bg-sky-600',
    bgSubtle: 'bg-sky-50 dark:bg-sky-950/60',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800/70',
    ring: 'focus:ring-sky-500',
    dot: 'bg-sky-500',
  },
  fuchsia: {
    id: 'fuchsia',
    name: 'Fúcsia',
    bg: 'bg-fuchsia-600',
    bgSubtle: 'bg-fuchsia-50 dark:bg-fuchsia-950/60',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    border: 'border-fuchsia-200 dark:border-fuchsia-800/70',
    ring: 'focus:ring-fuchsia-500',
    dot: 'bg-fuchsia-500',
  },
  teal: {
    id: 'teal',
    name: 'Azul-Petróleo',
    bg: 'bg-teal-600',
    bgSubtle: 'bg-teal-50 dark:bg-teal-950/60',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800/70',
    ring: 'focus:ring-teal-500',
    dot: 'bg-teal-500',
  },
  purple: {
    id: 'purple',
    name: 'Roxo',
    bg: 'bg-purple-600',
    bgSubtle: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800/70',
    ring: 'focus:ring-purple-500',
    dot: 'bg-purple-500',
  },
  blue: {
    id: 'blue',
    name: 'Azul',
    bg: 'bg-blue-600',
    bgSubtle: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/70',
    ring: 'focus:ring-blue-500',
    dot: 'bg-blue-500',
  },
}

export function getSubjectColor(colorKey?: string): SubjectColorConfig {
  if (!colorKey) return SUBJECT_COLORS.indigo
  return SUBJECT_COLORS[colorKey] || SUBJECT_COLORS.indigo
}
