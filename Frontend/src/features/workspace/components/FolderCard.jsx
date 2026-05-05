

function FolderCard({ title, taskCount }) {
  return (
    <div className="folder-card-wrapper dashboard-folder-card">
      <div className="folder-tab"></div>
      <div className="folder-card">
        <strong>{title}</strong>
        <span>To-Do : {taskCount ?? 0} tasks</span>
      </div>
    </div>
  );
}

export default FolderCard;
