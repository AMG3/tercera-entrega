import * as dotenv from "dotenv";
dotenv.config();
import { Router } from "express";
// import csrf from "tiny-csrf";
import passport from "passport";

import orderService from "../models/order.js";
import { Cart } from "../models/cart.js";
import { upload } from "../middlewares/upload.js";

const router = Router();
// const csrfProtection = csrf(process.env.SECRET);
// router.use(csrfProtection);

router.get("/profile", isLoggedIn, (req, res, next) => {
  orderService.find({ user: req.user }, (err, orders) => {
    if (err) {
      return res.write("Error!");
    }
    const userOrders = [];
    orders.forEach((order) => {
      let cart = new Cart(order.cart);
      userOrders.push({
        cart,
        items: cart.generateArray(),
      });
    });
    res.render("user/profile", {
      orders: userOrders,
      userPhoto: `../files/${req.user.photo}`,
      userName: req.user.first_name,
    });
  });
});

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.use("/", notLoggedIn, (req, res, next) => {
  next();
});

router.get("/signup", (req, res, next) => {
  const messages = req.flash("error");
  res.render("user/signup", {
    // csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
  });
});

router.post(
  "/signup",
  upload.single("user_photo"),
  passport.authenticate("local.signup", {
    failureRedirect: "/user/signup",
    failureFlash: true,
  }),
  (req, res, next) => {
    if (req.session.oldUrl) {
      const oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect("/user/profile");
    }
  }
);

router.get("/signin", (req, res, next) => {
  const messages = req.flash("error");
  res.render("user/signin", {
    // csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
  });
});

router.post(
  "/signin",
  passport.authenticate("local.signin", {
    failureRedirect: "/user/signin",
    failureFlash: true,
  }),
  (req, res, next) => {
    if (req.session.oldUrl) {
      const oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect("/user/profile");
    }
  }
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

export default router;
