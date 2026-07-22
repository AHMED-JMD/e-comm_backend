const express = require("express");
const passport = require("passport");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const { validateRequest } = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("role").trim().notEmpty().withMessage("Role is required"),
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    validateRequest,
  ],
  authController.register,
);

router.post(
  "/login",
  [
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
  ],
  authController.login,
);

router.post(
  "/forgot-password",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    validateRequest,
  ],
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
    validateRequest,
  ],
  authController.resetPassword,
);

router.get("/google", (req, res, next) => {
  if (!passport.googleEnabled) {
    return res.status(503).json({ message: "Google auth is not configured" });
  }
  return passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next,
  );
});

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!passport.googleEnabled) {
      return res.status(503).json({ message: "Google auth is not configured" });
    }
    return passport.authenticate("google", {
      session: false,
      failureRedirect: "/api/auth/google/failure",
    })(req, res, next);
  },
  authController.googleCallback,
);

router.get("/google/failure", (_req, res) => {
  return res.status(401).json({ message: "Google authentication failed" });
});

router.get("/me", protect, authController.me);

module.exports = router;
