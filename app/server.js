const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Store the SQLite database outside the app folder, in D:\Plantiful\db.
// __dirname points to D:\Plantiful\App, so ".." moves up to D:\Plantiful.
const DB_PATH = path.join(__dirname, "..", "db", "plantiful.db");

// Open a connection to the SQLite database file.
// If the file does not exist yet, sqlite3 creates it automatically.
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Could not connect to SQLite:", err.message);
    return;
  }

  console.log(`Connected to SQLite database at ${DB_PATH}`);
});

// Create and seed the users table when the app starts.
// serialize() makes SQLite run these setup statements in order.
db.serialize(() => {
  // Intentionally simple for the training playground:
  // passwords are stored in plain text so learners can see bad storage clearly.
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);

  // INSERT OR IGNORE means these accounts are added only if they do not exist.
  // That prevents duplicate users every time the server restarts.
  db.run(`
    INSERT OR IGNORE INTO users (username, password, role)
    VALUES ('admin', 'plantiful123', 'admin')
  `);

  db.run(`
    INSERT OR IGNORE INTO users (username, password, role)
    VALUES ('student', 'learn123', 'user')
  `);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Converts the browser's Cookie header into an object we can read.
// Example:
// Cookie: session=abc123; theme=dark
// becomes:
// { session: "abc123", theme: "dark" }
function parseCookies(req) {
  const cookieHeader = req.headers.cookie || "";

  return cookieHeader.split(";").reduce((cookies, cookiePair) => {
    const [rawName, rawValue] = cookiePair.trim().split("=");

    if (rawName && rawValue) {
      cookies[rawName] = decodeURIComponent(rawValue);
    }

    return cookies;
  }, {});
}

// Reads the current user from the session cookie.
//
// Intentionally insecure for your training playground:
// The cookie is only base64-encoded JSON. Base64 makes text look different,
// but it does not protect or verify it. A learner can modify this cookie and
// make the server believe they are a different user.
function getCurrentUser(req) {
  const cookies = parseCookies(req);

  if (!cookies.session) {
    return null;
  }

  try {
    const decodedSession = Buffer.from(cookies.session, "base64").toString("utf8");
    return JSON.parse(decodedSession);
  } catch {
    return null;
  }
}

// Middleware for routes that require a logged-in user.
// If no user is found in the cookie, the visitor is sent to the login page.
function requireLogin(req, res, next) {
  const user = getCurrentUser(req);

  if (!user) {
    return res.redirect("/login?error=Please log in first.");
  }

  req.user = user;
  next();
}

app.get("/", (req, res) => {
  res.render("home", {
    user: getCurrentUser(req),
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    error: req.query.error || null,
  });
});

app.post("/login", (req, res) => {
  // These values come from the name="" attributes in the login form.
  const { username, password } = req.body;

  // Intentionally insecure for your training playground:
  // This query directly inserts user input into SQL.
  // That makes the route vulnerable to SQL injection.
  //
  // Secure code would use placeholders like:
  // SELECT * FROM users WHERE username = ? AND password = ?
  const loginQuery = `
    SELECT id, username, role
    FROM users
    WHERE username = '${username}'
      AND password = '${password}'
    LIMIT 1
  `;

  // db.get() runs a SELECT query and returns the first matching row.
  db.get(loginQuery, (err, user) => {
    if (err) {
      return res.render("login", {
        error: "Database error during login.",
      });
    }

    // If no matching account exists, keep the user on the login page.
    if (!user) {
      return res.render("login", {
        error: "Invalid username or password.",
      });
    }

    // Intentionally insecure for your training playground:
    // This stores identity and role directly in a browser-controlled cookie.
    // A secure app would use a signed server-side session id instead.
    const sessionData = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const sessionCookie = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    // Set-Cookie tells the browser to save the session cookie.
    // This is also missing security flags on purpose for the lab.
    res.setHeader("Set-Cookie", `session=${encodeURIComponent(sessionCookie)}; Path=/`);

    res.redirect("/dashboard");
  });
});

app.get("/dashboard", requireLogin, (req, res) => {
  res.render("dashboard", {
    user: req.user,
  });
});

app.post("/logout", (req, res) => {
  // Setting Max-Age=0 tells the browser to delete the cookie.
  res.setHeader("Set-Cookie", "session=; Path=/; Max-Age=0");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
