const FocusSession = require('../repositories/focusSessionRepository');
const Todo = require('../repositories/todoRepository');
const Note = require('../repositories/noteRepository');
const Resource = require('../repositories/resourceRepository');
const Notebook = require('../repositories/notebookRepository');
const Folder = require('../repositories/folderRepository');
const BHPSLogic = require('../controllers/bhpsLogic');

function getEffort(todo) {
  return Number(todo.estimated_effort) || 1;
}

function getLoadLabel(totalEffort) {
  if (totalEffort >= 14) return 'Heavy';
  if (totalEffort >= 7) return 'Moderate';
  return 'Light';
}

function parseDbDate(value) {
  if (!value) return null;

  const date = new Date(String(value).includes('T')
    ? value
    : `${String(value).replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function resolveDurationMinutes(value, fallback = 50) {
  const duration = Number(value || fallback);
  if (!Number.isInteger(duration) || duration < 5 || duration > 180) {
    return {
      error: {
        status: 400,
        body: { message: 'Focus duration must be between 5 and 180 minutes.' }
      }
    };
  }

  return { duration };
}

function normalizeTodoIds(todoIds) {
  if (!Array.isArray(todoIds)) return [];
  return [...new Set(todoIds.filter(Boolean).map((todoId) => String(todoId)))];
}

function validateTodoIds(userId, todoIds) {
  const validTodos = todoIds.every(todoId => Todo.findByIdAndUser(todoId, userId));
  if (!validTodos) {
    return {
      status: 400,
      body: { message: 'One or more todos were not found!' }
    };
  }

  return null;
}

function buildSessionPayload(sessionId, userId) {
  const session = FocusSession.findByIdAndUser(sessionId, userId);
  if (!session) return null;

  return {
    ...session,
    todos: BHPSLogic.rankTodos(FocusSession.getSessionTodos(sessionId))
  };
}

function buildRecommendedBlock(userId, rankedTodos) {
  const topTodo = rankedTodos[0];
  if (!topTodo) return null;

  const notebooks = Notebook.findAllByUser(userId);
  const folders = Folder.findAllByUser(userId);
  const notebookById = new Map(notebooks.map((notebook) => [notebook.id, notebook]));
  const folderById = new Map(folders.map((folder) => [folder.id, folder]));

  const getFolderId = (todo) => {
    if (todo.folder_id) return todo.folder_id;
    return notebookById.get(todo.notebook_id)?.folder_id || null;
  };

  const topNotebook = notebookById.get(topTodo.notebook_id);
  const topFolderId = getFolderId(topTodo);
  const topFolder = folderById.get(topFolderId);
  const topic = topNotebook
    ? { type: 'notebook', id: topNotebook.id, title: topNotebook.title }
    : topFolder
      ? { type: 'folder', id: topFolder.id, title: topFolder.title }
      : { type: 'general', id: null, title: 'Today' };

  const relatedTodos = rankedTodos.filter((todo) => {
    if (todo.id === topTodo.id) return false;
    if (topTodo.notebook_id && todo.notebook_id === topTodo.notebook_id) return true;
    return topFolderId && getFolderId(todo) === topFolderId;
  });

  const selectedTodos = [topTodo];
  let totalEffort = getEffort(topTodo);

  relatedTodos.some((todo) => {
    if (selectedTodos.length >= 3) return true;
    const nextEffort = getEffort(todo);
    if (totalEffort + nextEffort > 18 && selectedTodos.length > 1) return false;
    selectedTodos.push(todo);
    totalEffort += nextEffort;
    return false;
  });

  const todoIds = new Set(selectedTodos.map((todo) => todo.id));
  const notes = Note.findAllByUser(userId)
    .filter((note) => note.todo_id && todoIds.has(note.todo_id))
    .slice(0, 4);

  const notebookIds = uniqueById(selectedTodos
    .map((todo) => notebookById.get(todo.notebook_id))
    .filter(Boolean))
    .map((notebook) => notebook.id);
  const resources = uniqueById(notebookIds.flatMap((notebookId) => (
    Resource.findByNotebookAndUser(notebookId, userId)
  ))).slice(0, 4);

  const steps = [
    {
      key: 'review',
      title: 'Review context',
      detail: notes.length || resources.length
        ? 'Skim linked notes and resources before starting the main task.'
        : 'Scan the notebook context and recall the goal before starting.',
    },
    {
      key: 'priority-task',
      title: 'Do the highest-impact task',
      detail: topTodo.title,
      todo_id: topTodo.id,
    },
  ];

  if (selectedTodos.length > 1) {
    steps.push({
      key: 'related-work',
      title: 'Continue related work',
      detail: selectedTodos.slice(1).map((todo) => todo.title).join(' / '),
    });
  }

  steps.push({
    key: 'reflect',
    title: 'Reflect briefly',
    detail: 'Capture one short note about what changed, what remains, and the next action.',
  });

  return {
    title: `${topic.title} focus block`,
    reason: `${topTodo.title} has the highest BHPS score, then related work is grouped to reduce context switching.`,
    duration_minutes: 50,
    topic,
    total_estimated_effort: totalEffort,
    cognitive_load: getLoadLabel(totalEffort),
    steps,
    todos: selectedTodos,
    notes,
    resources,
  };
}

function buildFocusSummary(sessionId, userId) {
  const session = FocusSession.findByIdAndUser(sessionId, userId);
  if (!session) return null;

  const rankedTodos = BHPSLogic.rankTodos(FocusSession.getSessionTodos(sessionId));
  const completedTodos = rankedTodos.filter((todo) => todo.is_completed === 1);
  const remainingTodos = rankedTodos.filter((todo) => todo.is_completed !== 1);
  const startedAt = parseDbDate(session.started_at);
  const endedAt = parseDbDate(session.ended_at) || new Date();
  const actualDurationMinutes = startedAt
    ? Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))
    : 0;
  const totalEffort = rankedTodos.reduce((total, todo) => total + getEffort(todo), 0);
  const completedEffort = completedTodos.reduce((total, todo) => total + getEffort(todo), 0);
  const topRemainingTodo = remainingTodos[0] || null;

  return {
    session,
    planned_duration_minutes: Number(session.duration_minutes) || 50,
    actual_duration_minutes: actualDurationMinutes,
    total_todos: rankedTodos.length,
    completed_todos: completedTodos.length,
    remaining_todos: remainingTodos.length,
    completion_rate: rankedTodos.length
      ? Math.round((completedTodos.length / rankedTodos.length) * 100)
      : 0,
    total_estimated_effort: totalEffort,
    completed_estimated_effort: completedEffort,
    remaining_estimated_effort: Math.max(0, totalEffort - completedEffort),
    cognitive_load: getLoadLabel(totalEffort),
    todos: rankedTodos,
    next_action: topRemainingTodo
      ? {
        type: 'continue',
        title: `Continue ${topRemainingTodo.title}`,
        detail: 'This is the highest BHPS task still open from the focus block.',
        todo: topRemainingTodo,
      }
      : {
        type: 'next-block',
        title: 'Start the next BHPS block',
        detail: 'All tasks in this focus block are complete.',
        todo: null,
      },
  };
}

class FocusService {
  static start(userId, body) {
    const durationResult = resolveDurationMinutes(body.duration_minutes);
    if (durationResult.error) return durationResult.error;

    const todoIds = normalizeTodoIds(body.todo_ids);
    const todoError = validateTodoIds(userId, todoIds);
    if (todoError) return todoError;

    const sessionId = FocusSession.create(
      userId,
      durationResult.duration,
      body.title || null,
      body.session_notes || null
    );

    if (todoIds.length > 0) {
      todoIds.forEach(todoId => {
        FocusSession.addTodo(sessionId, todoId);
      });
    }

    return {
      status: 201,
      body: {
        message: 'Focus session started!',
        sessionId,
        duration_minutes: durationResult.duration
      }
    };
  }

  static update(userId, sessionId, body) {
    const session = FocusSession.findByIdAndUser(sessionId, userId);
    if (!session) {
      return { status: 404, body: { message: 'Session not found!' } };
    }

    if (session.is_completed === 1) {
      return { status: 400, body: { message: 'Completed focus sessions cannot be edited.' } };
    }

    const durationResult = resolveDurationMinutes(body.duration_minutes, Number(session.duration_minutes) || 50);
    if (durationResult.error) return durationResult.error;

    const todoIds = normalizeTodoIds(body.todo_ids);
    const todoError = validateTodoIds(userId, todoIds);
    if (todoError) return todoError;

    FocusSession.updateWithTodos(sessionId, userId, {
      durationMinutes: durationResult.duration,
      title: body.title || null,
      sessionNotes: body.session_notes || null
    }, todoIds);

    return {
      status: 200,
      body: {
        message: 'Focus session updated!',
        session: buildSessionPayload(sessionId, userId)
      }
    };
  }

  static end(userId, sessionId) {
    const session = FocusSession.findByIdAndUser(sessionId, userId);
    if (!session) {
      return { status: 404, body: { message: 'Session not found!' } };
    }

    FocusSession.end(sessionId);
    const summary = buildFocusSummary(sessionId, userId);
    return { status: 200, body: { message: 'Focus session ended!', summary } };
  }

  static getSummary(userId, sessionId) {
    const session = FocusSession.findByIdAndUser(sessionId, userId);
    if (!session) {
      return { status: 404, body: { message: 'Session not found!' } };
    }

    const summary = buildFocusSummary(sessionId, userId);
    return { status: 200, body: { summary } };
  }

  static getAll(userId) {
    const sessions = FocusSession.findAllByUser(userId).map((session) => ({
      ...session,
      todos: BHPSLogic.rankTodos(FocusSession.getSessionTodos(session.id))
    }));
    return { status: 200, body: { sessions } };
  }

  static getRecommended(userId) {
    const todos = Todo.findAllByUser(userId);
    const incompleteTodos = todos.filter(t => t.is_completed === 0);
    const ranked = BHPSLogic.rankTodos(incompleteTodos);
    const recommendedBlock = buildRecommendedBlock(userId, ranked);

    return {
      status: 200,
      body: {
        message: 'Recommended todos for your focus session!',
        recommended_todos: ranked.slice(0, 5),
        recommended_block: recommendedBlock
      }
    };
  }
}

module.exports = FocusService;
