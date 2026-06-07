# Plantiful

Plantiful is a deliberately vulnerable React + Express training app for practicing web security basics in a local lab.

The goal of this project is to build a safe playground where learners can practice finding and understanding common web vulnerabilities. The app is intentionally insecure, so only run it locally or in a controlled training environment.

## Tech Stack

- Node.js
- Express
- React
- Vite
- SQLite
- CSS

## Requirements

Install these before working on the project:

- [Node.js](https://nodejs.org/) 20 or newer
- npm, which comes with Node.js
- Git

You do not need to install SQLite separately right now. The app uses the `sqlite3` npm package, and the local database file is created automatically when the server starts.

## Getting Started

Clone the repo:

```bash
git clone https://github.com/AbdiVicenciodelmoral/Plantiful.git
cd Plantiful
```

Install backend dependencies:

```bash
cd app
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

Start the backend API from `app/`:

```bash
cd ../app
npm start
```

Start the React frontend from `client/` in a second terminal:

```bash
cd client
npm run dev
```

Then open the Vite URL shown in the terminal, usually `http://localhost:5173`.

For backend development with automatic restarts, use this from `app/`:

```bash
npm run dev
```

For a production-style build, run this from `client/`:

```bash
npm run build
```

After that, the Express server can serve the built React app from `http://localhost:3000`.

## Daily Restart Workflow

Use this when you are coming back to the project after your computer was restarted or after the servers were stopped.

Open one PowerShell window for the backend:

```powershell
D:
cd D:\Plantiful\App
npm run dev
```

You should see something like:

```txt
Server running on http://localhost:3000
```

Open a second PowerShell window for the React frontend:

```powershell
D:
cd D:\Plantiful\client
npm run dev
```

You should see a Vite URL, usually:

```txt
http://localhost:5173
```

Keep both PowerShell windows open while you work.

## Which Localhost URL Should I Use?

Use `http://localhost:5173` when you are actively editing the React frontend.

This is the live Vite development server. Changes to files like these update right away:

```txt
client/src/App.jsx
client/src/styles.css
```

Use `http://localhost:3000` when you want to test the backend API or the built version of the site.

The backend always runs on `3000`. It handles API routes like:

```txt
POST /api/login
GET /api/me
POST /api/logout
```

The important difference:

```txt
http://localhost:5173  live React development site
http://localhost:3000  Express backend plus built React app
```

If you edit React or CSS files, `localhost:3000` will not show those frontend changes until you rebuild:

```powershell
D:
cd D:\Plantiful\client
npm run build
```

Simple rule:

```txt
Editing the frontend: use http://localhost:5173
Testing the current built app or API: use http://localhost:3000
```

To stop either server, click inside its PowerShell window and press:

```txt
CTRL + C
```

## Training Accounts

The app seeds these users into SQLite when the server starts:

```txt
admin / plantiful123
student / learn123
```

## Database

The SQLite database is created at:

```txt
db/plantiful.db
```

That file is intentionally ignored by Git because it is generated locally.

To reset the database, stop the server, delete `db/plantiful.db`, and start the server again. The starter users will be recreated automatically.

## Working With Others

Before making changes, pull the latest code:

```bash
git pull
```

Create a branch for your work:

```bash
git checkout -b your-branch-name
```

After making changes, check what changed:

```bash
git status
```

Commit your changes:

```bash
git add .
git commit -m "Describe your change"
```

Push your branch:

```bash
git push -u origin your-branch-name
```

Then open a pull request on GitHub.

## Project Structure

```txt
Plantiful/
  app/
    package.json
    server.js
  client/
    src/
      App.jsx
      main.jsx
      styles.css
    index.html
    package.json
    vite.config.js
  db/
    .gitkeep
  README.md
```

## Docker

Docker support is planned, but this project is still in its beginning stages.

For now, it is better to keep the local setup simple while the app structure, routes, database design, and training challenges are still changing. Once the basic app flow feels stable, Docker will be useful for giving every collaborator the same environment with one command.

Good Docker next steps later:

- Add a `Dockerfile` for the Express API.
- Decide whether React should be built inside the backend image or run as a separate frontend service.
- Add a `.dockerignore`.
- Add a `docker-compose.yml` service for the app.
- Mount the local project for development.
- Decide whether the SQLite database should live in a volume.

## Security Note

This project intentionally contains insecure code for learning purposes, including a SQL injection vulnerability and unsafe cookie-based session handling. Do not deploy it as a real production application.
