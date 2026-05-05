const db = require('../db');

function likeTerm(query) {
  return `%${query}%`;
}

class SearchRepository {
  static searchFolders(userId, query) {
    return db.prepare(`
      SELECT id, title, created_at
      FROM folders
      WHERE user_id = ? AND title LIKE ?
      ORDER BY created_at DESC
      LIMIT 8
    `).all(userId, likeTerm(query));
  }

  static searchNotebooks(userId, query) {
    return db.prepare(`
      SELECT id, folder_id, title, created_at
      FROM notebooks
      WHERE user_id = ? AND title LIKE ?
      ORDER BY created_at DESC
      LIMIT 8
    `).all(userId, likeTerm(query));
  }

  static searchTodos(userId, query) {
    return db.prepare(`
      SELECT *
      FROM todos
      WHERE user_id = ? AND title LIKE ?
      ORDER BY created_at DESC
      LIMIT 12
    `).all(userId, likeTerm(query));
  }

  static searchNotes(userId, query) {
    return db.prepare(`
      SELECT notes.*, todos.notebook_id, todos.folder_id, todos.title AS todo_title
      FROM notes
      LEFT JOIN todos ON todos.id = notes.todo_id
      WHERE notes.user_id = ? AND (notes.title LIKE ? OR notes.content LIKE ?)
      ORDER BY notes.created_at DESC
      LIMIT 8
    `).all(userId, likeTerm(query), likeTerm(query));
  }

  static searchChapters(userId, query) {
    return db.prepare(`
      SELECT chapters.*, notebooks.title AS notebook_title
      FROM chapters
      LEFT JOIN notebooks ON notebooks.id = chapters.notebook_id
      WHERE chapters.user_id = ? AND (chapters.title LIKE ? OR chapters.content LIKE ?)
      ORDER BY chapters.updated_at DESC
      LIMIT 8
    `).all(userId, likeTerm(query), likeTerm(query));
  }

  static searchResources(userId, query) {
    return db.prepare(`
      SELECT resources.*, chapters.notebook_id AS chapter_notebook_id, chapters.title AS chapter_title, notebooks.title AS notebook_title
      FROM resources
      LEFT JOIN chapters ON chapters.id = resources.chapter_id
      LEFT JOIN notebooks ON notebooks.id = COALESCE(resources.notebook_id, chapters.notebook_id)
      WHERE resources.user_id = ? AND resources.original_name LIKE ?
      ORDER BY resources.created_at DESC
      LIMIT 8
    `).all(userId, likeTerm(query));
  }
}

module.exports = SearchRepository;
