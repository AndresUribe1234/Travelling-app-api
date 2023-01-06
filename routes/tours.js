const express = require("express");

const tourController = require(`${__dirname}/../controllers/tourController.js`);

const router = express.Router();

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createNewTour);

router
  .route("/:id")
  .get(tourController.getTourById)
  .patch(tourController.updateTourById)
  .delete(tourController.deleteTourById);

module.exports = router;
