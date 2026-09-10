# Deploying this project for free (Render + Aiven)

This app is a long-running Express server with in-memory sessions, so it
needs an always-running host, not a serverless one (Vercel/Netlify won't
work well here without rewriting the auth/session layer). Render's free
Web Service plan is the closest free equivalent to what you had on
Railway.

## 1. Create the free MySQL database (Aiven)

1. Sign up at https://aiven.io (no card required).
2. Create a new service -> MySQL -> Free plan.
3. Once it's running, open the service's "Overview" / connection info
   panel and note: Host, Port, User, Password, Database name.

## 2. Create the base tables

From your own machine, using the `mysql` CLI client:

```
mysql -h <HOST> -P <PORT> -u <USER> -p --ssl-mode=REQUIRED <DATABASE_NAME> < database/schema.sql
```

`schema.sql` no longer drops/creates a database itself (managed hosts
don't allow that from a normal user) - it just creates the tables inside
whichever database you point it at.

Optional sample data:

```
mysql -h <HOST> -P <PORT> -u <USER> -p --ssl-mode=REQUIRED <DATABASE_NAME> < database/migration_2026_08_seed_doctors.sql
```

The other `migration_2026_08_*.sql` files do NOT need to be run by hand -
`migrate.js` runs them automatically every time the server starts.

## 3. Push to GitHub

```
git add .
git commit -m "Prepare for Render + Aiven deployment"
git push
```

(`.env` is already in `.gitignore` - your real secrets never get committed.)

## 4. Deploy on Render

1. Sign up at https://render.com (free, no card required for the free plan).
2. New + -> Web Service -> connect this GitHub repo.
   (Or New + -> Blueprint, which reads the included `render.yaml` and
   pre-fills most fields for you.)
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Instance type: Free

## 5. Set environment variables on Render

In the service's "Environment" tab, add:

| Key             | Value                                  |
|-----------------|-----------------------------------------|
| DB_HOST         | from Aiven                              |
| DB_PORT         | from Aiven                              |
| DB_USER         | from Aiven                              |
| DB_PASSWORD     | from Aiven                              |
| DB_NAME         | from Aiven                              |
| DB_SSL          | true                                    |
| SESSION_SECRET  | any long random string                 |

`PORT` is set automatically by Render - you don't need to add it.

## 6. Verify

Once deployed, visit:

```
https://<your-app-name>.onrender.com/api/health
```

You should see `{"success": true, "message": "API is running."}`.
If not, check the "Logs" tab on Render - `db.js` logs a clear message if
the database connection fails (bad host/password/SSL setting, etc.).

Note: Render's free plan spins the service down after ~15 minutes of
inactivity. The first request after that will take 30-60 seconds to wake
it back up - this is normal on the free tier, not a bug.
