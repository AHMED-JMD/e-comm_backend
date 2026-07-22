const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      role: {
        type: DataTypes.ENUM("customer", "admin"),
        allowNull: false,
        defaultValue: "customer",
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
        validate: {
          is: /^[0-9]+$/, // Only allow numbers
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      provider: {
        type: DataTypes.ENUM("local", "google"),
        allowNull: false,
        defaultValue: "local",
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeSave: async (user) => {
          if (user.changed("password") && user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    },
  );

  User.prototype.comparePassword = function comparePassword(candidatePassword) {
    if (!this.password) {
      return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
  };

  return User;
};
