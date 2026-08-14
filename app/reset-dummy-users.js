const {
  closeDatabase,
  openDatabase,
  resetDatabase,
} = require("./database");

async function reset() {
  const db = openDatabase();

  try {
    await resetDatabase(db);
    console.log("Plantiful database reset with updated baseline users.");
  } finally {
    await closeDatabase(db);
  }
}

reset().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
