import { useEffect } from 'react'

export interface GlobalShortcutsOptions {
  onNewTask: () => void
  onFocusSearch: () => void
  onTogglePomodoro: () => void
  onOpenShortcuts: () => void
  enabled?: boolean
}

/**
 * Checks whether an event target is an interactive text input
 * or editable element where global single-key shortcuts should be ignored.
 */
export const isEditableElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false
  const tagName = target.tagName.toLowerCase()
  const isContentEditable =
    Boolean(target.isContentEditable) ||
    target.contentEditable === 'true' ||
    target.getAttribute('contenteditable') === 'true'
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isContentEditable
  )
}

export function useGlobalShortcuts({
  onNewTask,
  onFocusSearch,
  onTogglePomodoro,
  onOpenShortcuts,
  enabled = true,
}: GlobalShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Never trigger shortcuts if modifier keys (Ctrl, Alt, Meta/Command) are held
      if (e.ctrlKey || e.altKey || e.metaKey) return

      // Don't trigger if the user is actively typing in a form control
      if (isEditableElement(e.target)) return

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onNewTask()
      } else if (e.key === '/') {
        e.preventDefault()
        onFocusSearch()
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        onTogglePomodoro()
      } else if (e.key === '?') {
        e.preventDefault()
        onOpenShortcuts()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNewTask, onFocusSearch, onTogglePomodoro, onOpenShortcuts, enabled])
}
