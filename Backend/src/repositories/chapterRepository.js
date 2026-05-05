const db = require('../db');
const { randomUUID } = require('crypto');

class Chapter {
  // Create a new chapter inside a notebook
  static create(notebookId, userId, title, content = '') {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO chapters (id, notebook_id, user_id, title, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, notebookId, userId, title, content);
    return id;
  }

  // Get all chapters inside a notebook
  static findAllByNotebook(notebookId) {
    return db.prepare('SELECT * FROM chapters WHERE notebook_id = ? ORDER BY created_at ASC').all(notebookId);
  }

  static findAllByNotebookAndUser(notebookId, userId) {
    return db.prepare(`
      SELECT * FROM chapters
      WHERE notebook_id = ? AND user_id = ?
      ORDER BY created_at ASC
    `).all(notebookId, userId);
  }

  // Find chapter by ID
  static findById(id) {
    return db.prepare('SELECT * FROM chapters WHERE id = ?').get(id);
  }

  static findByIdAndUser(id, userId) {
    return db.prepare('SELECT * FROM chapters WHERE id = ? AND user_id = ?').get(id, userId);
  }

  // Update chapter
  static update(id, userId, title, content) {
    db.prepare(`
      UPDATE chapters SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(title, content, id, userId);
  }

  // Delete chapter
  static delete(id, userId) {
    db.prepare('DELETE FROM chapters WHERE id = ? AND user_id = ?').run(id, userId);
  }
}

module.exports = Chapter;
