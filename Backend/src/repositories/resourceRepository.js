const db = require('../db');
const { randomUUID } = require('crypto');

class Resource {
  // Create a new resource
  static create(userId, filename, originalName, mimetype, size, notebookId = null, chapterId = null) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO resources (id, user_id, notebook_id, chapter_id, filename, original_name, mimetype, size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, notebookId, chapterId, filename, originalName, mimetype, size);
    return id;
  }

  // Get all resources for a user
  static findAllByUser(userId) {
    return db.prepare('SELECT * FROM resources WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  }

  // Get all resources in a notebook
  static findByNotebook(notebookId) {
    return db.prepare('SELECT * FROM resources WHERE notebook_id = ? ORDER BY created_at DESC').all(notebookId);
  }

  static findByNotebookAndUser(notebookId, userId) {
    return db.prepare(`
      SELECT * FROM resources
      WHERE notebook_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `).all(notebookId, userId);
  }

  // Get all resources in a chapter
  static findByChapter(chapterId) {
    return db.prepare('SELECT * FROM resources WHERE chapter_id = ? ORDER BY created_at DESC').all(chapterId);
  }

  static findByChapterAndUser(chapterId, userId) {
    return db.prepare(`
      SELECT * FROM resources
      WHERE chapter_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `).all(chapterId, userId);
  }

  // Find resource by ID
  static findById(id) {
    return db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
  }

  static findByIdAndUser(id, userId) {
    return db.prepare('SELECT * FROM resources WHERE id = ? AND user_id = ?').get(id, userId);
  }

  // Delete resource
  static delete(id, userId) {
    db.prepare('DELETE FROM resources WHERE id = ? AND user_id = ?').run(id, userId);
  }
}

module.exports = Resource;
