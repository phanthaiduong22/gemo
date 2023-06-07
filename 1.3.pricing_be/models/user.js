const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ["staff", "customer", "barista"],
    default: "customer",
  },
  fullName: String,
  email: String,
  phone: String,
  address: String,
  googleId: String,
  picture: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
