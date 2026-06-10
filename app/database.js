const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = process.env.PLANTIFUL_DB_PATH || path.join(__dirname, "..", "db", "plantiful.db");

// Baseline accounts that should exist after every reset.
// Keep these useful for demos, SQL injection tests, role checks, and data theft labs.
const baselineUsers = [
  {
    username: "admin",
    password: "plantiful123",
    email: "admin@plantiful.local",
    role: "admin",
  },
  {
    username: "student",
    password: "learn123",
    email: "student@plantiful.local",
    role: "user",
  },
  {
    username: "manager",
    password: "inventory123",
    email: "manager@plantiful.local",
    role: "manager",
  },
  {
    username: "victim",
    password: "password123",
    email: "victim@plantiful.local",
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
      email TEXT UNIQUE,
      role TEXT NOT NULL
    )
  `);
}

async function ensureEmailColumn(db) {
  try {
    // SQLite cannot add a UNIQUE column to an existing table with ALTER TABLE.
    // New reset databases still get the UNIQUE constraint from createSchema().
    // Existing local databases get a plain email column so the migration works.
    await run(db, "ALTER TABLE users ADD COLUMN email TEXT");
  } catch (err) {
    if (!err.message.includes("duplicate column name")) {
      throw err;
    }
  }
}

async function seedBaselineUsers(db) {
  for (const user of baselineUsers) {
    await run(
      db,
      `
        INSERT OR IGNORE INTO users (username, password, email, role)
        VALUES (?, ?, ?, ?)
      `,
      [user.username, user.password, user.email, user.role]
    );

    await run(
      db,
      `
        UPDATE users
        SET password = ?, email = ?, role = ?
        WHERE username = ?
      `,
      [user.password, user.email, user.role, user.username]
    );
  }
}

async function initializeDatabase(db) {
  await createSchema(db);
  await ensureEmailColumn(db);
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
