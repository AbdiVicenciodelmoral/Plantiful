# Plantiful

Plantiful is a deliberately vulnerable Express/EJS training app for practicing web security basics in a local lab.

## Run locally

```bash
cd app
npm install
npm start
```

Then open `http://localhost:3000`.

## Training Accounts

The app seeds these users into SQLite when the server starts:

```txt
admin / plantiful123
student / learn123
```

## Security Note

This project intentionally contains insecure code for learning purposes, including a SQL injection vulnerability and unsafe cookie-based session handling. Do not deploy it as a real production application.
