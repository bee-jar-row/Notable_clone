import { CloseIcon, SearchIcon } from './Icons'

function SearchInput({
  ariaLabel = 'Search',
  className = 'search-box',
  onChange,
  onClear,
  placeholder = 'Search',
  value,
}) {
  return (
    <div className={className}>
      <SearchIcon className="ui-icon search-input__icon" />
      <input
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {value && (
        <button
          aria-label="Clear search"
          className="icon-button icon-button--compact"
          onClick={onClear}
          type="button"
        >
          <CloseIcon className="ui-icon" />
        </button>
      )}
    </div>
  )
}

export default SearchInput
