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
    enum: ["staff", "customer"],
    default: "customer",
  },
  fullName: String,
  email: String,
  phone: String,
  address: String,
  googleId: String,
  picture: {
    type: String,
    default:
      "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-Vector-No-Background.png",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
