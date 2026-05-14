export const COVER_PRESET_COLORS = [
  '#6F8FBD',
  '#8C9F6B',
  '#B88A67',
  '#A36F84',
  '#6A9B92',
  '#8B7CB5',
]

export const EMPTY_NOTEBOOK_COVER = {
  cover_type: 'default',
  cover_color: COVER_PRESET_COLORS[0],
  cover_file: null,
}

export function getNotebookCoverForm(notebook = null) {
  return {
    cover_type: notebook?.cover_type || 'default',
    cover_color: notebook?.cover_color || COVER_PRESET_COLORS[0],
    cover_file: null,
  }
}

export function getNotebookCoverPayload(coverForm, existingNotebook = null) {
  if (coverForm.cover_type === 'image' && !coverForm.cover_file && existingNotebook?.cover_type === 'image') {
    return {}
  }

  if (coverForm.cover_type === 'color') {
    return {
      cover_type: 'color',
      cover_color: coverForm.cover_color,
    }
  }

  if (coverForm.cover_type === 'image') {
    return {
      cover_type: 'image',
      cover_file: coverForm.cover_file,
    }
  }

  return { cover_type: 'default' }
}
