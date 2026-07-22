const sequelize = require("../config/db");
const UserFactory = require("./user.model");

const User = UserFactory(sequelize);

module.exports = {
  sequelize,
  User,
};
