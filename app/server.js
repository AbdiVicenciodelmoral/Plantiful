const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  DB_PATH,
  initializeDatabase,
  openDatabase,
} = require("./database");

const app = express();
const PORT = 3000;
const CLIENT_DIST_PATH = path.join(__dirname, "..", "client", "dist");
const DOCUMENTS_ROOT = path.join(__dirname, "..", "documents");

// Open a connection to the SQLite database file.
// If the file does not exist yet, sqlite3 creates it automatically.

const documentRecords = [
  {
    id: 31,
    name: "Plantiful Monstera Care Guide",
    filename: "plantiful_monstera_care_guide.pdf",
    file: "public/plantiful_monstera_care_guide.pdf",
    type: "PDF",
    category: "Care Guides",
    author: "Plantiful Education",
    uploaded: "2026-08-08",
    visibility: "public",
  },
  {
    id: 32,
    name: "Spring Watering Schedule",
    filename: "spring-watering-schedule.txt",
    file: "public/spring-watering-schedule.txt",
    type: "Text",
    category: "Seasonal Reports",
    author: "Greenhouse Team",
    uploaded: "2026-08-02",
    visibility: "public",
  },
  {
    id: 33,
    name: "Pest Identification Guide",
    filename: "pest-identification-guide.txt",
    file: "public/pest-identification-guide.txt",
    type: "Text",
    category: "Care Guides",
    author: "Plantiful Support",
    uploaded: "2026-07-27",
    visibility: "public",
  },
  {
    id: 34,
    name: "Workshop Notes",
    filename: "workshop-notes.md",
    file: "workshops/workshop-notes.md",
    type: "Markdown",
    category: "Workshop Material",
    author: "Workshop Staff",
    uploaded: "2026-07-21",
    visibility: "public",
  },
  {
    id: 41,
    name: "Deployment Notes",
    filename: "deployment-notes.txt",
    file: "internal/deployment-notes.txt",
    type: "Text",
    category: "Staff Reference",
    author: "Internal IT",
    uploaded: "2026-07-18",
    visibility: "staff",
  },
];
const db = openDatabase();

initializeDatabase(db).then(() => {
  console.log(`Connected to SQLite database at ${DB_PATH}`);
}).catch((err) => {
  console.error("Could not initialize SQLite:", err.message);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Intentionally vulnerable for the training playground:
// The shop page loads product images through:
// /loadImage?filename=calathea.svg
//
// Vulnerability:
// The filename value is joined directly to the image folder path. Because there
// is no validation, learners can use ../ or ..\ to move out of the image folder
// and read other files from the server's filesystem.
//
// Windows-style lab payload:
// /loadImage?filename=..\..\..\..\windows\win.ini
//
// URL-encoded version:
// /loadImage?filename=..%5c..%5c..%5c..%5cwindows%5cwin.ini
//
// Remediation point:
// Use an allowlist of image filenames, reject path separators, and verify that
// the resolved path still starts inside the intended image directory.
app.get("/loadImage", (req, res) => {
  const filename = req.query.filename || "";
  const imageDirectory = path.join(__dirname, "..", "client", "public", "images", "plants");
  const requestedPath = path.join(imageDirectory, filename);

  fs.readFile(requestedPath, (err, fileContents) => {
    if (err) {
      return res.status(404).send("Image not found.");
    }

    if (requestedPath.endsWith(".svg")) {
      res.type("image/svg+xml");
    } else {
      res.type("text/plain");
    }

    res.send(fileContents);
  });
});

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

function requireAdmin(req, res, next) {
  requireLogin(req, res, () => {
    // Intentionally vulnerable for the training playground:
    // This trusts the role value from the browser-controlled session cookie.
    // Because the session cookie is only base64 JSON, learners can tamper with
    // it and give themselves "admin" unless the session design is fixed.
    //
    // Remediation point:
    // Store a signed server-side session id and load the user's role from the DB.
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required.",
      });
    }

    next();
  });
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


function sendDocumentFile(req, res, mode) {
  const requestedFile = req.query.file || "";

  // Intentionally vulnerable for the training playground:
  // The user-controlled file parameter is joined directly to DOCUMENTS_ROOT.
  // This enables path traversal such as:
  // /documents/download?file=../windows/win.ini
  //
  // Remediation point:
  // Resolve the target path, verify it stays inside DOCUMENTS_ROOT, and prefer
  // download-by-id instead of exposing raw filenames.
  const requestedPath = path.join(DOCUMENTS_ROOT, requestedFile);

  fs.readFile(requestedPath, (err, fileContents) => {
    if (err) {
      return res.status(404).send(mode === "preview" ? "Preview not available." : "Document not found.");
    }

    const extension = path.extname(requestedPath).toLowerCase();

    if (extension === ".pdf") {
      res.type("application/pdf");
    } else if (extension === ".md") {
      res.type("text/markdown");
    } else {
      res.type("text/plain");
    }

    res.send(fileContents);
  });
}

app.get("/api/documents", (req, res) => {
  const publicDocuments = documentRecords.filter((document) => {
    return document.visibility === "public";
  });

  res.json({
    documents: publicDocuments,
  });
});

app.get("/api/documents/search", (req, res) => {
  const q = req.query.q || "";
  const lowerQuery = q.toLowerCase();

  const documents = documentRecords.filter((document) => {
    return (
      document.visibility === "public" &&
      (
        document.name.toLowerCase().includes(lowerQuery) ||
        document.category.toLowerCase().includes(lowerQuery) ||
        document.filename.toLowerCase().includes(lowerQuery)
      )
    );
  });

  res.json({
    query: q,
    documents,
  });
});

app.get("/api/documents/:id", (req, res) => {
  const document = documentRecords.find((record) => {
    return String(record.id) === String(req.params.id);
  });

  if (!document) {
    return res.status(404).json({
      error: "Document not found.",
    });
  }

  // Intentionally vulnerable future lesson:
  // This route exposes staff metadata by ID if the learner guesses / changes
  // the document id. A secure app would check authorization before returning
  // non-public records.
  res.json({
    document,
  });
});

app.get("/documents/download", (req, res) => {
  sendDocumentFile(req, res, "download");
});

app.get("/documents/preview", (req, res) => {
  sendDocumentFile(req, res, "preview");
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


app.get("/api/plants/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    `
      SELECT id, name, description, price, stock, care_level, light, water, image_url
      FROM plants
      WHERE id = ?
    `,
    [id],
    (err, plant) => {
      if (err) {
        return res.status(500).json({
          error: "Database error while loading plant details.",
        });
      }

      if (!plant) {
        return res.status(404).json({
          error: `No plant found with id ${id}.`,
        });
      }

      res.json({
        plant,
      });
    }
  );
});

app.post("/api/orders", requireLogin, (req, res) => {
  const { plantId, quantity = 1 } = req.body;

  if (!plantId) {
    return res.status(400).json({
      error: "A plant id is required.",
    });
  }

  // Training note:
  // This trusts the plantId and quantity from the browser. Later this can become
  // a business-logic lesson for quantity abuse, price tampering, and order IDOR.
  db.run(
    `
      INSERT INTO orders (user_id, plant_id, quantity)
      VALUES (?, ?, ?)
    `,
    [req.user.id, plantId, Number(quantity)],
    function handleOrderInsert(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while creating order.",
        });
      }

      res.status(201).json({
        message: "Order created.",
        order: {
          id: this.lastID,
          userId: req.user.id,
          plantId,
          quantity: Number(quantity),
          status: "created",
        },
      });
    }
  );
});


app.get("/api/wishlist", requireLogin, (req, res) => {
  db.all(
    `
      SELECT
        wishlist_items.id AS wishlist_id,
        wishlist_items.user_id,
        wishlist_items.created_at,
        plants.id AS plant_id,
        plants.name,
        plants.description,
        plants.price,
        plants.stock,
        plants.care_level,
        plants.light,
        plants.water,
        plants.image_url
      FROM wishlist_items
      JOIN plants ON plants.id = wishlist_items.plant_id
      WHERE wishlist_items.user_id = ?
      ORDER BY wishlist_items.created_at DESC, wishlist_items.id DESC
    `,
    [req.user.id],
    (err, items) => {
      if (err) {
        return res.status(500).json({
          error: "Database error while loading wishlist.",
          details: err.message,
        });
      }

      res.json({
        items,
      });
    }
  );
});

app.delete("/api/wishlist/:id", requireLogin, (req, res) => {
  const { id } = req.params;

  // Intentionally vulnerable for the training playground:
  // This deletes a wishlist row by URL id and only checks that the requester is
  // logged in. It does NOT check:
  // WHERE id = ? AND user_id = ?
  //
  // That means a logged-in learner can try changing the wishlist id and may
  // delete another user's saved plant. This is the wishlist IDOR lesson.
  //
  // Remediation point:
  // Add the ownership check with req.user.id.
  db.run(
    `
      DELETE FROM wishlist_items
      WHERE id = ?
    `,
    [id],
    function handleDelete(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while removing wishlist item.",
          details: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: `No wishlist item found with id ${id}.`,
        });
      }

      res.json({
        message: "Wishlist item removed.",
      });
    }
  );
});
app.post("/api/wishlist", requireLogin, (req, res) => {
  const { plantId } = req.body;

  if (!plantId) {
    return res.status(400).json({
      error: "A plant id is required.",
    });
  }

  // Training note:
  // This creates a simple favorite/wishlist record. Future routes can expose
  // wishlist item IDs for IDOR practice around ownership checks.
  db.run(
    `
      INSERT INTO wishlist_items (user_id, plant_id)
      VALUES (?, ?)
    `,
    [req.user.id, plantId],
    function handleWishlistInsert(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while saving wishlist item.",
        });
      }

      res.status(201).json({
        message: "Plant added to wishlist.",
        wishlistItem: {
          id: this.lastID,
          userId: req.user.id,
          plantId,
        },
      });
    }
  );
});
app.get("/api/reviews", (req, res) => {
  db.all(
    `
      SELECT
        reviews.id,
        reviews.user_id,
        reviews.plant_name,
        reviews.display_name,
        reviews.title,
        reviews.body,
        reviews.rating,
        reviews.created_at,
        reviews.updated_at,
        users.username AS account_username
      FROM reviews
      JOIN users ON users.id = reviews.user_id
      ORDER BY reviews.updated_at DESC, reviews.id DESC
    `,
    (err, reviews) => {
      if (err) {
        return res.status(500).json({
          error: "Database error while loading reviews.",
        });
      }

      res.json({
        reviews,
      });
    }
  );
});

app.post("/api/reviews", requireLogin, (req, res) => {
  const {
    plantName = "",
    displayName = "",
    title = "",
    body = "",
    rating = 5,
  } = req.body;

  if (!plantName || !displayName || !title || !body) {
    return res.status(400).json({
      error: "Plant, display name, title, and review are required.",
    });
  }

  // Intentionally vulnerable training note:
  // This stores displayName, title, and body exactly as submitted. That becomes
  // stored XSS because the React reviews page intentionally renders those
  // stored fields as raw HTML.
  db.run(
    `
      INSERT INTO reviews (user_id, plant_name, display_name, title, body, rating)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [req.user.id, plantName, displayName, title, body, Number(rating)],
    function handleInsert(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while saving review.",
        });
      }

      res.status(201).json({
        message: "Review saved.",
        reviewId: this.lastID,
      });
    }
  );
});

app.put("/api/reviews/:id", requireLogin, (req, res) => {
  const { id } = req.params;
  const {
    plantName = "",
    displayName = "",
    title = "",
    body = "",
    rating = 5,
  } = req.body;

  if (!plantName || !displayName || !title || !body) {
    return res.status(400).json({
      error: "Plant, display name, title, and review are required.",
    });
  }

  // Intentionally vulnerable for the training playground:
  // This update trusts the review id from the URL and only checks that the
  // requester is logged in. It does NOT check:
  // WHERE id = ? AND user_id = ?
  // Any logged-in user can edit another user's review if they discover or
  // guess the review id. That is the IDOR lesson.
  db.run(
    `
      UPDATE reviews
      SET plant_name = ?,
          display_name = ?,
          title = ?,
          body = ?,
          rating = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [plantName, displayName, title, body, Number(rating), id],
    function handleUpdate(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while updating review.",
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: `No review found with id ${id}.`,
        });
      }

      res.json({
        message: "Review updated.",
      });
    }
  );
});


app.post("/api/checkout/orders", requireLogin, (req, res) => {
  const {
    items = [],
    shipping = {},
    payment = {},
    subtotal = 0,
    shippingCost = 0,
    total = 0,
  } = req.body;

  if (!items.length) {
    return res.status(400).json({
      error: "Your cart is empty.",
    });
  }

  if (!shipping.fullName || !shipping.email || !shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
    return res.status(400).json({
      error: "Shipping information is incomplete.",
    });
  }

  if (!payment.cardholderName || !payment.cardNumber || !payment.expiration || !payment.cvv || !payment.billingZip) {
    return res.status(400).json({
      error: "Payment information is incomplete.",
    });
  }

  // Intentionally vulnerable training note:
  // This stores fake payment details, delivery notes, and client-provided
  // totals directly. That creates future lessons around sensitive data storage,
  // price tampering, stored XSS in notes, and business-logic validation.
  //
  // Remediation point:
  // Never store real card data, calculate totals server-side, tokenize payment
  // details with a payment provider, and encode/sanitize user-controlled notes.
  db.run(
    `
      INSERT INTO checkout_orders (
        user_id,
        items_json,
        shipping_name,
        shipping_email,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_zip,
        delivery_notes,
        payment_name,
        payment_card_number,
        payment_expiration,
        payment_cvv,
        payment_billing_zip,
        subtotal,
        shipping_cost,
        total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      req.user.id,
      JSON.stringify(items),
      shipping.fullName,
      shipping.email,
      shipping.address,
      shipping.city,
      shipping.state,
      shipping.zip,
      shipping.notes || "",
      payment.cardholderName,
      payment.cardNumber,
      payment.expiration,
      payment.cvv,
      payment.billingZip,
      Number(subtotal),
      Number(shippingCost),
      Number(total),
    ],
    function handleCheckoutOrderInsert(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while placing order.",
          details: err.message,
        });
      }

      res.status(201).json({
        message: "Order placed.",
        order: {
          id: this.lastID,
          total: Number(total),
        },
      });
    }
  );
});


app.get("/api/checkout/orders", requireLogin, (req, res) => {
  db.all(
    `
      SELECT
        id,
        user_id,
        items_json,
        shipping_name,
        shipping_city,
        shipping_state,
        total,
        status,
        created_at
      FROM checkout_orders
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
    `,
    [req.user.id],
    (err, orders) => {
      if (err) {
        return res.status(500).json({
          error: "Database error while loading order history.",
        });
      }

      const parsedOrders = orders.map((order) => {
        let items = [];

        try {
          items = JSON.parse(order.items_json);
        } catch {
          items = [];
        }

        return {
          ...order,
          items,
        };
      });

      res.json({
        orders: parsedOrders,
      });
    }
  );
});
app.get("/api/checkout/orders/:id", requireLogin, (req, res) => {
  const { id } = req.params;

  // Intentionally vulnerable future lesson:
  // This route looks up an order by id but does not check that user_id matches
  // req.user.id. That means direct order URLs can become an IDOR exercise.
  //
  // Remediation point:
  // Add: WHERE id = ? AND user_id = ?
  db.get(
    `
      SELECT *
      FROM checkout_orders
      WHERE id = ?
    `,
    [id],
    (err, order) => {
      if (err) {
        return res.status(500).json({
          error: "Database error while loading order.",
        });
      }

      if (!order) {
        return res.status(404).json({
          error: `No order found with id ${id}.`,
        });
      }

      res.json({
        order,
      });
    }
  );
});

app.get("/api/workshop-registrations", requireLogin, (req, res) => {
  db.all(
    `
      SELECT
        id,
        user_id,
        workshop_id,
        workshop_title,
        workshop_schedule,
        preferred_name,
        email,
        status,
        created_at
      FROM workshop_registrations
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
    `,
    [req.user.id],
    (err, registrations) => {
      if (err) {
        return res.status(500).json({
          error: "Database error while loading workshop registrations.",
          details: err.message,
        });
      }

      res.json({
        registrations,
      });
    }
  );
});

app.post("/api/workshop-registrations", requireLogin, (req, res) => {
  const {
    workshopId = "",
    workshopTitle = "",
    workshopSchedule = "",
    preferredName = "",
    email = "",
  } = req.body;

  if (!workshopId || !workshopTitle || !workshopSchedule || !preferredName || !email) {
    return res.status(400).json({
      error: "Workshop, preferred name, and email are required.",
    });
  }

  // Training note:
  // This stores user-supplied preferredName and email exactly as submitted.
  // Later, if an admin page renders these values as raw HTML, this can become
  // a stored XSS lesson.
  db.run(
    `
      INSERT INTO workshop_registrations (
        user_id,
        workshop_id,
        workshop_title,
        workshop_schedule,
        preferred_name,
        email
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      req.user.id,
      workshopId,
      workshopTitle,
      workshopSchedule,
      preferredName,
      email,
    ],
    function handleInsert(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while saving workshop registration.",
          details: err.message,
        });
      }

      res.status(201).json({
        message: "Workshop seat reserved.",
        registration: {
          id: this.lastID,
          workshopId,
          workshopTitle,
          workshopSchedule,
          preferredName,
          email,
          status: "reserved",
        },
      });
    }
  );
});

app.delete("/api/workshop-registrations/:id", requireLogin, (req, res) => {
  const { id } = req.params;

  // Intentionally vulnerable for the training playground:
  // This deletes a registration by id and only checks that the requester is
  // logged in. It does NOT check ownership with:
  // WHERE id = ? AND user_id = ?
  //
  // That makes workshop cancellation another IDOR exercise.
  db.run(
    `
      DELETE FROM workshop_registrations
      WHERE id = ?
    `,
    [id],
    function handleDelete(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while canceling workshop registration.",
          details: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: `No workshop registration found with id ${id}.`,
        });
      }

      res.json({
        message: "Workshop registration canceled.",
      });
    }
  );
});

app.get("/api/admin/users", requireAdmin, (req, res) => {
  db.all(
    `
      SELECT id, username, email, role
      FROM users
      ORDER BY id
    `,
    (err, users) => {
      if (err) {
        return res.status(500).json({
          error: "Database error while loading users.",
          details: err.message,
        });
      }

      res.json({
        users,
      });
    }
  );
});

app.patch("/api/admin/users/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { role = "user" } = req.body;
  const allowedRoles = ["user", "manager", "admin"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      error: "Role must be user, manager, or admin.",
    });
  }

  // Training note:
  // This lets an admin change roles. Because admin authorization currently
  // trusts a tamperable cookie, this becomes a privilege-escalation exercise.
  db.run(
    `
      UPDATE users
      SET role = ?
      WHERE id = ?
    `,
    [role, id],
    function handleRoleUpdate(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while updating user.",
          details: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: `No user found with id ${id}.`,
        });
      }

      res.json({
        message: "User role updated.",
      });
    }
  );
});

app.delete("/api/admin/users/:id", requireAdmin, (req, res) => {
  const { id } = req.params;

  if (String(req.user.id) === String(id)) {
    return res.status(400).json({
      error: "You cannot delete your own active admin account.",
    });
  }

  // Training note:
  // This deletes a user and related learner-created records. The route is
  // admin-only, but admin status is currently based on a weak cookie, making
  // this useful for broken access-control and privilege-escalation testing.
  db.serialize(() => {
    db.run("DELETE FROM reviews WHERE user_id = ?", [id]);
    db.run("DELETE FROM wishlist_items WHERE user_id = ?", [id]);
    db.run("DELETE FROM orders WHERE user_id = ?", [id]);
    db.run("DELETE FROM checkout_orders WHERE user_id = ?", [id]);
    db.run("DELETE FROM workshop_registrations WHERE user_id = ?", [id]);
    db.run(
      "DELETE FROM users WHERE id = ?",
      [id],
      function handleUserDelete(err) {
        if (err) {
          return res.status(500).json({
            error: "Database error while deleting user.",
            details: err.message,
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            error: `No user found with id ${id}.`,
          });
        }

        res.json({
          message: "User deleted.",
        });
      }
    );
  });
});

app.get("/api/admin/workshop-registrations", requireAdmin, (req, res) => {
  db.all(
    `
      SELECT
        workshop_registrations.id,
        workshop_registrations.user_id,
        users.username,
        workshop_registrations.workshop_id,
        workshop_registrations.workshop_title,
        workshop_registrations.workshop_schedule,
        workshop_registrations.preferred_name,
        workshop_registrations.email,
        workshop_registrations.status,
        workshop_registrations.created_at
      FROM workshop_registrations
      JOIN users ON users.id = workshop_registrations.user_id
      ORDER BY workshop_registrations.created_at DESC, workshop_registrations.id DESC
    `,
    (err, registrations) => {
      if (err) {
        return res.status(500).json({
          error: "Database error while loading workshop registrations.",
          details: err.message,
        });
      }

      res.json({
        registrations,
      });
    }
  );
});

app.delete("/api/admin/workshop-registrations/:id", requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run(
    `
      DELETE FROM workshop_registrations
      WHERE id = ?
    `,
    [id],
    function handleAdminWorkshopDelete(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while canceling workshop registration.",
          details: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: `No workshop registration found with id ${id}.`,
        });
      }

      res.json({
        message: "Workshop registration canceled.",
      });
    }
  );
});

app.get("/api/admin/orders", requireAdmin, (req, res) => {
  db.all(
    `
      SELECT
        checkout_orders.id,
        checkout_orders.user_id,
        users.username,
        checkout_orders.items_json,
        checkout_orders.shipping_name,
        checkout_orders.shipping_email,
        checkout_orders.shipping_city,
        checkout_orders.shipping_state,
        checkout_orders.total,
        checkout_orders.status,
        checkout_orders.created_at
      FROM checkout_orders
      JOIN users ON users.id = checkout_orders.user_id
      ORDER BY checkout_orders.created_at DESC, checkout_orders.id DESC
    `,
    (err, orders) => {
      if (err) {
        return res.status(500).json({
          error: "Database error while loading orders.",
          details: err.message,
        });
      }

      const parsedOrders = orders.map((order) => {
        let items = [];

        try {
          items = JSON.parse(order.items_json);
        } catch {
          items = [];
        }

        return {
          ...order,
          items,
        };
      });

      res.json({
        orders: parsedOrders,
      });
    }
  );
});

app.patch("/api/admin/orders/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status = "processing" } = req.body;
  const allowedStatuses = ["created", "processing", "shipped", "canceled", "refunded"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: "Invalid order status.",
    });
  }

  db.run(
    `
      UPDATE checkout_orders
      SET status = ?
      WHERE id = ?
    `,
    [status, id],
    function handleOrderStatusUpdate(err) {
      if (err) {
        return res.status(500).json({
          error: "Database error while updating order.",
          details: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: `No order found with id ${id}.`,
        });
      }

      res.json({
        message: "Order status updated.",
      });
    }
  );
});
app.post("/api/login", (req, res) => {
  // These values come from the JSON body sent by the React login form.
  const { username, password } = req.body;

  // Intentionally insecure for your training playground:
  // This first query directly inserts the username into SQL. It checks whether
  // the account exists before checking the password, which lets learners
  // enumerate valid usernames from the different error messages.
  //
  // Remediation point:
  // Use one generic error message for both cases, such as:
  // "Invalid username or password."
  const usernameLookupQuery = `SELECT id, username, role FROM users WHERE username = '${username}' LIMIT 1`;

  db.get(usernameLookupQuery, (err, account) => {
    if (err) {
      return res.status(500).json({
        error: "Database error during login.",
      });
    }

    // Intentionally vulnerable for the training playground:
    // This response tells the learner that the username does not exist.
    // That information leak is username enumeration.
    if (!account) {
      return res.status(401).json({
        error: "Username not found.",
      });
    }

    // Intentionally insecure for your training playground:
    // This second query directly inserts both username and password into SQL.
    // Quote characters can still break out of the string, so the login remains
    // SQL-injection vulnerable for authorization-bypass practice.
    //
    // Secure code would use placeholders like:
    // SELECT * FROM users WHERE username = ? AND password = ?
    const loginQuery = `SELECT id, username, role FROM users WHERE username = '${username}' AND password = '${password}' LIMIT 1`;

    db.get(loginQuery, (loginErr, user) => {
      if (loginErr) {
        return res.status(500).json({
          error: "Database error during login.",
        });
      }

      // Intentionally vulnerable for the training playground:
      // This response tells the learner that the username exists, but the
      // password is wrong. That confirms a valid account name.
      if (!user) {
        return res.status(401).json({
          error: "Password is incorrect.",
        });
      }

      const sessionData = setSessionCookie(res, user);

      res.json({
        user: sessionData,
      });
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









