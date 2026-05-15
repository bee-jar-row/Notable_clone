

function NotebookCard({ title, taskCount }) {
  return (
    <div className="notebook-card-v2 dashboard-notebook-card">
      <div className="notebook-cover">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100" y2="100" stroke="#E5E5E5" strokeWidth="2" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="#E5E5E5" strokeWidth="2" />
        </svg>
      </div>
      <div className="notebook-info">
        <strong>{title}</strong>
        <span>To-Do : {taskCount ?? 0} tasks</span>
      </div>
    </div>
  );
}

export default NotebookCard;
