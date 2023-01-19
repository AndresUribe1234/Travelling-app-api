const AppError = require(`${__dirname}/../utils/appError.js`);
const Review = require(`${__dirname}/../models/reviewModel.js`);

exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const allTours = await Review.find(filter);

    res.status(200).json({
      status: "Success: This are all the reviews!",
      data: { allTours },
    });
  } catch (err) {
    const error = new AppError("Could not fetch the reviews from db", 404);
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.use) req.body.user = req.user._id;
    console.log("req.user", req.user);
    console.log("req.params.tourId", req.params.tourId);
    console.log("req.body", req.body);

    const newReview = await Review.create(req.body);

    res.status(200).json({
      status: "Success: The review was created!",
      review: { newReview },
    });
  } catch (err) {
    const error = new AppError(
      "Could not create review. Review needs to have a tour, user, rating and review.",
      404
    );
    next(error);
  }
};

exports.updateReview = async function (req, res, next) {
  try {
    const reviewUpdate = await Review.findOneAndUpdate(
      { _id: req.params.reviewId },
      {
        review: req.body.review,
        rating: req.body.rating,
      }
    );

    res.status(200).json({
      status: "Success: Tour was updated!",
    });
  } catch (err) {
    const error = new AppError("Could not update review.", 404);
    next(error);
  }
};
