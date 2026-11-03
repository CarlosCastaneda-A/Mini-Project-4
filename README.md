# CS-312 Mini-Project 4 – Blog App with React

A blog web application. The Node.js/Express backend from Mini-Project-1 now serves **JSON**, and the EJS
templates have been replaced by a **React** frontend (Vite). Users can sign up / sign in, create posts, and
edit or delete **only their own** posts. Bonus: a **My Profile** page.

No database server is required – data is stored in `server/data.json` (the "No Database" option).

## Run it

You need Node.js 18+. Open **two terminals**:

```bash
# Terminal 1 – backend (http://localhost:8000)
cd server
npm install
npm start

# Terminal 2 – frontend (http://localhost:5173)
cd client
npm install
npm run dev
```

Open http://localhost:5173. Sign up, then create a post. Open the browser console on the Home page: the
fetched posts are logged there (Step 3 connection check).

If the API runs on a different address, copy `client/.env.example` to `client/.env` and change `VITE_API_URL`.

## Project structure

```
CS-312-MiniProject-4/
├── server/
│   ├── server.js            Express JSON API (auth, CRUD, ownership checks, profile)
│   └── package.json
└── client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx         Entry point (Router + AuthProvider)
        ├── App.jsx          Routes + protected route
        ├── api.js           fetch wrapper for every backend call
        ├── styles.css       Original styles + new additions (responsive)
        ├── context/AuthContext.jsx   Current user, signin / signup / signout
        ├── components/
        │   ├── Navbar.jsx
        │   ├── BlogPostForm.jsx      Controlled create-post form
        │   ├── PostList.jsx          Renders posts with .map(), Edit / Delete buttons
        │   └── EditPost.jsx          Edit form pre-filled from props
        └── pages/
            ├── Home.jsx     Create form + category filter + PostList
            ├── Signin.jsx
            ├── Signup.jsx
            └── Profile.jsx  (Bonus) user info + the user's own posts
```

## API

| Method | Route            | Auth | Description |
|--------|------------------|------|-------------|
| POST   | `/auth/signup`   | –    | Create account (`user_id`, `password`, `name`, optional `age`, `occupation`, `city`) → `{token, user}` |
| POST   | `/auth/signin`   | –    | Sign in (`user_id`, `password`) → `{token, user}` |
| GET    | `/auth/me`       | ✔    | Current user (used to restore a session on refresh) |
| POST   | `/auth/signout`  | ✔    | Invalidate the token |
| GET    | `/blogs`         | –    | All posts; `?category=Tech` filters. Each post includes `canEdit` |
| POST   | `/blogs`         | ✔    | Create a post |
| PUT    | `/blogs/:id`     | ✔    | Update – **403** unless you are the creator |
| DELETE | `/blogs/:id`     | ✔    | Delete – **403** unless you are the creator |
| GET    | `/profile`       | ✔    | Current user's details and their posts (bonus) |

Authenticated routes expect the header `Authorization: Bearer <token>`.

## How each step is covered

| Step | Where |
|------|-------|
| 3 – Connect React ↔ backend | `client/src/api.js`, `console.log` in `pages/Home.jsx`, CORS in `server.js` |
| 4 – Sign up / sign in | `pages/Signup.jsx`, `pages/Signin.jsx`, `/auth/*` routes. Passwords are hashed with scrypt; the backend returns success or an error message shown in the form |
| 5 – Post creation | `components/BlogPostForm.jsx` – one `useState` per field, `value` + `onChange`, `onSubmit` with `preventDefault()` |
| 6 – Post viewing | `components/PostList.jsx` – `posts.map(...)` showing title, content, author, date, category |
| 7 – Post editing | `components/EditPost.jsx` (pre-filled via props). Backend checks ownership and returns `canEdit`; the updated post replaces the old one in state |
| 8 – Post deletion | `PostList` → `DELETE /blogs/:id`; removed from state on success |
| 9 – Styling | `client/src/styles.css` – responsive, with a mobile breakpoint |
| Bonus – My Profile | `pages/Profile.jsx` + `GET /profile` |

## Manual test checklist (Step 10)

1. Sign up as `alice`, then sign up as `bob` in a private window.
2. As alice, create a post → it appears at the top without a page reload.
3. As bob, confirm alice's post has **no** Edit / Delete buttons.
4. As alice, edit the post (try changing its category) and then delete a post.
5. Use the category filter on Home.
6. Refresh the page – you stay signed in. Sign out – Edit/Delete disappear and `/profile` redirects to sign in.
7. Visit `/profile` as alice – details and only her posts are shown.
8. Resize the browser to phone width to check the layout.

## Notes for the video (3–5 minutes)

- **Architecture:** EJS views replaced by a React SPA; Express now only returns JSON.
- **Auth:** scrypt-hashed passwords, random bearer token saved in `localStorage`, `AuthContext` restores it on refresh.
- **Ownership:** the backend is the source of truth (403), and it also sends `canEdit` so the UI hides buttons.
- **Controlled forms:** state per field, `value`/`onChange`, `preventDefault`.
- **Dynamic updates:** create/update/delete modify the `posts` state in `Home`, so the list changes instantly.
- **Challenges to mention:** CORS between ports 5173 and 8000; knowing which user is asking in order to compute `canEdit`; keeping the list in sync when a post's category changes while a filter is active.
