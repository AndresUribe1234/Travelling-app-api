const express = require("express");
const fs = require("fs");

const router = express.Router();

const userController = require(`${__dirname}/../controllers/userController.js`);

router.get("/", userController.getAllUsers);
router.post("/", userController.createNewUser);
router.get("/:id", userController.getUserById);

module.exports = router;
