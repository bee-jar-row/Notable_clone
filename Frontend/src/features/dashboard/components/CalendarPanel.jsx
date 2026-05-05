import { Link } from 'react-router-dom'
import Modal from '../../../shared/components/ui/Modal'
import { DASHBOARD_MODAL } from '../hooks/useDashboard'

function CalendarEmptyState() {
  return (
    <div className="calendar-empty-state">
      <strong>Google Calendar belum terhubung.</strong>
      <p>Tambahkan public embed URL di Settings untuk melihat jadwal di sini.</p>
      <Link to="/settings">Open Settings</Link>
    </div>
  )
}

function GoogleCalendarFrame({ gcalUrl, title }) {
  if (!gcalUrl) return <CalendarEmptyState />

  return <iframe className="calendar-frame" src={gcalUrl} title={title} />
}

function CalendarPanel({ activeModal, onCloseModal, onOpenModal, profile }) {
  const gcalUrl = profile?.gcal_url || ''

  return (
    <>
      <aside className="dashboard-panel dashboard-panel--calendar">
        <div className="dashboard-panel__header">
          <h2>Your Day</h2>
          <button
            aria-label="Open Your Day calendar full screen"
            className="ghost-button ghost-button--small dashboard-panel__fullscreen"
            onClick={() => onOpenModal(DASHBOARD_MODAL.GCAL)}
            type="button"
          >
            Full Screen
          </button>
        </div>
        <div className="dashboard-panel__body">
          <GoogleCalendarFrame gcalUrl={gcalUrl} title="Google Calendar" />
        </div>
      </aside>

      <Modal
        isOpen={activeModal === DASHBOARD_MODAL.GCAL}
        onClose={onCloseModal}
        size="wide"
        title="Your Day - Google Calendar"
      >
        <GoogleCalendarFrame gcalUrl={gcalUrl} title="Google Calendar Fullscreen" />
      </Modal>
    </>
  )
}

export default CalendarPanel
