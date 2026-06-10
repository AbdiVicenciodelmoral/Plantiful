const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = process.env.PLANTIFUL_DB_PATH || path.join(__dirname, "..", "db", "plantiful.db");

// Baseline accounts that should exist after every reset.
// Keep these useful for demos, SQL injection tests, role checks, and data theft labs.
const baselineUsers = [
  {
    username: "admin",
    password: "plantiful123",
    role: "admin",
  },
  {
    username: "student",
    password: "learn123",
    role: "user",
  },
  {
    username: "manager",
    password: "inventory123",
    role: "manager",
  },
  {
    username: "victim",
    password: "password123",
    role: "user",
  },
];

function openDatabase() {
  return new sqlite3.Database(DB_PATH);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function handleRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });
}

function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

async function createSchema(db) {
  await run(db, `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);
}

async function seedBaselineUsers(db) {
  for (const user of baselineUsers) {
    await run(
      db,
      `
        INSERT OR IGNORE INTO users (username, password, role)
        VALUES (?, ?, ?)
      `,
      [user.username, user.password, user.role]
    );
  }
}

async function initializeDatabase(db) {
  await createSchema(db);
  await seedBaselineUsers(db);
}

async function resetDatabase(db) {
  // This intentionally wipes all learner-created accounts and resets IDs.
  await run(db, "DROP TABLE IF EXISTS users");
  await createSchema(db);
  await seedBaselineUsers(db);
}

module.exports = {
  DB_PATH,
  baselineUsers,
  closeDatabase,
  initializeDatabase,
  openDatabase,
  resetDatabase,
};
