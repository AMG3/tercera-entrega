import mongoose from "mongoose";

const schema = mongoose.Schema({
  imagePath: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

const productService = mongoose.model("Product", schema);

export default productService;
