const { Sequelize } = require("sequelize");
const env = require("./env");

const sslOptions = env.db.ssl
  ? {
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: env.db.sslRejectUnauthorized,
      },
    }
  : undefined;

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: "mysql",
  logging: false,
  dialectOptions: sslOptions,
});

module.exports = sequelize;
