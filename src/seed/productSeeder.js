import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import productService from "../models/product.js";

mongoose.connect(process.env.MONGODB_URI);

const products = [
  new productService({
    title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    price: 109.95,
    picture: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
  }),
  new productService({
    title: "Mens Casual Premium Slim Fit T-Shirts ",
    price: 22.3,
    picture:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
  }),
  new productService({
    title: "Mens Cotton Jacket",
    price: 55.99,
    picture: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
  }),
  new productService({
    title: "Mens Casual Slim Fit",
    price: 15.99,
    picture: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
  }),
  new productService({
    title:
      "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
    price: 695,
    picture: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
  }),
  new productService({
    title: "Solid Gold Petite Micropave ",
    price: 168,
    picture: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
  }),
];

let done = 0;
for (let i = 0; i < products.length; i++) {
  products[i].save((err, result) => {
    done++;
    if (done === products.length) {
      exit();
    }
  });
}

function exit() {
  mongoose.disconnect();
}
