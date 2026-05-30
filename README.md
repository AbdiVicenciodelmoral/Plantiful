# Plantiful

Plantiful is a deliberately vulnerable Express/EJS training app for practicing web security basics in a local lab.

The goal of this project is to build a safe playground where learners can practice finding and understanding common web vulnerabilities. The app is intentionally insecure, so only run it locally or in a controlled training environment.

## Tech Stack

- Node.js
- Express
- EJS templates
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

Install app dependencies:

```bash
cd app
npm install
```

Start the server:

```bash
npm start
```

Then open `http://localhost:3000`.

For development with automatic restarts, use:

```bash
npm run dev
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
    public/
      style.css
    views/
      dashboard.ejs
      home.ejs
      login.ejs
    package.json
    server.js
  db/
    .gitkeep
  README.md
```

## Docker

Docker support is planned, but this project is still in its beginning stages.

For now, it is better to keep the local setup simple while the app structure, routes, database design, and training challenges are still changing. Once the basic app flow feels stable, Docker will be useful for giving every collaborator the same environment with one command.

Good Docker next steps later:

- Add a `Dockerfile` for the Express app.
- Add a `.dockerignore`.
- Add a `docker-compose.yml` service for the app.
- Mount the local project for development.
- Decide whether the SQLite database should live in a volume.

## Security Note

This project intentionally contains insecure code for learning purposes, including a SQL injection vulnerability and unsafe cookie-based session handling. Do not deploy it as a real production application.
