const { DataTypes } = require("sequelize");

async function ensureStoreColumns(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  let columns;
  try {
    columns = await queryInterface.describeTable("stores");
  } catch (_error) {
    // Table does not exist yet; regular sequelize.sync() will create it.
    return;
  }

  if (!columns.ownerName) {
    await queryInterface.addColumn("stores", "ownerName", {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: "",
    });
  }

  if (!columns.description) {
    await queryInterface.addColumn("stores", "description", {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  }
}

async function runSafeSchemaSync({ sequelize, shouldSync }) {
  if (!shouldSync) {
    return;
  }

  await sequelize.sync();
  await ensureStoreColumns(sequelize);
}

module.exports = {
  runSafeSchemaSync,
};
