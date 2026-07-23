const app = require("./app");
const env = require("./config/env");
const { sequelize } = require("./models");

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Sync models with the database, altering tables if necessary

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
