const express = require("express");
const { body, param, query } = require("express-validator");
const adminController = require("../controllers/admin.controller");
const { validateRequest } = require("../middlewares/validate.middleware");
const { protect, requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect, requireAdmin);

//store routes
router.post(
  "/stores",
  [
    body("name").trim().notEmpty().withMessage("Store name is required"),
    body("ownerName")
      .trim()
      .notEmpty()
      .withMessage("Store owner name is required"),
    body("address").trim().notEmpty().withMessage("Store address is required"),
    body("description").optional().isString(),
    body("phone").trim().notEmpty().withMessage("Store phone is required"),
    validateRequest,
  ],
  adminController.createStore,
);

router.get("/stores", adminController.listStores);

router.put(
  "/stores/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Valid store id is required")
      .toInt(),
    body("name").trim().notEmpty().withMessage("Store name is required"),
    body("ownerName").trim().optional().isString(),
    body("address").trim().notEmpty().withMessage("Store address is required"),
    body("description").optional().isString(),
    body("phone").trim().notEmpty().withMessage("Store phone is required"),
    validateRequest,
  ],
  adminController.updateStore,
);

router.delete(
  "/stores/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Valid store id is required")
      .toInt(),
    validateRequest,
  ],
  adminController.deleteStore,
);

//products routes
router.post(
  "/products",
  [
    body("storeId")
      .isInt({ min: 1 })
      .withMessage("Valid storeId is required")
      .toInt(),
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("category")
      .trim()
      .notEmpty()
      .withMessage("Product category is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Product price must be a non-negative number")
      .toFloat(),
    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Product stock must be a non-negative integer")
      .toInt(),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be boolean"),
    validateRequest,
  ],
  adminController.createProduct,
);

router.get(
  "/products",
  [
    query("storeId").optional().isInt({ min: 1 }).toInt(),
    query("active").optional().isBoolean(),
    query("category").optional().isString(),
    query("search").optional().isString(),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest,
  ],
  adminController.listProducts,
);

//orders routes
router.post(
  "/orders",
  [
    body("storeId")
      .isInt({ min: 1 })
      .withMessage("Valid storeId is required")
      .toInt(),
    body("customerName")
      .trim()
      .notEmpty()
      .withMessage("Customer name is required"),
    body("totalAmount")
      .isFloat({ min: 0 })
      .withMessage("totalAmount must be a non-negative number")
      .toFloat(),
    body("itemsCount")
      .isInt({ min: 1 })
      .withMessage("itemsCount must be an integer greater than 0")
      .toInt(),
    body("notes").optional().isString(),
    body("orderItems").optional().isArray(),
    body("orderItems.*.productId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("orderItems productId must be a valid integer")
      .toInt(),
    body("orderItems.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("orderItems quantity must be an integer greater than 0")
      .toInt(),
    body("orderItems.*.unitPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("orderItems unitPrice must be a non-negative number")
      .toFloat(),
    validateRequest,
  ],
  adminController.createOrder,
);

router.get(
  "/orders",
  [
    query("storeId").optional().isInt({ min: 1 }).toInt(),
    query("status")
      .optional()
      .isIn(adminController.ORDER_STATUSES)
      .withMessage("Invalid status value"),
    query("search").optional().isString(),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest,
  ],
  adminController.listOrders,
);

router.patch(
  "/orders/:id/status",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Valid order id is required")
      .toInt(),
    body("status")
      .isIn(adminController.ORDER_STATUSES)
      .withMessage("Invalid order status"),
    validateRequest,
  ],
  adminController.updateOrderStatus,
);

module.exports = router;
