const express = require("express");

const router = express.Router();

const userController = require(`${__dirname}/../controllers/userController.js`);
const authController = require(`${__dirname}/../controllers/authController.js`);

router.get("/", userController.getAllUsers);
router.post("/", userController.createNewUser);
router.get("/:id", userController.getUserById);

router.post("/signup", authController.signup);
router.post("/login", authController.login);

module.exports = router;
