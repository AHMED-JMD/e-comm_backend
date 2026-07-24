const { Op } = require("sequelize");
const { User } = require("../models");
const { signToken } = require("../utils/jwt");
const { createPasswordResetToken, hashToken } = require("../utils/reset-token");
const { sendResetPasswordEmail } = require("../services/email.service");
const env = require("../config/env");

async function register(req, res) {
  const { role, name, email, phone, password } = req.body;

  const existingUser = await User.findOne({ where: { phone } });
  if (existingUser) {
    return res.status(409).json({ message: "Phone number already in use" });
  }

  const user = await User.create({
    role,
    name,
    email,
    phone,
    password,
    provider: "local",
    isVerified: true,
  });

  const token = signToken(user);
  return res.status(201).json({
    message: "User registered successfully",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
}

async function login(req, res) {
  const { identifier, password } = req.body;
  const normalizedIdentifier = String(identifier || "").trim();

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { phone: normalizedIdentifier },
        { email: normalizedIdentifier.toLowerCase() },
      ],
    },
  });
  if (!user) {
    return res.status(401).json({ message: "Invalid email/phone or password" });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email/phone or password" });
  }

  const token = signToken(user);
  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(200).json({
      message:
        "المستخدم غير موجود. إذا كان البريد الإلكتروني مسجلاً، فسيصلك رابط إعادة التعيين.",
    });
  }

  const { rawToken, hashedToken } = createPasswordResetToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const resetLink = `${env.frontendUrl}/reset-password?token=${rawToken}`;

  await sendResetPasswordEmail({
    to: user.email,
    resetLink,
  });

  return res.status(200).json({
    message: "If this email exists, a reset link has been sent",
  });
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  const hashed = hashToken(token);
  const user = await User.findOne({
    where: {
      resetPasswordToken: hashed,
      resetPasswordExpires: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  user.password = newPassword;
  user.provider = "local";
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return res
    .status(200)
    .json({ message: "Password has been reset successfully" });
}

async function updateProfile(req, res) {
  const { name, phone } = req.body;
  const normalizedName = String(name || "").trim();
  const normalizedPhone = String(phone || "").trim();

  const existingUser = await User.findOne({
    where: {
      phone: normalizedPhone,
      id: {
        [Op.ne]: req.user.id,
      },
    },
  });

  if (existingUser) {
    return res.status(409).json({ message: "Phone number already in use" });
  }

  req.user.name = normalizedName;
  req.user.phone = normalizedPhone;
  await req.user.save();

  return res.status(200).json({
    message: "Profile updated successfully",
    user: {
      id: req.user.id,
      role: req.user.role,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      provider: req.user.provider,
      isVerified: req.user.isVerified,
    },
  });
}

function googleCallback(req, res) {
  const token = signToken(req.user);

  if (env.frontendUrl) {
    return res.redirect(
      `${env.frontendUrl}/auth/google/callback?token=${token}`,
    );
  }

  return res.status(200).json({ token });
}

function me(req, res) {
  return res.status(200).json({ user: req.user });
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateProfile,
  googleCallback,
  me,
};
