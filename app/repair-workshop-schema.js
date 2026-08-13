const { closeDatabase, ensureWorkshopTables, openDatabase } = require("./database");

async function repair() {
  const db = openDatabase();

  try {
    await ensureWorkshopTables(db);
    console.log("Workshop registration table is ready.");
  } finally {
    await closeDatabase(db);
  }
}

repair().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
