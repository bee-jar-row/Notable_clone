const db = require('../db');
const { randomUUID } = require('crypto');

class User {
  // Create a new user
  static create(name, email, passwordHash, displayName) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, display_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, email, passwordHash, displayName);
    return id;
  }

  // Find user by email
  static findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  // Find user by ID
  static findById(id) {
    return db.prepare('SELECT id, name, email, display_name, role, created_at FROM users WHERE id = ?').get(id);
  }

  static findPublicById(id) {
    return db.prepare(`
      SELECT id, name, email, display_name, gcal_url, role, created_at
      FROM users
      WHERE id = ?
    `).get(id);
  }

  // Find user by reset token
  static findByResetToken(token) {
    return db.prepare('SELECT * FROM users WHERE reset_token = ?').get(token);
  }

  // Save reset token and expiry
  static saveResetToken(email, token, expiry) {
    db.prepare(`
      UPDATE users SET reset_token = ?, reset_token_expiry = ?
      WHERE email = ?
    `).run(token, expiry, email);
  }

  // Update password
  static updatePassword(id, passwordHash) {
    db.prepare(`
      UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL
      WHERE id = ?
    `).run(passwordHash, id);
  }

  static updateProfile(id, name, displayName, gcalUrl = null) {
    db.prepare(`
      UPDATE users SET name = ?, display_name = ?, gcal_url = ?
      WHERE id = ?
    `).run(name, displayName, gcalUrl, id);
  }
}

module.exports = User;
