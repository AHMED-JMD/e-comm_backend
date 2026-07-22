const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const env = require("./env");
const { User } = require("../models");

passport.googleEnabled = Boolean(
  env.google.clientId && env.google.clientSecret,
);

if (passport.googleEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email returned from Google"));
          }

          const [user] = await User.findOrCreate({
            where: { email },
            defaults: {
              name: profile.displayName || email.split("@")[0],
              email,
              googleId: profile.id,
              provider: "google",
              isVerified: true,
            },
          });

          if (!user.googleId) {
            user.googleId = profile.id;
            user.provider = "google";
            user.isVerified = true;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
}

module.exports = passport;
