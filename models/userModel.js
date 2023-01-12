const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "You must enter a token"],
    trim: true,
    validate: {
      // This only works on save or create
      validator: function (element) {
        return element === this.password;
      },
      message: "Passwords do not match",
    },
    passwordChangedAt: Date,
  },
});

userSchema.pre("save", async function (next) {
  // Only run this function if password is modified
  if (!this.isModified("password")) return next;

  //   Hash de password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //   Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
