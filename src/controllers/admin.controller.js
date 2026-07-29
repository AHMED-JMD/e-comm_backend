const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const {
  Store,
  Product,
  Order,
  OrderItem,
  User,
  Category,
  sequelize,
} = require("../models");
const { UPLOAD_ROOT } = require("../middlewares/upload.middleware");

function deleteProductImageFile(imagePath) {
  if (!imagePath) return;

  const relativePath = imagePath.replace(/^\/?uploads\//, "");
  const fullPath = path.join(UPLOAD_ROOT, relativePath);

  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete product image file:", err);
    }
  });
}

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function buildOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${timestamp}-${rand}`;
}

function parsePagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

async function createStore(req, res) {
  const { name, ownerName, address, description, phone, categoryId } = req.body;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const store = await Store.create({
    name: String(name).trim(),
    ownerName: String(ownerName).trim(),
    address: String(address).trim(),
    description: description ? String(description).trim() : null,
    phone: String(phone).trim(),
    categoryId,
    createdBy: req.user.id,
  });

  return res.status(201).json({
    message: "Store created successfully",
    store,
  });
}

async function listStores(_req, res) {
  const stores = await Store.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "name", "email"],
      },
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
    ],
  });

  return res.status(200).json({ stores });
}

async function updateStore(req, res) {
  const { id } = req.params;
  const { name, ownerName, address, description, phone, categoryId } = req.body;

  const store = await Store.findByPk(id);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  if (categoryId !== undefined) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    store.categoryId = categoryId;
  }

  store.name = String(name).trim();
  store.ownerName = String(ownerName).trim();
  store.description = description ? String(description).trim() : null;
  store.address = String(address).trim();
  store.phone = String(phone).trim();
  await store.save();

  return res.status(200).json({
    message: "Store updated successfully",
    store,
  });
}

async function deleteStore(req, res) {
  const { id } = req.params;

  const store = await Store.findByPk(id);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  const [productsCount, ordersCount] = await Promise.all([
    Product.count({ where: { storeId: store.id } }),
    Order.count({ where: { storeId: store.id } }),
  ]);

  if (productsCount > 0 || ordersCount > 0) {
    return res.status(409).json({
      message:
        "Cannot delete store with existing products or orders. Remove related records first.",
    });
  }

  await store.destroy();
  return res.status(200).json({ message: "Store deleted successfully" });
}

async function createProduct(req, res) {
  const { storeId, name, description, categoryId, price, stock, isActive } =
    req.body;

  const store = await Store.findByPk(storeId);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  const category = await Category.findByPk(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const image = req.file ? `/uploads/products/${req.file.filename}` : null;

  const product = await Product.create({
    storeId,
    name: String(name).trim(),
    description: description ? String(description).trim() : null,
    category: category.name,
    categoryId,
    image,
    price,
    stock,
    isActive: typeof isActive === "boolean" ? isActive : true,
    createdBy: req.user.id,
  });

  return res.status(201).json({
    message: "Product created successfully",
    product,
  });
}

async function updateProductImage(req, res) {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const previousImage = product.image;
  product.image = `/uploads/products/${req.file.filename}`;
  await product.save();
  deleteProductImageFile(previousImage);

  return res.status(200).json({
    message: "Product image updated successfully",
    product,
  });
}

async function removeProductImage(req, res) {
  const { id } = req.params;

  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.image) {
    deleteProductImageFile(product.image);
    product.image = null;
    await product.save();
  }

  return res.status(200).json({
    message: "Product image removed successfully",
    product,
  });
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const { storeId, name, description, categoryId, price, stock, isActive } =
    req.body;

  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (storeId !== undefined) {
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    product.storeId = storeId;
  }

  if (categoryId !== undefined) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    product.categoryId = categoryId;
    product.category = category.name;
  }

  product.name = String(name).trim();
  product.description = description ? String(description).trim() : null;
  product.price = price;

  if (stock !== undefined) {
    product.stock = stock;
  }

  if (typeof isActive === "boolean") {
    product.isActive = isActive;
  }

  await product.save();

  return res.status(200).json({
    message: "Product updated successfully",
    product,
  });
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const orderItemsCount = await OrderItem.count({
    where: { productId: product.id },
  });

  if (orderItemsCount > 0) {
    return res.status(409).json({
      message:
        "Cannot delete product referenced by existing orders. Remove related order items first.",
    });
  }

  const imagePath = product.image;
  await product.destroy();
  deleteProductImageFile(imagePath);

  return res.status(200).json({ message: "Product deleted successfully" });
}

async function listProducts(req, res) {
  const { storeId, category, categoryId, active, search } = req.query;
  const { page, limit, offset } = parsePagination(req.query);

  const where = {};

  if (storeId) {
    where.storeId = Number(storeId);
  }

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  if (category) {
    where.category = {
      [Op.like]: `%${String(category).trim()}%`,
    };
  }

  if (search) {
    const normalized = String(search).trim();
    where[Op.or] = [
      { name: { [Op.like]: `%${normalized}%` } },
      { category: { [Op.like]: `%${normalized}%` } },
    ];
  }

  if (active !== undefined) {
    where.isActive = active === "true";
  }

  const { rows: products, count } = await Product.findAndCountAll({
    where,
    include: [
      {
        model: Store,
        as: "store",
        attributes: ["id", "name", "phone"],
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "name", "email"],
      },
      {
        model: Category,
        as: "categoryInfo",
        attributes: ["id", "name"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return res.status(200).json({
    products,
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages: Math.max(Math.ceil(count / limit), 1),
    },
  });
}

async function listOrders(req, res) {
  const { status, storeId, search } = req.query;
  const { page, limit, offset } = parsePagination(req.query);

  const where = {};

  if (status) {
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid order status filter" });
    }
    where.status = status;
  }

  if (storeId) {
    where.storeId = Number(storeId);
  }

  if (search) {
    const normalized = String(search).trim();
    where[Op.or] = [
      { orderNumber: { [Op.like]: `%${normalized}%` } },
      { customerName: { [Op.like]: `%${normalized}%` } },
    ];
  }

  const { rows: orders, count } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: Store,
        as: "store",
        attributes: ["id", "name", "phone"],
      },
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "category"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  return res.status(200).json({
    orders,
    statuses: ORDER_STATUSES,
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages: Math.max(Math.ceil(count / limit), 1),
    },
  });
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  const order = await Order.findByPk(id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  order.statusUpdatedAt = new Date();
  await order.save();

  return res.status(200).json({
    message: "Order status updated successfully",
    order,
  });
}

async function createOrder(req, res) {
  const { storeId, customerName, totalAmount, itemsCount, notes, orderItems } =
    req.body;

  const store = await Store.findByPk(storeId);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  const normalizedItems = Array.isArray(orderItems) ? orderItems : [];

  if (normalizedItems.length > 0) {
    const productIds = normalizedItems.map((item) => Number(item.productId));
    const uniqueProductIds = [...new Set(productIds)];
    const products = await Product.findAll({
      where: { id: uniqueProductIds, storeId },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({
        message: "One or more order items reference invalid store products",
      });
    }

    const transaction = await sequelize.transaction();

    try {
      const computedItemsCount = normalizedItems.reduce(
        (sum, item) => sum + (Number(item.quantity) || 1),
        0,
      );

      const order = await Order.create(
        {
          orderNumber: buildOrderNumber(),
          storeId,
          customerName: String(customerName).trim(),
          totalAmount,
          itemsCount: computedItemsCount,
          notes: notes ? String(notes).trim() : null,
          status: "pending",
          statusUpdatedAt: new Date(),
        },
        { transaction },
      );

      const payload = normalizedItems.map((item) => {
        const product = productMap.get(Number(item.productId));
        const quantity = Number(item.quantity) || 1;
        const unitPrice = Number(item.unitPrice ?? product.price);

        return {
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice,
          lineTotal: Number((quantity * unitPrice).toFixed(2)),
        };
      });

      await OrderItem.bulkCreate(payload, { transaction });
      await transaction.commit();

      const createdOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: Store,
            as: "store",
            attributes: ["id", "name", "phone"],
          },
          {
            model: OrderItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "name", "category"],
              },
            ],
          },
        ],
      });

      return res.status(201).json({
        message: "Order created successfully",
        order: createdOrder,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  const order = await Order.create({
    orderNumber: buildOrderNumber(),
    storeId,
    customerName: String(customerName).trim(),
    totalAmount,
    itemsCount,
    notes: notes ? String(notes).trim() : null,
    status: "pending",
    statusUpdatedAt: new Date(),
  });

  return res.status(201).json({
    message: "Order created successfully",
    order,
  });
}

module.exports = {
  ORDER_STATUSES,
  createStore,
  listStores,
  updateStore,
  deleteStore,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductImage,
  removeProductImage,
  listProducts,
  listOrders,
  updateOrderStatus,
  createOrder,
};
