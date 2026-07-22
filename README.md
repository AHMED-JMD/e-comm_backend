# E-commerce Backend

Node.js + Express + MySQL + Sequelize backend with:

- JWT register/login
- Password reset by email
- Google login with Passport

## 1) Setup

1. Copy `.env.example` to `.env`.
2. Update database, JWT, email, and Google OAuth values.
3. Make sure MySQL is running and database exists.

## 2) Install and run

```bash
npm install
npm run dev
```

Server base URL: `http://localhost:5000`

## 3) API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/me` (Bearer token)
- `GET /api/health`

## 4) Request examples

### Register

```json
{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "password": "123456"
}
```

### Login

```json
{
  "email": "ahmed@example.com",
  "password": "123456"
}
```

### Forgot password

```json
{
  "email": "ahmed@example.com"
}
```

### Reset password

```json
{
  "token": "TOKEN_FROM_EMAIL",
  "newPassword": "newStrongPass123"
}
```

## 5) Google OAuth notes

In Google Cloud Console:

- Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
- Use matching `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
