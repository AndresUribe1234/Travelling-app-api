const User = require(`${__dirname}/../models/userModel.js`);
const AppError = require(`${__dirname}/../utils/appError.js`);
const jwt = require("jsonwebtoken");
const util = require("util");

const signToken = function (id) {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({ status: "success", token, user: { newUser } });
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and pasword exist

    if (!email || !password) {
      throw new AppError("Please insert a valid user and password", 404);
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email: email }).select("+password");
    const correct = await user.correctPassword(password, user.password);
    if (!user || !correct) {
      throw new AppError("Please insert a valid user and password", 404);
    }

    // 3) If everything is ok, send token to client
    const token = signToken(user._id);
    res.status(201).json({ status: "success", token, user });
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};

exports.protect = async function (req, res, next) {
  try {
    let token;
    // 1) Getting token and check if it exist
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log(token);
    }

    if (!token) {
      throw new AppError("You are not logged in. Please log in.", 404);
    }
    // 2)Check if token is valid
    const decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    console.log("decoded", decoded);

    // 3)Check if user still exist
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      throw new AppError("User does not exist. Token is no longer valid.", 404);
    }

    // 4)Check if user changed password after jwt token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      throw new AppError(
        "Password was updated. Token is no longer valid.",
        404
      );
    }

    req.user = freshUser;

    next();
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};
