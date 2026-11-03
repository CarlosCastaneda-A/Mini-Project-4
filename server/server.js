/**
 * Blog API (Node.js + Express)
 * ----------------------------
 * Replaces the EJS server-side rendering from Mini-Project-1. Every route
 * returns JSON so the React frontend can consume it.
 *
 * Storage: a simple JSON file (data.json) - no database server needed.
 * Auth:    scrypt-hashed passwords + random bearer tokens (no extra packages).
 */
const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");
const CATEGORIES = ["Tech", "Lifestyle", "Education"];

/* ------------------------------------------------------------------ */
/* Tiny JSON-file data store                                           */
/* ------------------------------------------------------------------ */
let db = { users: [], posts: [], sessions: {}, nextPostId: 1 };

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function loadData() {
    try {
        db = { ...db, ...JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) };
    } catch {
        saveData(); // first run: create the file
    }
}

loadData();

/* ------------------------------------------------------------------ */
/* Middleware                                                          */
/* ------------------------------------------------------------------ */
app.use(express.json());

// CORS so the React dev server (different port) can call this API
app.use((req, res, next) => {
    res.set({
        "Access-Control-Allow-Origin": CLIENT_ORIGIN,
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    });
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

// Attaches req.user if a valid "Authorization: Bearer <token>" header is sent
function attachUser(req, res, next) {
    const header = req.get("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const userId = token && db.sessions[token];
    req.user = userId ? db.users.find((u) => u.user_id === userId) || null : null;
    req.token = req.user ? token : null;
    next();
}

// Blocks the request unless the user is signed in
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "You must be signed in to do that." });
    }
    next();
}

app.use(attachUser);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    const [salt, hash] = stored.split(":");
    const attempt = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(attempt, Buffer.from(hash, "hex"));
}

// Never send the password hash to the client
function publicUser(user) {
    const { password, ...safe } = user;
    return safe;
}

// Adds canEdit so the frontend knows whether to show Edit / Delete
function serializePost(post, viewer) {
    return { ...post, canEdit: !!viewer && viewer.user_id === post.creatorId };
}

function createSession(user) {
    const token = crypto.randomBytes(32).toString("hex");
    db.sessions[token] = user.user_id;
    saveData();
    return token;
}

const clean = (v) => (typeof v === "string" ? v.trim() : "");

/* ------------------------------------------------------------------ */
/* Auth routes                                                         */
/* ------------------------------------------------------------------ */
app.post("/auth/signup", (req, res) => {
    const body = req.body || {};
    const user_id = clean(body.user_id).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const name = clean(body.name);
    const occupation = clean(body.occupation);
    const city = clean(body.city);
    const age = body.age === "" || body.age == null ? null : Number(body.age);

    if (!user_id || !password || !name) {
        return res.status(400).json({ error: "User ID, password and name are required." });
    }
    if (!/^[a-z0-9_]{3,20}$/.test(user_id)) {
        return res.status(400).json({
            error: "User ID must be 3-20 characters: letters, numbers or underscores.",
        });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    if (age !== null && (!Number.isInteger(age) || age < 1 || age > 120)) {
        return res.status(400).json({ error: "Age must be a whole number between 1 and 120." });
    }
    if (db.users.some((u) => u.user_id === user_id)) {
        return res.status(409).json({ error: "That User ID is already taken." });
    }

    const user = {
        user_id,
        password: hashPassword(password),
        name,
        age,
        occupation,
        city,
        joinedAt: new Date().toISOString(),
    };
    db.users.push(user);
    const token = createSession(user); // also saves
    res.status(201).json({ token, user: publicUser(user) });
});

app.post("/auth/signin", (req, res) => {
    const body = req.body || {};
    const user_id = clean(body.user_id).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";

    const user = db.users.find((u) => u.user_id === user_id);
    if (!user || !verifyPassword(password, user.password)) {
        // Same message for both cases so we don't reveal which IDs exist
        return res.status(401).json({ error: "Invalid User ID or password." });
    }
    const token = createSession(user);
    res.json({ token, user: publicUser(user) });
});

app.get("/auth/me", requireAuth, (req, res) => {
    res.json({ user: publicUser(req.user) });
});

app.post("/auth/signout", requireAuth, (req, res) => {
    delete db.sessions[req.token];
    saveData();
    res.json({ message: "Signed out." });
});

/* ------------------------------------------------------------------ */
/* Blog routes                                                         */
/* ------------------------------------------------------------------ */

// Read all posts (optionally ?category=Tech)
app.get("/blogs", (req, res) => {
    const category = req.query.category || "All";
    const list = category === "All" ? db.posts : db.posts.filter((p) => p.category === category);
    res.json(list.map((p) => serializePost(p, req.user)));
});

// Create
app.post("/blogs", requireAuth, (req, res) => {
    const body = req.body || {};
    const title = clean(body.title);
    const content = clean(body.content);
    const category = clean(body.category);

    if (!title || !content || !category) {
        return res.status(400).json({ error: "Title, content and category are required." });
    }
    if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ error: "Invalid category." });
    }

    const post = {
        id: db.nextPostId++,
        creatorId: req.user.user_id,
        creator: req.user.name,
        title,
        content,
        category,
        createdAt: new Date().toISOString(),
        updatedAt: null,
    };
    db.posts.unshift(post);
    saveData();
    res.status(201).json(serializePost(post, req.user));
});

// Shared lookup + ownership check for update / delete
function findOwnedPost(req, res) {
    const post = db.posts.find((p) => p.id === parseInt(req.params.id, 10));
    if (!post) {
        res.status(404).json({ error: "Post not found." });
        return null;
    }
    if (post.creatorId !== req.user.user_id) {
        res.status(403).json({ error: "You can only change posts that you created." });
        return null;
    }
    return post;
}

// Update
app.put("/blogs/:id", requireAuth, (req, res) => {
    const post = findOwnedPost(req, res);
    if (!post) return;

    const body = req.body || {};
    const title = clean(body.title);
    const content = clean(body.content);
    const category = clean(body.category);

    if (!title || !content || !category) {
        return res.status(400).json({ error: "Title, content and category are required." });
    }
    if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ error: "Invalid category." });
    }

    post.title = title;
    post.content = content;
    post.category = category;
    post.updatedAt = new Date().toISOString();
    saveData();
    res.json(serializePost(post, req.user));
});

// Delete
app.delete("/blogs/:id", requireAuth, (req, res) => {
    const post = findOwnedPost(req, res);
    if (!post) return;

    db.posts = db.posts.filter((p) => p.id !== post.id);
    saveData();
    res.json({ message: "Post deleted.", id: post.id });
});

/* ------------------------------------------------------------------ */
/* Bonus: My Profile                                                   */
/* ------------------------------------------------------------------ */
app.get("/profile", requireAuth, (req, res) => {
    const posts = db.posts
        .filter((p) => p.creatorId === req.user.user_id)
        .map((p) => serializePost(p, req.user));
    res.json({ user: publicUser(req.user), posts });
});

/* ------------------------------------------------------------------ */
app.use((req, res) => res.status(404).json({ error: "Route not found." }));

app.listen(PORT, () => {
    console.log(`Blog API running at http://localhost:${PORT}`);
});
