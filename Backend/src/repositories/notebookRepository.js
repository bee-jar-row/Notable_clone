const db = require('../db');
const { randomUUID } = require('crypto');

class Notebook {
  // Create a new notebook
  static create(userId, title, folderId = null) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO notebooks (id, user_id, folder_id, title)
      VALUES (?, ?, ?, ?)
    `).run(id, userId, folderId, title);
    return id;
  }

  // Get all notebooks for a user
  static findAllByUser(userId) {
    return db.prepare('SELECT * FROM notebooks WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  }

  // Get all notebooks inside a folder
  static findByFolder(folderId) {
    return db.prepare('SELECT * FROM notebooks WHERE folder_id = ? ORDER BY created_at DESC').all(folderId);
  }

  static findByFolderAndUser(folderId, userId) {
    return db.prepare(`
      SELECT * FROM notebooks
      WHERE folder_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `).all(folderId, userId);
  }

  // Find notebook by ID
  static findById(id) {
    return db.prepare('SELECT * FROM notebooks WHERE id = ?').get(id);
  }

  static findByIdAndUser(id, userId) {
    return db.prepare('SELECT * FROM notebooks WHERE id = ? AND user_id = ?').get(id, userId);
  }

  // Update notebook
  static update(id, userId, title, folderId) {
    db.prepare('UPDATE notebooks SET title = ?, folder_id = ? WHERE id = ? AND user_id = ?').run(title, folderId, id, userId);
  }

  // Delete notebook
  static delete(id, userId) {
    db.prepare('DELETE FROM notebooks WHERE id = ? AND user_id = ?').run(id, userId);
  }
}

module.exports = Notebook;
