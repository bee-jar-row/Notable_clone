const db = require('../db');
const { randomUUID } = require('crypto');

class FocusSession {
  // Create a new focus session
  static create(userId, durationMinutes, title = null, sessionNotes = null) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO focus_sessions (id, user_id, duration_minutes, title, session_notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, durationMinutes, title, sessionNotes);
    return id;
  }

  // End a focus session
  static end(id) {
    db.prepare(`
      UPDATE focus_sessions 
      SET ended_at = CURRENT_TIMESTAMP, is_completed = 1
      WHERE id = ?
    `).run(id);
  }

  // Add todo to focus session
  static addTodo(sessionId, todoId) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO session_todos (id, session_id, todo_id)
      VALUES (?, ?, ?)
    `).run(id, sessionId, todoId);
  }

  static update(id, userId, { durationMinutes, title, sessionNotes }) {
    db.prepare(`
      UPDATE focus_sessions
      SET duration_minutes = ?, title = ?, session_notes = ?
      WHERE id = ? AND user_id = ? AND is_completed = 0
    `).run(durationMinutes, title, sessionNotes, id, userId);
  }

  static replaceTodos(sessionId, todoIds) {
    const replace = db.transaction((nextTodoIds) => {
      db.prepare('DELETE FROM session_todos WHERE session_id = ?').run(sessionId);
      const insert = db.prepare(`
        INSERT INTO session_todos (id, session_id, todo_id)
        VALUES (?, ?, ?)
      `);
      nextTodoIds.forEach((todoId) => {
        insert.run(randomUUID(), sessionId, todoId);
      });
    });

    replace(todoIds);
  }

  static updateWithTodos(id, userId, sessionData, todoIds) {
    const updateSession = db.transaction((nextSessionData, nextTodoIds) => {
      db.prepare(`
        UPDATE focus_sessions
        SET duration_minutes = ?, title = ?, session_notes = ?
        WHERE id = ? AND user_id = ? AND is_completed = 0
      `).run(
        nextSessionData.durationMinutes,
        nextSessionData.title,
        nextSessionData.sessionNotes,
        id,
        userId
      );

      db.prepare('DELETE FROM session_todos WHERE session_id = ?').run(id);
      const insert = db.prepare(`
        INSERT INTO session_todos (id, session_id, todo_id)
        VALUES (?, ?, ?)
      `);
      nextTodoIds.forEach((todoId) => {
        insert.run(randomUUID(), id, todoId);
      });
    });

    updateSession(sessionData, todoIds);
  }

  // Get all todos in a session
  static getSessionTodos(sessionId) {
    return db.prepare(`
      SELECT t.* FROM todos t
      JOIN session_todos st ON t.id = st.todo_id
      WHERE st.session_id = ?
    `).all(sessionId);
  }

  // Get session by ID
  static findById(id) {
    return db.prepare('SELECT * FROM focus_sessions WHERE id = ?').get(id);
  }

  static findByIdAndUser(id, userId) {
    return db.prepare('SELECT * FROM focus_sessions WHERE id = ? AND user_id = ?').get(id, userId);
  }

  // Get all sessions for a user
  static findAllByUser(userId) {
    return db.prepare(`
      SELECT * FROM focus_sessions 
      WHERE user_id = ? 
      ORDER BY started_at DESC
    `).all(userId);
  }

  // Get session summary
  static getSummary(sessionId, userId) {
    const session = FocusSession.findByIdAndUser(sessionId, userId);
    const todos = FocusSession.getSessionTodos(sessionId);
    const completedTodos = todos.filter(t => t.is_completed === 1);

    return {
      session,
      total_todos: todos.length,
      completed_todos: completedTodos.length,
      todos
    };
  }
}

module.exports = FocusSession;
