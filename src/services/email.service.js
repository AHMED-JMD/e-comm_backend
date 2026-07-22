const nodemailer = require("nodemailer");
const env = require("../config/env");

const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  secure: env.email.secure,
  auth: {
    user: env.email.user,
    pass: env.email.pass,
  },
});

async function sendResetPasswordEmail({ to, resetLink }) {
  const subject = "Reset your password";
  const text = `You requested a password reset. Use this link: ${resetLink}. This link expires in 15 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Password reset request</h2>
      <p>You requested a password reset.</p>
      <p>
        <a href="${resetLink}" target="_blank" rel="noopener noreferrer">
          Click here to reset your password
        </a>
      </p>
      <p>This link expires in 15 minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: env.email.from,
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendResetPasswordEmail,
};
