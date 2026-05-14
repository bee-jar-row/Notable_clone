import { useEffect, useMemo } from 'react'
import { COVER_PRESET_COLORS } from '../notebookCover'

const COVER_TYPES = [
  ['default', 'Default'],
  ['color', 'Color'],
  ['image', 'Image'],
]

function NotebookCoverPicker({ hasImageCover = false, onChange, value }) {
  const previewUrl = useMemo(() => (
    value.cover_file ? URL.createObjectURL(value.cover_file) : ''
  ), [value.cover_file])

  useEffect(() => {
    if (!previewUrl) return undefined
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function updateCover(nextValue) {
    onChange({ ...value, ...nextValue })
  }

  return (
    <fieldset className="notebook-cover-picker">
      <legend>Cover</legend>
      <div className="notebook-cover-picker__modes">
        {COVER_TYPES.map(([type, label]) => (
          <label
            className={value.cover_type === type ? 'notebook-cover-picker__mode is-selected' : 'notebook-cover-picker__mode'}
            key={type}
          >
            <input
              checked={value.cover_type === type}
              name="notebook-cover-type"
              onChange={() => updateCover({ cover_type: type, cover_file: null })}
              type="radio"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {value.cover_type === 'color' && (
        <div className="notebook-cover-picker__colors">
          {COVER_PRESET_COLORS.map((color) => (
            <button
              aria-label={`Use cover color ${color}`}
              className={value.cover_color === color ? 'cover-swatch is-selected' : 'cover-swatch'}
              key={color}
              onClick={() => updateCover({ cover_color: color })}
              style={{ '--swatch-color': color }}
              type="button"
            />
          ))}
          <label className="cover-custom-color">
            Custom
            <input
              onChange={(event) => updateCover({ cover_color: event.target.value })}
              type="color"
              value={value.cover_color}
            />
          </label>
        </div>
      )}

      {value.cover_type === 'image' && (
        <div className="notebook-cover-picker__image">
          <label className="auth-form-label">
            Image
            <input
              accept="image/*"
              className="auth-form-input"
              onChange={(event) => updateCover({ cover_file: event.target.files?.[0] || null })}
              required={!hasImageCover}
              type="file"
            />
          </label>
          {(previewUrl || hasImageCover) && (
            <div className="notebook-cover-picker__preview">
              {previewUrl ? <img alt="" src={previewUrl} /> : <span>Current image cover</span>}
            </div>
          )}
        </div>
      )}
    </fieldset>
  )
}

export default NotebookCoverPicker
