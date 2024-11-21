const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const makeId = require("./random_string");
const prisma = new PrismaClient();
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://api-service-743940785467.us-central1.run.app/user/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: { u_email: profile.emails[0].value },
        });

        if (user) {
          // Update user with Google account information
          user = await prisma.user.update({
            where: { u_email: profile.emails[0].value },
            data: { u_google_id: profile.id },
          });
        } else {
          // Create a new user record
          user = await prisma.user.create({
            data: {
              u_uid: makeId(8),
              u_fullname: profile.displayName,
              u_email: profile.emails[0].value,
              u_google_id: profile.id,
              u_salt: makeId(6),
              u_is_deleted: false,
              u_balance: 0,
            },
          });
        }

        const token = jwt.sign({ uid: user.u_uid }, process.env.TOKEN_SECRET, {
          expiresIn: "1h",
        });
        console.log("TOKEN: " + token);
        return done(null, { token });
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

passport.serializeUser((data, done) => {
  done(null, data);
});

passport.deserializeUser((data, done) => {
  done(null, data);
});

module.exports = passport;
