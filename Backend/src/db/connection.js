const Database = require('better-sqlite3');
const path = require('path');

const dbDir = process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'database') : path.join(__dirname, '../../database');
const fs = require('fs');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'notable.db'));
db.pragma('foreign_keys = ON');

module.exports = db;
