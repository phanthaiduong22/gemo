const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["staff", "customer"],
    default: "customer",
  },
  fullName: String,
  email: String,
  phone: String,
  address: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
