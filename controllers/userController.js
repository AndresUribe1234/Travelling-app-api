const { findById } = require("../models/userModel");

const User = require(`${__dirname}/../models/userModel.js`);
const AppError = require(`${__dirname}/../utils/appError.js`);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = async (req, res, next) => {
  const allUsers = await User.find();
  res.status(201).json({ status: "success", user: { allUsers } });
};

exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      throw new AppError(
        "This route is not for password updates. Please use /update-password.",
        400
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, "name", "email");

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    // 1)Find user
    const user = await User.findById(req.user._id).select("+password");

    // 2)Correct password from user
    const correct = await user.correctPassword(
      req.body.password,
      user.password
    );
    if (!user || !correct) {
      throw new AppError("Incorrect password or user does not exists", 400);
    }

    // 3)Delete user
    const deletedUser = await User.findByIdAndUpdate(user._id, {
      active: false,
    });

    res
      .status(200)
      .json({ status: "user deleted", token: "user will be logged out" });
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};

exports.createNewUser = (req, res) => {
  res.status(200).end(`You hit ${req.url} endpoint`);
};

exports.getUserById = (req, res) => {
  res.status(200).end(`You hit ${req.url} endpoint`);
};
