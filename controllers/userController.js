const User = require(`${__dirname}/../models/userModel.js`);

exports.getAllUsers = async (req, res, next) => {
  const allUsers = await User.find();
  res.status(201).json({ status: "success", user: { allUsers } });
};

exports.createNewUser = (req, res) => {
  res.status(200).end(`You hit ${req.url} endpoint`);
};

exports.getUserById = (req, res) => {
  res.status(200).end(`You hit ${req.url} endpoint`);
};
