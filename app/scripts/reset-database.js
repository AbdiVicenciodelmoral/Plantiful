const {
  baselinePlants,
  baselineUsers,
  closeDatabase,
  DB_PATH,
  openDatabase,
  resetDatabase,
} = require("../database");

async function main() {
  const db = openDatabase();

  try {
    await resetDatabase(db);
    console.log(`Reset SQLite database at ${DB_PATH}`);
    console.log("Baseline accounts:");

    for (const user of baselineUsers) {
      console.log(`- ${user.username} / ${user.password} (${user.role})`);
    }

    console.log("Baseline plants:");

    for (const plant of baselinePlants) {
      console.log(`- ${plant.name} ($${plant.price})`);
    }
  } finally {
    await closeDatabase(db);
  }
}

main().catch((err) => {
  console.error("Database reset failed:", err.message);
  process.exit(1);
});
