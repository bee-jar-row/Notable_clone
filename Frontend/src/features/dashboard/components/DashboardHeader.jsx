import ActionPopover from '../../../shared/components/ui/ActionPopover'
import { FilterIcon, SortIcon } from '../../../shared/components/ui/Icons'
import ProtectedTopbar from '../../../shared/components/ui/ProtectedTopbar'
import GlobalSearch from '../../search/GlobalSearch'

const typeFilterLabels = {
  all: 'All',
  folder: 'Folders',
  notebook: 'Notebooks',
}

const statusFilterLabels = {
  all: 'All tasks',
  active: 'Active',
  completed: 'Completed',
}

const sortLabels = {
  newest: 'Newest',
  az: 'A-Z',
  mostTodos: 'To-do terbanyak',
  leastTodos: 'To-do tersedikit',
}

function DashboardHeader({
  onSortModeChange,
  onStatusFilterChange,
  onTypeFilterChange,
  profile,
  sortMode,
  statusFilter,
  typeFilter,
}) {
  const filterActions = (
    <>
      <div className="dashboard-menu__section">
        <span>Type</span>
        {Object.entries(typeFilterLabels).map(([value, label]) => (
          <button
            aria-checked={typeFilter === value}
            className={typeFilter === value ? 'is-active' : ''}
            key={value}
            onClick={() => onTypeFilterChange(value)}
            role="menuitemradio"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="dashboard-menu__section">
        <span>Status</span>
        {Object.entries(statusFilterLabels).map(([value, label]) => (
          <button
            aria-checked={statusFilter === value}
            className={statusFilter === value ? 'is-active' : ''}
            key={value}
            onClick={() => onStatusFilterChange(value)}
            role="menuitemradio"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </>
  )

  const sortActions = (
    <div className="dashboard-menu__section">
      <span>Sort</span>
      {Object.entries(sortLabels).map(([value, label]) => (
        <button
          aria-checked={sortMode === value}
          className={sortMode === value ? 'is-active' : ''}
          key={value}
          onClick={() => onSortModeChange(value)}
          role="menuitemradio"
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <ProtectedTopbar
      actions={(
        <>
        <GlobalSearch className="dashboard-search" />
        <ActionPopover
          ariaLabel="Dashboard filters"
          icon={<FilterIcon className="ui-icon" />}
        >
          {filterActions}
        </ActionPopover>
        <ActionPopover
          ariaLabel="Dashboard sort options"
          icon={<SortIcon className="ui-icon" />}
        >
          <div className="dashboard-menu__content--compact-inner">{sortActions}</div>
        </ActionPopover>
        </>
      )}
      className="dashboard-topbar"
      title={`Hello, ${profile?.display_name || profile?.name || 'Student'}`}
    />
  )
}

export default DashboardHeader
