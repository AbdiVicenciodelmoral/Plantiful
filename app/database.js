const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = process.env.PLANTIFUL_DB_PATH || path.join(__dirname, "..", "db", "plantiful.db");

// Baseline accounts that should exist after every reset.
// Keep these useful for demos, SQL injection tests, role checks, and data theft labs.
const baselineUsers = [
  {
    username: "admin",
    password: "GreenhouseAdmin!23",
    email: "admin@plantiful.local",
    role: "admin",
  },
  {
    username: "johnson123",
    password: "MapleDesk2026",
    email: "johnson123@plantiful.local",
    role: "user",
  },
  {
    username: "maria.gomez",
    password: "MonsteraSun18",
    email: "maria.gomez@plantiful.local",
    role: "user",
  },
  {
    username: "sarah.lee",
    password: "PothosShelf44",
    email: "sarah.lee@plantiful.local",
    role: "user",
  },
  {
    username: "michael.chen",
    password: "SnakePlant72",
    email: "michael.chen@plantiful.local",
    role: "user",
  },
  {
    username: "jasmine.w",
    password: "CalatheaMist9",
    email: "jasmine.w@plantiful.local",
    role: "user",
  },
  {
    username: "robert.king",
    password: "SoilMix2026",
    email: "robert.king@plantiful.local",
    role: "manager",
  },
  {
    username: "emily.stone",
    password: "LeafyWindow15",
    email: "emily.stone@plantiful.local",
    role: "user",
  },
  {
    username: "david.martin",
    password: "ZZPlantGarage5",
    email: "david.martin@plantiful.local",
    role: "user",
  },
  {
    username: "nina.patel",
    password: "FiddleFig31",
    email: "nina.patel@plantiful.local",
    role: "user",
  },
];

const baselinePlants = [
  {
    name: "Piranha plant",
    description: "Please keep fingers, pets, and plumbers away from the bloom.",
    price: 24.99,
    stock: 18,
    care_level: "Easy",
    light: "Full sun near sewer entrances",
    water: "Water whenever nearby castles are threatened",
    image_url: "/loadImage?filename=Piranha_plant.PNG",
  },
  {
    name: "Mandrake",
    description: "Make sure to remember your ear muffs.",
    price: 18.99,
    stock: 32,
    care_level: "Easy",
    light: "Low to bright indirect light",
    water: "Water every 2-3 weeks",
    image_url: "/loadImage?filename=Mandrake.svg",
  },
  {
    name: "Venemous Tentacula",
    description: "Produces beautiful vines and regrettable emergency room visits.",
    price: 54.99,
    stock: 25,
    care_level: "Advanced",
    light: "Bright indirect light",
    water: "Water carefully from a safe distance",
    image_url: "/loadImage?filename=Tentacula_(Harry Potter).PNG",
  },
  {
    name: "Audrey II",
    description: "A striking centerpiece with a history of missing owners.",
    price: 99.99,
    stock: 3,
    care_level: "Expert",
    light: "Stage spotlight",
    water: "Requires occasional blood sacrifice",
    image_url: "/loadImage?filename=Audrey2.PNG",
  },
  {
    name: "Wolfsbane",
    description: "Popular for keeping werewolves and nosy neighbors at bay.",
    price: 21.99,
    stock: 20,
    care_level: "Easy",
    light: "Full Moon preferred",
    water: "Water every 2-3 weeks",
    image_url: "/loadImage?filename=Wolfsbane.PNG",
  },
  {
    name: "Glowcaps",
    description: "A mysterious cluster that glows when nobody is watching.",
    price: 44.99,
    stock: 7,
    care_level: "Moderate",
    light: "Thrives in dark caves",
    water: "Mist with suspicious glowing water",
    image_url: "/loadImage?filename=glowing_mushrooms.PNG",
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


async function ensureCommerceTables(db) {
  await run(db, `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plant_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'created',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plant_id) REFERENCES plants(id)
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plant_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plant_id) REFERENCES plants(id)
    )
  `);

  await run(db, `
    CREATE TABLE IF NOT EXISTS checkout_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      items_json TEXT NOT NULL,
      shipping_name TEXT NOT NULL,
      shipping_email TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_state TEXT NOT NULL,
      shipping_zip TEXT NOT NULL,
      delivery_notes TEXT,
      payment_name TEXT NOT NULL,
      payment_card_number TEXT NOT NULL,
      payment_expiration TEXT NOT NULL,
      payment_cvv TEXT NOT NULL,
      payment_billing_zip TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping_cost REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'created',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

async function ensureWorkshopTables(db) {
  await run(db, `
    CREATE TABLE IF NOT EXISTS workshop_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      workshop_id TEXT NOT NULL,
      workshop_title TEXT NOT NULL,
      workshop_schedule TEXT NOT NULL,
      preferred_name TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'reserved',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
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
  await ensureCommerceTables(db);
  await ensureWorkshopTables(db);
  await seedBaselineUsers(db);
  await seedBaselinePlants(db);
  await seedBaselineReviews(db);
}

async function resetDatabase(db) {
  // This intentionally wipes all learner-created accounts and resets IDs.
  await run(db, "DROP TABLE IF EXISTS reviews");
  await run(db, "DROP TABLE IF EXISTS workshop_registrations");
  await run(db, "DROP TABLE IF EXISTS checkout_orders");
  await run(db, "DROP TABLE IF EXISTS wishlist_items");
  await run(db, "DROP TABLE IF EXISTS orders");
  await run(db, "DROP TABLE IF EXISTS plants");
  await run(db, "DROP TABLE IF EXISTS users");
  await createSchema(db);
  await ensureCommerceTables(db);
  await ensureWorkshopTables(db);
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
  ensureCommerceTables,
  ensureWorkshopTables,
  openDatabase,
  resetDatabase,
};







