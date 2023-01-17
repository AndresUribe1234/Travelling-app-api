const express = require("express");

const router = express.Router({ mergeParams: true });

const reviewController = require(`${__dirname}/../controllers/reviewController.js`);
const authController = require(`${__dirname}/../controllers/authController.js`);

// Because of tour nested route (tour/:tourId/reviews) and (/) rputes both end up in the same. Mergeparame=true makes it work

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.createReview
  );

module.exports = router;
