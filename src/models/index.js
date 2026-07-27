const sequelize = require("../config/db");
const UserFactory = require("./user.model");
const StoreFactory = require("./store.model");
const ProductFactory = require("./product.model");
const OrderFactory = require("./order.model");
const OrderItemFactory = require("./order-item.model");

const User = UserFactory(sequelize);
const Store = StoreFactory(sequelize);
const Product = ProductFactory(sequelize);
const Order = OrderFactory(sequelize);
const OrderItem = OrderItemFactory(sequelize);

Store.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(Store, { foreignKey: "createdBy", as: "createdStores" });

Product.belongsTo(Store, { foreignKey: "storeId", as: "store" });
Store.hasMany(Product, { foreignKey: "storeId", as: "products" });

Product.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(Product, { foreignKey: "createdBy", as: "createdProducts" });

Order.belongsTo(Store, { foreignKey: "storeId", as: "store" });
Store.hasMany(Order, { foreignKey: "storeId", as: "orders" });

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });

module.exports = {
  sequelize,
  User,
  Store,
  Product,
  Order,
  OrderItem,
};
