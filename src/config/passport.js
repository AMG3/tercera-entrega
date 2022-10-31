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
      body("email", "Correo no válido").notEmpty().isEmail();
      body("password", "Contraseña no válida").notEmpty().isLength({ min: 4 });
      body("first_name", "Primer nombre requerido").notEmpty();
      body("last_name", "Apellidos requeridos").notEmpty();
      body("address", "Dirección requerida").notEmpty();

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
            message: "El usuario ya existe",
          });
        }

        const { first_name, last_name, address, phone_number, age } = req.body;

        const newUser = new userService();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.first_name = first_name;
        newUser.last_name = last_name;
        newUser.address = address;
        newUser.laphone_number = phone_number;
        newUser.age = age;
        newUser.photo = req.file.filename;
        newUser.role = "user";

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
      body("email", "Correo no válido").notEmpty().isEmail();
      body("password", "Contraseña no válida").notEmpty();
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
