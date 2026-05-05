const db = require('./connection');
const { initializeSchema } = require('./schema');

initializeSchema(db);

console.log('Database connected & tables ready!');

module.exports = db;
