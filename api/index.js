let bootstrapPromise;

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
  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error("Serverless bootstrap failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
