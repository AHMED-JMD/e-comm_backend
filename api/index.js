const app = require("../src/app");
const env = require("../src/config/env");
const { sequelize } = require("../src/models");

let bootstrapPromise;

async function bootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await sequelize.authenticate();

      if (env.db.sync) {
        await sequelize.sync();
      }
    })();
  }

  return bootstrapPromise;
}

module.exports = async (req, res) => {
  try {
    await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error("Serverless bootstrap failed:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
