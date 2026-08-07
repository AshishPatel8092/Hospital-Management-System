# MediCare HMS - Node.js + Express + MySQL (simplified, college-project version)

Everything in one place: the backend serves your existing frontend directly,
so there's only **one thing to run** and **one thing to deploy**.

```
hms_node/
├── server.js              <- start here, this is the whole app's entry point
├── db.js                  <- MySQL connection
├── routes/                <- one file per feature (auth, doctors, patients, appointments, billing, pharmacy)
├── middleware/auth.js     <- login check + role check, used by every route
├── database/schema.sql    <- run this in MySQL first
├── public/                <- your original HTML/CSS/JS, unchanged except login.html + register-p.html now call the API
├── .env.example           <- copy to .env and fill in your MySQL password
└── package.json
```

## Part 1 - Run it on your own computer

**You need:** Node.js (v18+) and MySQL, both installed. That's it — no Java, no Tomcat, no Eclipse.

1. **Create the database.**
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   This creates `hms_db` with all your tables, plus a seed admin login:
   `admin@medicare.com` / `Admin@123`.

2. **Configure your database password.**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and put your real MySQL password in `DB_PASSWORD`. Also change
   `SESSION_SECRET` to any random string (mash the keyboard, doesn't matter what).

3. **Install dependencies.**
   ```bash
   npm install
   ```

4. **Run it.**
   ```bash
   npm start
   ```
   You'll see `HMS server running on http://localhost:3000`.

5. **Open it in a browser:** `http://localhost:3000/login.html`

That's the whole thing — one server, one port, frontend and backend together.
Register a patient, log in, and check MySQL Workbench to see the row actually
land in the `patients` table.

> While developing, `npm run dev` (instead of `npm start`) uses `nodemon`,
> which restarts the server automatically every time you save a file.

## Part 2 - Why this is simpler than the Java version

- **One server instead of two.** `express.static` serves your HTML/CSS/JS
  directly from the same app that runs the API, so there's no separate Live
  Server + Tomcat setup, and no CORS configuration needed at all — the
  browser sees everything as coming from one origin.
- **One command to start it** (`npm start`), not an IDE-driven deploy step.
- **Sessions, not tokens.** Login sets `req.session.user`; every other route
  just reads it back. Nothing to encode/decode by hand.

## Part 3 - Deploy it so anyone can open a link

Two free pieces, both from the same GitHub repo:

1. **Push this project to GitHub** (a new repo, e.g. `hms-project`).

2. **Database — [Aiven for MySQL](https://aiven.io/free-mysql-database)** (always-free tier):
   - Sign up, create a free MySQL service.
   - Once it's ready, open its **Overview** tab for the host, port, username,
     password, and database name.
   - Use their web console (or `mysql` command with those credentials) to run
     your `database/schema.sql` against it — same file, same command as
     locally, just pointed at Aiven's host instead of `localhost`.

3. **App — [Railway](https://railway.app)**:
   - New Project > Deploy from GitHub repo > pick your repo.
   - Under **Variables**, add: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`,
     `DB_NAME` (from Aiven's Overview tab) and `SESSION_SECRET` (any random string).
   - Railway detects `package.json` and runs `npm start` automatically.
   - Once deployed, Railway gives you a public URL like
     `https://hms-project.up.railway.app` — that link *is* your whole project,
     frontend and backend both, live for anyone to open.

That's the entire deployment: no Dockerfile, no server config, no manual
uploading of files.

## What's wired up right now vs. what's left

`login.html` and `register-p.html` (patient registration) already call the
real backend — register a patient, then log in, and it's a real database
round-trip.

`register.html` (doctor), `register-n.html`, and `appointment.html` still
have their old placeholder JS. They follow the exact same pattern:
include `<script src="api.js"></script>`, then replace the fake
local-only handler with a call to `registerDoctor()` / `bookAppointment()` /
`listDoctors()` from `api.js`. Ask if you'd like these wired up the same way.
