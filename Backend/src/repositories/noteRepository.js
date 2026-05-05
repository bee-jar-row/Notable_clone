const db = require('../db');
const { randomUUID } = require('crypto');

class Note {

// Create a new note, optionally linked to a todo
  static create(userId, title, content, todoId = null) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO notes (id, user_id, todo_id, title, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, todoId, title, content);
    return id;
  }

// Get all notes belonging to a specific user
  static findAllByUser(userId) {
    return db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  }

// Find a single note by its ID
  static findById(id) {
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  }

  static findByIdAndUser(id, userId) {
    return db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(id, userId);
  }

// Find all notes linked to a specific todo
  static findByTodoId(todoId) {
    return db.prepare('SELECT * FROM notes WHERE todo_id = ?').all(todoId);
  }

// Update note content
  static update(id, userId, title, content) {
    db.prepare(`
      UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(title, content, id, userId);
  }

// Delete a note by ID
  static delete(id, userId) {
    db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(id, userId);
  }
}

module.exports = Note;
