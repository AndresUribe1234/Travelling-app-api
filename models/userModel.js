const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "You must enter a name"], trim: true },
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: "Input needs to be an email",
    },
    unique: true,
    required: [true, "You must enter an email"],
    trim: true,
    lowercase: true,
  },
  photo: String,
  password: {
    type: String,
    required: [true, "You must enter a password"],
    trim: true,
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "You must enter a token"],
    trim: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
