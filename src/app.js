const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

app.get("/api/health", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
