import { Router } from "express";
import { Cart } from "../models/cart.js";

import productService from "../models/product.js";
import orderService from "../models/order.js";
import userService from "../models/user.js";
import { sendEmail } from "../handlers/email.js";
import { checkoutTemplate } from "../constants/templates.js";

const router = Router();

router.get("/", (req, res, next) => {
  const successMsg = req.flash("success")[0];
  productService.find((err, docs) => {
    const productChunks = docs;
    res.render("shop/index", {
      title: "E-commerce",
      products: productChunks,
      successMsg: successMsg,
      noMessages: !successMsg,
    });
  });
});

router.get("/add-to-cart/:id", (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  productService.findById(productId, (err, product) => {
    if (err) {
      return res.redirect("/");
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect("/");
  });
});

router.get("/reduce/:id", (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart");
});

router.get("/remove/:id", (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart");
});

router.get("/shopping-cart", function (req, res, next) {
  if (!req.session.cart) {
    return res.render("shop/shopping-cart", { products: null });
  }
  const cart = new Cart(req.session.cart);
  res.render("shop/shopping-cart", {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
  });
});

router.get("/checkout", isLoggedIn, (req, res, next) => {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  const cart = new Cart(req.session.cart);
  const errMsg = req.flash("error")[0];
  res.render("shop/checkout", {
    total: cart.totalPrice,
    errMsg: errMsg,
    noError: !errMsg,
  });
});

router.post("/checkout", isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }

  const cart = new Cart(req.session.cart);

  userService.findById(req.session.passport.user, (err, user) => {
    const newOrder = {
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: Math.random().toString(32),
    };
    const order = new orderService(newOrder);

    console.log("Enviado a:", user.email);
    sendEmail("anais6622@hotmail.com", "Tu orden", checkoutTemplate(newOrder));

    order.save((err, result) => {
      req.flash("success", "Compra exitosa de producto");
      req.session.cart = null;
      res.redirect("/");
    });
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect("/user/signin");
}

export default router;
