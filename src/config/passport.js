import passport from "passport";
import userService from "../models/user.js";
import { Strategy as LocalStrategy } from "passport-local";
import { body, validationResult } from "express-validator";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  userService.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      body("email", "Invalid email").notEmpty().isEmail();
      body("password", "Invalid password").notEmpty().isLength({ min: 4 });
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return done(null, false, req.flash("error"));
      }
      userService.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, {
            message: "Email is already in use.",
          });
        }
        const newUser = new userService();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save((err, result) => {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      });
    }
  )
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      body("email", "Invalid email").notEmpty().isEmail();
      body("password", "Invalid password").notEmpty();
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return done(null, false, req.flash("error"));
      }
      userService.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "No user found." });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Wrong password." });
        }
        return done(null, user);
      });
    }
  )
);

export default passport;
