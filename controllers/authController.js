const User = require(`${__dirname}/../models/userModel.js`);
const AppError = require(`${__dirname}/../utils/appError.js`);
const sendEmail = require(`${__dirname}/../utils/email.js`);
const jwt = require("jsonwebtoken");
const util = require("util");
const crypto = require("crypto");

const cookieOptions = {
  expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  //   secure: true,
  httpOnly: true,
};

const signToken = function (id) {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const createAndSendToken = function (user, statusCode, message, res) {
  const token = signToken(user._id);
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({ status: message, token });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    // res.status(201).json({ status: "success", token, user: { newUser } });
    createAndSendToken(newUser, 201, "User created", res);
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
    if (!user) {
      throw new AppError("User does not exist", 404);
    }
    const correct = await user.correctPassword(password, user.password);
    if (!user || !correct) {
      throw new AppError("Please insert a valid user and password", 404);
    }

    // 3) If everything is ok, send token to client
    createAndSendToken(user, 201, "Success: You are logged in", res);
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
    }

    if (!token) {
      throw new AppError("You are not logged in. Please log in.", 404);
    }
    // 2)Check if token is valid
    const decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    // 3)Check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new AppError("User does not exist. Token is no longer valid.", 404);
    }

    // 4)Check if user changed password after jwt token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new AppError(
        "Password was updated. Token is no longer valid.",
        404
      );
    }

    req.user = currentUser;

    next();
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};

exports.restrictTo = function (...roles) {
  // Because of closure returned function has acces to roles
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError("You dont have the requested permission", 403);
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on given email in the request
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new AppError("Email does not exist.", 404);
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    // 3) Send to email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/users/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: \n\n${resetURL}.\n\nIf you didn't forget your password, please ignore this email!\n\nToken to reset password: ${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email! Check your email.",
    });
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    console.log("req.toke", req.params.token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      throw new AppError("Token is invalid or has expired", 400);
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // Middleware in user model

    // 4) Log the user in, send JWT
    createAndSendToken(user, 201, "Success: password was restored!", res);
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1)Check if user exists
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      throw new AppError("User does not exit", 404);
    }
    // 2)Check if password is correct
    const correct = await user.correctPassword(
      req.body.password,
      user.password
    );

    if (!correct) {
      throw new AppError("Please enter the correct password!", 401);
    }
    // 3)Update password

    if (user && correct) {
      //   Model pre "save" middleware for password takes care of the new crypting for the new password
      user.password = req.body.newPassword;
      user.passwordConfirm = req.body.newPassword;
      await user.save();
    }
    // 4)Sign in user
    createAndSendToken(user, 201, "Password was updated!", res);
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};
