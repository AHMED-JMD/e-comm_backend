const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Store = sequelize.define(
    "Store",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      ownerName: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          is: /^[0-9+\-()\s]+$/,
        },
      },
      createdBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
    },
    {
      tableName: "stores",
      timestamps: true,
    },
  );

  return Store;
};
