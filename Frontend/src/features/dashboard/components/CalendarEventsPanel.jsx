import { useEffect, useState } from 'react'
import { apiRequest } from '../../../shared/api/api'

function formatEventTime(dateString) {
  if (!dateString) return 'All day'
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getStatusTag(event) {
  const now = new Date()
  const start = new Date(event.start?.dateTime || event.start?.date)
  const end = new Date(event.end?.dateTime || event.end?.date)
  if (end < now) return { label: 'Done', tone: 'done' }
  if (start <= now && end >= now) return { label: 'Now', tone: 'now' }
  return { label: 'Later', tone: 'later' }
}

const ACCENT_COLORS = ['#378ADD', '#1D9E75', '#D4537E', '#BA7517', '#534AB7']

function CalendarEventsPanel() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/calendar/events')
      .then((data) => setEvents(data.events || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <aside className="dashboard-panel dashboard-panel--calendar">
      <div className="dashboard-panel__header">
        <h2>Your Day</h2>
      </div>
      <div className="dashboard-panel__body" style={{ padding: '12px 14px', overflowY: 'auto' }}>
        {loading && <p className="muted" style={{ fontSize: '12px' }}>Loading events…</p>}
        {error && <p className="muted" style={{ fontSize: '12px' }}>Could not load events.</p>}
        {!loading && !error && events.length === 0 && (
          <p className="muted" style={{ fontSize: '12px' }}>No events today.</p>
        )}
        {events.map((event, i) => {
          const status = getStatusTag(event)
          const accent = ACCENT_COLORS[i % ACCENT_COLORS.length]
          const tagStyles = {
            done: { background: '#E6F1FB', color: '#0C447C' },
            now:  { background: '#E1F5EE', color: '#085041' },
            later:{ background: '#FBEAF0', color: '#72243E' },
          }
          return (
            <div
              key={event.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                marginBottom: '8px',
                border: '0.5px solid #dddbd6',
                borderLeft: `3px solid ${accent}`,
                borderRadius: '6px',
                background: '#faf9f7',
                opacity: status.tone === 'done' ? 0.55 : 1,
              }}
            >
              <span style={{ fontSize: '11px', color: '#888', minWidth: '42px', fontFamily: 'Geist Mono, monospace' }}>
                {formatEventTime(event.start?.dateTime || event.start?.date)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{
                  display: 'block',
                  fontSize: '13px',
                  fontStyle: 'normal',
                  fontFamily: 'Inria Serif, serif',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#1a1a1a',
                }}>
                  {event.summary || '(No title)'}
                </strong>
              </div>
              <span style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '99px',
                fontFamily: 'Geist Mono, monospace',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                ...tagStyles[status.tone],
              }}>
                {status.label}
              </span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default CalendarEventsPanel