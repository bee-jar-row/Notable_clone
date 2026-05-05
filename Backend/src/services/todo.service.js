const Todo = require('../repositories/todoRepository');
const Folder = require('../repositories/folderRepository');
const Notebook = require('../repositories/notebookRepository');
const BHPSLogic = require('../controllers/bhpsLogic');

function resolveTodoTarget(userId, body) {
  const folderId = body.folder_id || null;
  const notebookId = body.notebook_id || null;

  if (folderId && notebookId) {
    return {
      error: { status: 400, body: { message: 'Choose either a folder or a notebook, not both.' } }
    };
  }

  if (folderId && !Folder.findByIdAndUser(folderId, userId)) {
    return {
      error: { status: 404, body: { message: 'Folder not found!' } }
    };
  }

  if (notebookId && !Notebook.findByIdAndUser(notebookId, userId)) {
    return {
      error: { status: 404, body: { message: 'Notebook not found!' } }
    };
  }

  return { folderId, notebookId };
}

function getDefaultReminderAt(deadline) {
  if (!deadline) return null;

  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) return null;

  const reminderDate = new Date(deadlineDate.getTime() - (24 * 60 * 60 * 1000));
  const now = new Date();
  return (reminderDate < now ? now : reminderDate).toISOString();
}

function resolveReminderAt(deadline, reminderAt) {
  if (reminderAt === null) return null;
  if (reminderAt === '') return getDefaultReminderAt(deadline);
  if (reminderAt) return new Date(reminderAt).toISOString();
  return getDefaultReminderAt(deadline);
}

class TodoService {
  static getAll(userId, query) {
    const { search, status, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    let todos;

    if (search) {
      todos = Todo.search(userId, search);
    } else if (status !== undefined) {
      const isCompleted = status === 'completed' ? 1 : 0;
      todos = Todo.filterByStatus(userId, isCompleted);
    } else {
      todos = Todo.findWithPagination(userId, parseInt(limit), parseInt(offset));
    }

    const { total } = Todo.countByUser(userId);
    const rankedTodos = BHPSLogic.rankTodos(todos);

    return {
      status: 200,
      body: {
        todos: rankedTodos,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(total / limit)
        }
      }
    };
  }

  static create(userId, body) {
    const { title, deadline, academic_weight, estimated_effort, reminder_at } = body;
    const target = resolveTodoTarget(userId, body);
    if (target.error) return target.error;
    const reminderAt = resolveReminderAt(deadline, reminder_at);

    const todoId = Todo.create(
      userId,
      title,
      deadline,
      academic_weight || 1.0,
      estimated_effort || 1.0,
      target.folderId,
      target.notebookId,
      reminderAt
    );
    return { status: 201, body: { message: 'Todo created!', todoId } };
  }

  static update(userId, todoId, body) {
    const { title, deadline, academic_weight, estimated_effort, reminder_at } = body;
    const target = resolveTodoTarget(userId, body);
    if (target.error) return target.error;

    const todo = Todo.findByIdAndUser(todoId, userId);
    if (!todo) {
      return { status: 404, body: { message: 'Todo not found!' } };
    }

    Todo.update(
      todoId,
      userId,
      title,
      deadline,
      academic_weight,
      estimated_effort,
      target.folderId,
      target.notebookId,
      resolveReminderAt(deadline, reminder_at)
    );
    return { status: 200, body: { message: 'Todo updated!' } };
  }

  static markComplete(userId, todoId) {
    const todo = Todo.findByIdAndUser(todoId, userId);
    if (!todo) {
      return { status: 404, body: { message: 'Todo not found!' } };
    }

    Todo.markComplete(todoId, userId);
    return { status: 200, body: { message: 'Todo marked as complete!' } };
  }

  static delete(userId, todoId) {
    const todo = Todo.findByIdAndUser(todoId, userId);
    if (!todo) {
      return { status: 404, body: { message: 'Todo not found!' } };
    }

    Todo.delete(todoId, userId);
    return { status: 200, body: { message: 'Todo deleted!' } };
  }
}

module.exports = TodoService;
