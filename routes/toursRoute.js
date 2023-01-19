const express = require("express");

const tourController = require(`${__dirname}/../controllers/tourController.js`);
const authController = require(`${__dirname}/../controllers/authController.js`);
const reviewRouter = require("./../routes/reviewsRoute.js");

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);

router.route("/tours-stats").get(tourController.getTourStats);
router.route("/monthly-tours/:year").get(tourController.monthlyTours);

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createNewTour);

router
  .route("/:id")
  .get(tourController.getTourById)
  .patch(tourController.updateTourById)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.deleteTourById
  );

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

module.exports = router;
