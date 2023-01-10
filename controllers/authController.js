const User = require(`${__dirname}/../models/userModel.js`);
const AppError = require(`${__dirname}/../utils/appError.js`);

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);

    res.status(201).json({ status: "success", user: { newUser } });
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};
