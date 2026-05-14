import { useEffect, useState } from 'react'
import { getNotebookCover } from '../workspace.api'

function NotebookCard({
  coverColor,
  coverImageFilename,
  coverType = 'default',
  notebookId,
  title,
  taskCount,
}) {
  const [coverImage, setCoverImage] = useState({ key: '', url: '' })

  useEffect(() => {
    if (!notebookId || coverType !== 'image') {
      return undefined
    }

    let isActive = true
    let objectUrl = ''

    getNotebookCover(notebookId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        if (isActive) {
          setCoverImage({ key: coverImageFilename || '', url: objectUrl })
        } else {
          URL.revokeObjectURL(objectUrl)
        }
      })
      .catch(() => {
        if (isActive) setCoverImage({ key: coverImageFilename || '', url: '' })
      })

    return () => {
      isActive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [coverImageFilename, coverType, notebookId])

  const coverStyle = coverType === 'color' && coverColor
    ? { backgroundColor: coverColor }
    : undefined
  const coverUrl = coverImage.key === (coverImageFilename || '') ? coverImage.url : ''

  return (
    <div className="notebook-card-v2 dashboard-notebook-card">
      <div className={`notebook-cover notebook-cover--${coverType}`} style={coverStyle}>
        {coverType === 'image' && coverUrl ? (
          <img alt="" src={coverUrl} />
        ) : coverType !== 'color' ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100" y2="100" stroke="#E5E5E5" strokeWidth="2" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="#E5E5E5" strokeWidth="2" />
          </svg>
        ) : null}
      </div>
      <div className="notebook-info">
        <strong>{title}</strong>
        <span>To-Do : {taskCount ?? 0} tasks</span>
      </div>
    </div>
  )
}

export default NotebookCard
