const express = require("express");
const path = require("path");
const {
  DB_PATH,
  initializeDatabase,
  openDatabase,
} = require("./database");

const app = express();
const PORT = 3000;
const CLIENT_DIST_PATH = path.join(__dirname, "..", "client", "dist");

// Open a connection to the SQLite database file.
// If the file does not exist yet, sqlite3 creates it automatically.
const db = openDatabase();

initializeDatabase(db).then(() => {
  console.log(`Connected to SQLite database at ${DB_PATH}`);
}).catch((err) => {
  console.error("Could not initialize SQLite:", err.message);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    return res.status(401).json({
      error: "Please log in first.",
    });
  }

  req.user = user;
  next();
}

function setSessionCookie(res, user) {
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

  return sessionData;
}

app.get("/api/me", (req, res) => {
  res.json({
    user: getCurrentUser(req),
  });
});

app.get("/api/dashboard", requireLogin, (req, res) => {
  res.json({
    user: req.user,
    message: "You reached this API route because the server found a session cookie.",
  });
});

app.get("/api/plants", (req, res) => {
  db.all(
    `
      SELECT id, name, description, price, stock, care_level, light, water, image_url
      FROM plants
      ORDER BY name
    `,
    (err, plants) => {
      if (err) {
        return res.status(500).json({
          error: "Database error while loading plants.",
        });
      }

      res.json({
        plants,
      });
    }
  );
});

app.get("/api/plants/search", (req, res) => {
  const q = req.query.q || "";

  // Intentionally vulnerable for the training playground:
  // This directly inserts the search term into SQL. A learner can try quote
  // characters to break out of the LIKE string and change the query.
  //
  // Remediation point:
  // Use placeholders:
  // WHERE name LIKE ? OR description LIKE ? OR care_level LIKE ?
  const searchQuery = `
    SELECT id, name, description, price, stock, care_level, light, water, image_url
    FROM plants
    WHERE name LIKE '%${q}%'
       OR description LIKE '%${q}%'
       OR care_level LIKE '%${q}%'
    ORDER BY name
  `;

  db.all(searchQuery, (err, plants) => {
    if (err) {
      return res.status(500).json({
        error: "Database error while searching plants.",
      });
    }

    res.json({
      query: q,
      plants,
    });
  });
});

app.post("/api/login", (req, res) => {
  // These values come from the JSON body sent by the React login form.
  const { username, password } = req.body;

  // Intentionally insecure for your training playground:
  // This query directly inserts user input into SQL.
  // That makes the route vulnerable to SQL injection.
  //
  // Secure code would use placeholders like:
  // SELECT * FROM users WHERE username = ? AND password = ?
  const loginQuery = `SELECT id, username, role FROM users WHERE username = '${username}' AND password = '${password}' LIMIT 1`;

  // db.get() runs a SELECT query and returns the first matching row.
  db.get(loginQuery, (err, user) => {
    if (err) {
      return res.status(500).json({
        error: "Database error during login.",
      });
    }

    // If no matching account exists, keep the user on the login page.
    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    const sessionData = setSessionCookie(res, user);

    res.json({
      user: sessionData,
    });
  });
});

app.post("/api/register", (req, res) => {
  const { username = "", password = "" } = req.body;

  // Training note:
  // This currently allows almost any username characters. That is useful for
  // a playground because learners can test how stored data behaves later.
  //
  // Vulnerability introduction point:
  // If this username is later rendered as raw HTML, characters like <, >, ',
  // and " can become part of a stored XSS lesson.
  //
  // Remediation point:
  // Validate allowed username characters, set length limits, and keep output
  // encoded when displaying stored usernames.
  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required.",
    });
  }

  // Training note:
  // This message reveals whether a username already exists. That can become
  // a username-enumeration lesson because attackers can discover valid users.
  //
  // Remediation point:
  // Use a generic response such as "Unable to create account" when you do not
  // want to reveal whether an account already exists.
  const insertUserQuery = `
    INSERT INTO users (username, password, role)
    VALUES (?, ?, 'user')
  `;

  // Remediation example:
  // This route uses placeholders for the INSERT, which prevents quote
  // characters from breaking out of the SQL string. Compare this with the
  // intentionally vulnerable /api/login route above.
  db.run(insertUserQuery, [username, password], function handleInsert(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({
          error: "Username is already taken.",
        });
      }

      return res.status(500).json({
        error: "Database error during account creation.",
      });
    }

    // Training note:
    // Passwords are still stored in plain text in this app. That is
    // intentionally insecure for the playground.
    //
    // Remediation point:
    // Hash passwords with a password hashing algorithm before storing them.
    res.status(201).json({
      message: "Account created. Please log in.",
    });
  });
});

app.post("/api/login-help", (req, res) => {
  const { identifier = "" } = req.body;

  // Intentionally vulnerable for the training playground:
  // This endpoint is supposed to be a "lost username/password" helper, but it
  // directly returns usernames and plaintext passwords. Real applications
  // should never reveal passwords. They should send a time-limited password
  // reset link or code instead.
  //
  // Vulnerability introduction point:
  // The identifier is inserted directly into SQL, so quote characters can break
  // out of the string and change the query. This creates a second SQL injection
  // lesson separate from /api/login.
  //
  // Remediation point:
  // Use placeholders:
  // WHERE username = ? OR email = ?
  const helpQuery = `
    SELECT id, username, password, email, role
    FROM users
    WHERE username = '${identifier}'
       OR email = '${identifier}'
  `;

  db.all(helpQuery, (err, accounts) => {
    if (err) {
      return res.status(500).json({
        error: "Database error during account lookup.",
      });
    }

    // Intentionally vulnerable for the training playground:
    // This message confirms whether an account exists. That is username/email
    // enumeration, which can help attackers build valid target lists.
    //
    // Remediation point:
    // Use a generic response such as:
    // "If an account exists, recovery instructions were sent."
    if (accounts.length === 0) {
      return res.status(404).json({
        error: `No account found for "${identifier}".`,
      });
    }

    res.json({
      message: "Account recovery details found.",
      accounts,
    });
  });
});

app.post("/api/logout", (req, res) => {
  // Setting Max-Age=0 tells the browser to delete the cookie.
  res.setHeader("Set-Cookie", "session=; Path=/; Max-Age=0");
  res.json({
    success: true,
  });
});

// When the React app is built, Express serves those static files.
// During development, Vite serves the React app instead.
app.use(express.static(CLIENT_DIST_PATH));

// Any non-API route should return React's index.html so the frontend router
// can decide which screen to show.
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(CLIENT_DIST_PATH, "index.html"), (err) => {
    if (err) {
      res.status(404).send("React app is not built yet. Run npm install and npm run build in the client folder.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
