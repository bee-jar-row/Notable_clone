/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../app/providers/AuthContext'
import Modal from '../../shared/components/ui/Modal'
import FocusSummaryModal from '../dashboard/components/FocusSummaryModal'
import {
  completeFocusTodo,
  downloadFocusResource,
  endFocusSession,
  getFocusNotes,
  getFocusResources,
  getFocusSessions,
  getFocusTodoCandidates,
  startFocusSession,
} from './focus.api'
import FocusSessionOverlay from './FocusSessionOverlay'
import FocusSessionPrepareModal from './FocusSessionPrepareModal'
import FocusTimerWidget from './FocusTimerWidget'

const FocusSessionContext = createContext(null)

function parseSessionDate(value) {
  if (!value) return null
  const normalized = String(value).includes('T') ? value : `${String(value).replace(' ', 'T')}Z`
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0)
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getFocusTiming(session, nowMs) {
  if (!session) {
    return {
      elapsedSeconds: 0,
      isExpired: false,
      progress: 0,
      remainingSeconds: 0,
      totalSeconds: 0,
    }
  }

  const startedAt = parseSessionDate(session.started_at)
  const totalSeconds = Math.max(60, (Number(session.duration_minutes) || 50) * 60)
  const elapsedSeconds = startedAt
    ? Math.max(0, Math.floor((nowMs - startedAt.getTime()) / 1000))
    : 0
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)

  return {
    elapsedSeconds,
    isExpired: remainingSeconds === 0,
    progress: Math.min(1, elapsedSeconds / totalSeconds),
    remainingSeconds,
    totalSeconds,
  }
}

function getSupportContext(activeSession, notes, resources) {
  const todos = activeSession?.todos || []
  const todoIds = new Set(todos.map((todo) => String(todo.id)))
  const notebookIds = new Set(todos.map((todo) => String(todo.notebook_id)).filter(Boolean))

  return {
    notes: notes.filter((note) => note.todo_id && todoIds.has(String(note.todo_id))).slice(0, 4),
    resources: resources.filter((resource) => (
      resource.notebook_id && notebookIds.has(String(resource.notebook_id))
    )).slice(0, 4),
  }
}

export function FocusSessionProvider({ children }) {
  const auth = useAuth()
  const [activeSession, setActiveSession] = useState(null)
  const [availableTodos, setAvailableTodos] = useState([])
  const [supportContext, setSupportContext] = useState({ notes: [], resources: [] })
  const [lastFocusSummary, setLastFocusSummary] = useState(null)
  const [supportNote, setSupportNote] = useState(null)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isPrepareOpen, setIsPrepareOpen] = useState(false)
  const [prepareDraft, setPrepareDraft] = useState(null)
  const [isLoadingFocus, setIsLoadingFocus] = useState(false)
  const [focusError, setFocusError] = useState('')
  const [nowMs, setNowMs] = useState(() => Date.now())

  const refreshFocus = useCallback(async () => {
    if (!auth.isAuthenticated) {
      setActiveSession(null)
      setAvailableTodos([])
      setSupportContext({ notes: [], resources: [] })
      setSupportNote(null)
      setIsOverlayOpen(false)
      setIsPrepareOpen(false)
      setPrepareDraft(null)
      return null
    }

    setFocusError('')
    setIsLoadingFocus(true)
    try {
      const [sessionsData, notesData, resourcesData, todosData] = await Promise.all([
        getFocusSessions(),
        getFocusNotes(),
        getFocusResources(),
        getFocusTodoCandidates(),
      ])
      const nextActiveSession = (sessionsData.sessions || []).find((session) => session.is_completed === 0) || null

      setActiveSession(nextActiveSession)
      setAvailableTodos(todosData.todos || [])
      setSupportContext(getSupportContext(
        nextActiveSession,
        notesData.notes || [],
        resourcesData.resources || [],
      ))

      if (nextActiveSession) {
        setIsPrepareOpen(false)
        setPrepareDraft(null)
      } else {
        setIsOverlayOpen(false)
      }

      return nextActiveSession
    } catch (err) {
      setFocusError(err.message)
      return null
    } finally {
      setIsLoadingFocus(false)
    }
  }, [auth.isAuthenticated])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshFocus()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [refreshFocus])

  useEffect(() => {
    if (!auth.isAuthenticated) return undefined

    function handleVisibilityChange() {
      setNowMs(Date.now())
      if (document.visibilityState === 'visible') {
        refreshFocus()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [auth.isAuthenticated, refreshFocus])

  useEffect(() => {
    if (!auth.isAuthenticated || !activeSession) return undefined

    const timer = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [activeSession, auth.isAuthenticated])

  const timing = useMemo(() => getFocusTiming(activeSession, nowMs), [activeSession, nowMs])

  const startFocus = useCallback(async (todoIds, options = {}) => {
    const normalizedTodoIds = Array.isArray(todoIds)
      ? todoIds.filter(Boolean)
      : todoIds
        ? [todoIds]
        : []

    setFocusError('')
    setLastFocusSummary(null)
    try {
      await startFocusSession({
        duration_minutes: options.duration_minutes || 50,
        session_notes: options.session_notes || '',
        title: options.title || '',
        todo_ids: normalizedTodoIds,
      })
      await refreshFocus()
      setIsPrepareOpen(false)
      setPrepareDraft(null)
      setIsOverlayOpen(true)
    } catch (err) {
      setFocusError(err.message)
      throw err
    }
  }, [refreshFocus])

  const openPrepareFocus = useCallback((draft) => {
    setPrepareDraft(draft || null)
    setIsPrepareOpen(true)
  }, [])

  const completeTodo = useCallback(async (todoId) => {
    setFocusError('')
    try {
      await completeFocusTodo(todoId)
      await refreshFocus()
    } catch (err) {
      setFocusError(err.message)
    }
  }, [refreshFocus])

  const endFocus = useCallback(async (sessionId = activeSession?.id) => {
    if (!sessionId) return

    setFocusError('')
    try {
      const response = await endFocusSession(sessionId)
      setLastFocusSummary(response.summary || null)
      setIsOverlayOpen(false)
      await refreshFocus()
    } catch (err) {
      setFocusError(err.message)
    }
  }, [activeSession?.id, refreshFocus])

  const downloadSupportResource = useCallback(async (resource) => {
    setFocusError('')
    try {
      await downloadFocusResource(resource.id, resource.original_name)
    } catch (err) {
      setFocusError(err.message)
    }
  }, [])

  const value = useMemo(() => ({
    ...timing,
    activeSession,
    availableTodos,
    clearFocusSummary: () => setLastFocusSummary(null),
    closeOverlay: () => setIsOverlayOpen(false),
    closePrepareFocus: () => setIsPrepareOpen(false),
    closeSupportNote: () => setSupportNote(null),
    completeTodo,
    downloadSupportResource,
    endFocus,
    focusError,
    isLoadingFocus,
    isOverlayOpen,
    isPrepareOpen,
    lastFocusSummary,
    openOverlay: () => setIsOverlayOpen(true),
    openPrepareFocus,
    openSupportNote: setSupportNote,
    prepareDraft,
    refreshFocus,
    startFocus,
    supportContext,
  }), [
    activeSession,
    availableTodos,
    completeTodo,
    downloadSupportResource,
    endFocus,
    focusError,
    isLoadingFocus,
    isOverlayOpen,
    isPrepareOpen,
    lastFocusSummary,
    openPrepareFocus,
    prepareDraft,
    refreshFocus,
    startFocus,
    supportContext,
    timing,
  ])

  return (
    <FocusSessionContext.Provider value={value}>
      {children}
      {auth.isAuthenticated && (
        <FocusSessionPrepareModal
          availableTodos={availableTodos}
          draft={prepareDraft}
          isOpen={isPrepareOpen}
          key={`${prepareDraft?.title || 'prepare'}-${isPrepareOpen ? 'open' : 'closed'}`}
          onClose={() => setIsPrepareOpen(false)}
          onSubmit={(payload) => startFocus(payload.todo_ids, payload)}
        />
      )}
      {auth.isAuthenticated && <FocusSessionOverlay />}
      {auth.isAuthenticated && (
        <Modal
          isOpen={Boolean(supportNote)}
          onClose={() => setSupportNote(null)}
          size="dialog"
          title={supportNote?.title || 'Focus Note'}
        >
          <div className="focus-support-note">
            <p>{supportNote?.content || 'No note content.'}</p>
          </div>
        </Modal>
      )}
      {auth.isAuthenticated && (
        <FocusSummaryModal
          onClose={() => setLastFocusSummary(null)}
          summary={lastFocusSummary}
        />
      )}
    </FocusSessionContext.Provider>
  )
}

export function useFocusSession() {
  const context = useContext(FocusSessionContext)
  if (!context) {
    throw new Error('useFocusSession must be used inside FocusSessionProvider')
  }
  return context
}
