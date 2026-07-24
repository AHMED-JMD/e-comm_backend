const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || "ecomm_db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    ssl:
      process.env.DB_SSL === undefined ? true : process.env.DB_SSL === "true",
    sslRejectUnauthorized:
      process.env.DB_SSL_REJECT_UNAUTHORIZED === undefined
        ? true
        : process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
    sync:
      process.env.DB_SYNC === undefined
        ? process.env.NODE_ENV !== "production"
        : process.env.DB_SYNC === "true",
  },
  jwtSecret: process.env.JWT_SECRET || "change_me_in_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
    from: process.env.EMAIL_FROM || "no-reply@ecomm.local",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:5000/api/auth/google/callback",
  },
};
