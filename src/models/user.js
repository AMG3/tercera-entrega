import mongoose from "mongoose";
import bcrypt from "bcrypt";

// TODO: agregar lo que tienes en el esquema del proyecto original
const userSchema = mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

userSchema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const userService = mongoose.model("User", userSchema);

export default userService;
