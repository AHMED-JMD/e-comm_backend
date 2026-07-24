let bootstrapPromise;

// Ensure mysql2 is included in the serverless bundle (Sequelize loads it dynamically).
require("mysql2");

function isHealthRequest(req) {
  const path = (req.url || "").split("?")[0];
  return path === "/api/health" || path === "/health";
}

async function bootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const app = require("../src/app");
      const env = require("../src/config/env");
      const { sequelize } = require("../src/models");

      await sequelize.authenticate();

      if (env.db.sync) {
        await sequelize.sync();
      }

      return app;
    })().catch((error) => {
      bootstrapPromise = undefined;
      throw error;
    });
  }

  return bootstrapPromise;
}

module.exports = async (req, res) => {
  // Keep health checks independent from DB availability on serverless cold starts.
  if (isHealthRequest(req)) {
    return res.status(200).json({ status: "ok" });
  }

  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error("Serverless bootstrap failed:", error);
    return res.status(503).json({ message: "Service unavailable" });
  }
};
