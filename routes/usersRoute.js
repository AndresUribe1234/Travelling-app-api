const express = require("express");

const router = express.Router();

const userController = require(`${__dirname}/../controllers/userController.js`);
const authController = require(`${__dirname}/../controllers/authController.js`);

router.get("/", userController.getAllUsers);
router.post("/", userController.createNewUser);
router.get("/:id", userController.getUserById);

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch("/update-password", authController.updatePassword);

module.exports = router;
