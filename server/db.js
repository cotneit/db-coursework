const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

let db = null;

function getDb() {
  if (db) {
    return db;
  }

  db = new sqlite3.Database(process.env.DB_PATH, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log('Connected to the library database.');
  });

  db.run('PRAGMA foreign_keys = ON');

  return db;
}

module.exports = getDb();
