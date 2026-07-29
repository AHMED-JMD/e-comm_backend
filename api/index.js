let bootstrapPromise;

// Ensure mysql2 is included in the serverless bundle (Sequelize loads it dynamically).
require("mysql2");

function getPath(req) {
  return (req.url || "").split("?")[0];
}

function summarizeBootstrapError(error) {
  return {
    name: error?.name || "Error",
    code: error?.code || error?.parent?.code || "UNKNOWN",
    errno: error?.errno || error?.parent?.errno || null,
    sqlState: error?.sqlState || error?.parent?.sqlState || null,
    message: error?.message || "Unknown error",
  };
}

async function bootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const app = require("../src/app");
      const env = require("../src/config/env");
      const { sequelize } = require("../src/models");
      const { runSafeSchemaSync } = require("../src/utils/schema-sync");

      await sequelize.authenticate();
      await runSafeSchemaSync({ sequelize, shouldSync: env.db.sync });

      return app;
    })().catch((error) => {
      bootstrapPromise = undefined;
      throw error;
    });
  }

  return bootstrapPromise;
}

module.exports = async (req, res) => {
  const path = getPath(req);

  // Keep base health checks independent from DB availability.
  if (path === "/api/health" || path === "/health") {
    return res.status(200).json({ status: "ok" });
  }

  // Optional DB diagnostic endpoint to debug deployment issues quickly.
  if (path === "/api/health/db" || path === "/health/db") {
    try {
      const env = require("../src/config/env");
      const { sequelize } = require("../src/models");
      await sequelize.authenticate();
      return res.status(200).json({
        status: "ok",
        db: "connected",
      });
    } catch (error) {
      const summary = summarizeBootstrapError(error);
      console.error("DB diagnostic failed:", summary);
      return res
        .status(503)
        .json({ status: "error", db: "unreachable", ...summary });
    }
  }

  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    const summary = summarizeBootstrapError(error);
    console.error("Serverless bootstrap failed:", summary);
    return res
      .status(503)
      .json({ message: "Service unavailable", code: summary.code });
  }
};
