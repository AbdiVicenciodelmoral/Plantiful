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

const baselinePlants = [
  {
    name: "Monstera Deliciosa",
    description: "Bold tropical leaves for bright indoor spaces.",
    price: 24.99,
    stock: 18,
    care_level: "Moderate",
    light: "Bright indirect light",
    water: "Water weekly",
    image_url: "/loadImage?filename=monstera.svg",
  },
  {
    name: "Snake Plant",
    description: "Low-maintenance and perfect for beginners.",
    price: 18.99,
    stock: 32,
    care_level: "Easy",
    light: "Low to bright indirect light",
    water: "Water every 2-3 weeks",
    image_url: "/loadImage?filename=snake-plant.svg",
  },
  {
    name: "Pothos",
    description: "A fast-growing trailing plant for shelves and desks.",
    price: 14.99,
    stock: 25,
    care_level: "Easy",
    light: "Low to medium indirect light",
    water: "Water when soil feels dry",
    image_url: "/loadImage?filename=pothos.svg",
  },
  {
    name: "Calathea Orbifolia",
    description: "Round striped leaves that prefer steady humidity.",
    price: 29.99,
    stock: 10,
    care_level: "Advanced",
    light: "Medium indirect light",
    water: "Keep soil lightly moist",
    image_url: "/loadImage?filename=calathea.svg",
  },
  {
    name: "ZZ Plant",
    description: "Glossy leaves and strong drought tolerance.",
    price: 21.99,
    stock: 20,
    care_level: "Easy",
    light: "Low to bright indirect light",
    water: "Water every 2-3 weeks",
    image_url: "/loadImage?filename=zz-plant.svg",
  },
  {
    name: "Fiddle Leaf Fig",
    description: "A statement plant with tall stems and violin-shaped leaves.",
    price: 44.99,
    stock: 7,
    care_level: "Moderate",
    light: "Bright indirect light",
    water: "Water when top soil is dry",
    image_url: "/loadImage?filename=fiddle-leaf-fig.svg",
  },
];

const baselineReviews = [
  {
    id: 1,
    plant_name: "Monstera Deliciosa",
    display_name: "student",
    title: "Big leaves, easy win",
    body: "My monstera arrived healthy and made my room feel less empty.",
    rating: 5,
    username: "student",
  },
  {
    id: 2,
    plant_name: "Snake Plant",
    display_name: "victim",
    title: "Survived my apartment",
    body: "I forgot to water it twice and it still looks good.",
    rating: 4,
    username: "victim",
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

  await run(db, `
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      care_level TEXT NOT NULL,
      light TEXT NOT NULL,
      water TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plant_name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      rating INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
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

async function seedBaselinePlants(db) {
  for (const plant of baselinePlants) {
    await run(
      db,
      `
        INSERT OR IGNORE INTO plants (
          name,
          description,
          price,
          stock,
          care_level,
          light,
          water,
          image_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        plant.name,
        plant.description,
        plant.price,
        plant.stock,
        plant.care_level,
        plant.light,
        plant.water,
        plant.image_url,
      ]
    );

    await run(
      db,
      `
        UPDATE plants
        SET description = ?,
            price = ?,
            stock = ?,
            care_level = ?,
            light = ?,
            water = ?,
            image_url = ?
        WHERE name = ?
      `,
      [
        plant.description,
        plant.price,
        plant.stock,
        plant.care_level,
        plant.light,
        plant.water,
        plant.image_url,
        plant.name,
      ]
    );
  }
}

async function seedBaselineReviews(db) {
  for (const review of baselineReviews) {
    await run(
      db,
      `
        INSERT OR IGNORE INTO reviews (
          id,
          user_id,
          plant_name,
          display_name,
          title,
          body,
          rating
        )
        SELECT
          ?,
          users.id,
          ?,
          ?,
          ?,
          ?,
          ?
        FROM users
        WHERE users.username = ?
      `,
      [
        review.id,
        review.plant_name,
        review.display_name,
        review.title,
        review.body,
        review.rating,
        review.username,
      ]
    );
  }
}

async function initializeDatabase(db) {
  await createSchema(db);
  await ensureEmailColumn(db);
  await seedBaselineUsers(db);
  await seedBaselinePlants(db);
  await seedBaselineReviews(db);
}

async function resetDatabase(db) {
  // This intentionally wipes all learner-created accounts and resets IDs.
  await run(db, "DROP TABLE IF EXISTS reviews");
  await run(db, "DROP TABLE IF EXISTS plants");
  await run(db, "DROP TABLE IF EXISTS users");
  await createSchema(db);
  await seedBaselineUsers(db);
  await seedBaselinePlants(db);
  await seedBaselineReviews(db);
}

module.exports = {
  DB_PATH,
  baselinePlants,
  baselineReviews,
  baselineUsers,
  closeDatabase,
  initializeDatabase,
  openDatabase,
  resetDatabase,
};

