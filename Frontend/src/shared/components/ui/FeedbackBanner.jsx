function FeedbackBanner({ error, message, className = '' }) {
  if (!error && !message) return null

  return (
    <>
      {error && <div className={`error ${className}`.trim()} role="alert">{error}</div>}
      {message && <div className={`success ${className}`.trim()} role="status">{message}</div>}
    </>
  )
}

export default FeedbackBanner
