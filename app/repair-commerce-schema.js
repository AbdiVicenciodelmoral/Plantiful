const { closeDatabase, ensureCommerceTables, openDatabase } = require("./database");

async function repair() {
  const db = openDatabase();

  try {
    await ensureCommerceTables(db);
    console.log("Commerce tables are ready.");
  } finally {
    await closeDatabase(db);
  }
}

repair().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
