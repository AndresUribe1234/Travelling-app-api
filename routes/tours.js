const express = require("express");

const tourController = require(`${__dirname}/../controllers/tourController.js`);

const router = express.Router();

router.get("/", tourController.getAllTours);
router.post("/", tourController.createNewTour);
router.get("/:id", tourController.getTourById);
router.patch("/:id", tourController.updateTourById);
router.delete("/:id", tourController.deleteTourById);

module.exports = router;
