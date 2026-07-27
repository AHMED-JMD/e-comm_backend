const app = require("./app");
const env = require("./config/env");
const { sequelize } = require("./models");
const { runSafeSchemaSync } = require("./utils/schema-sync");

async function startServer() {
  try {
    await sequelize.authenticate();
    await runSafeSchemaSync({ sequelize, shouldSync: env.db.sync });

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
