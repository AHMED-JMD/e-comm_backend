const crypto = require('crypto');

function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  return {
    rawToken,
    hashedToken,
  };
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  createPasswordResetToken,
  hashToken,
};
