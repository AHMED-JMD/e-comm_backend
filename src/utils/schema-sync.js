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

  if (!columns.categoryId) {
    await queryInterface.addColumn("stores", "categoryId", {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    });
  }
}

async function ensureProductColumns(sequelize) {
  const queryInterface = sequelize.getQueryInterface();

  let columns;
  try {
    columns = await queryInterface.describeTable("products");
  } catch (_error) {
    // Table does not exist yet; regular sequelize.sync() will create it.
    return;
  }

  if (!columns.image) {
    await queryInterface.addColumn("products", "image", {
      type: DataTypes.STRING(255),
      allowNull: true,
    });
  }

  if (!columns.categoryId) {
    await queryInterface.addColumn("products", "categoryId", {
      type: DataTypes.INTEGER.UNSIGNED,
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
  await ensureProductColumns(sequelize);
}

module.exports = {
  runSafeSchemaSync,
};
