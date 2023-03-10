const Tour = require(`${__dirname}/../models/tourModel.js`);
const APIFeatures = require(`${__dirname}/../utils/apiFeatures.js`);
const AppError = require(`${__dirname}/../utils/appError.js`);

exports.getAllTours = async (req, res, next) => {
  try {
    // Execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filtering()
      .sorting()
      .limitingFields()
      .pagination();
    const tours = await features.query;

    // Send response
    res.status(200).json({
      status: "success",
      length: Object.keys(tours).length,
      data: { tours },
    });
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};

exports.createNewTour = async (req, res, next) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: "success",
      data: { newTour },
    });
  } catch (err) {
    const error = new AppError(err.message, 404);
    next(error);
  }
};

exports.getTourById = async (req, res, next) => {
  try {
    const tourById = await Tour.find({ _id: req.params.id }).populate(
      "reviews"
    );

    res.status(200).json({
      status: "success",
      data: { tourById },
    });
  } catch (err) {
    const error = new AppError("Did not found a tour with that id", 404);
    next(error);
  }
};

exports.updateTourById = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidator: true,
    });
    res.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (err) {
    const error = new AppError("Did not found a tour with that id", 404);
    next(error);
  }
};

exports.deleteTourById = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (err) {
    const error = new AppError("Did not found a tour with that id", 404);
    next(error);
  }
};

exports.getTourStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      // Match to filter beginning of pipeline to reduce internal workload or filter by x criteria
      // { $match: { duration: { $gte: 0 } } },
      {
        $group: {
          _id: `$difficulty`,
          numToursPipeline: { $sum: 1 },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          avgPrice: { $avg: "$price" },
          minDuration: { $min: "$duration" },
          maxDuration: { $max: "$duration" },
          avgDuration: { $avg: "$duration" },
          minRating: { $min: "$rating" },
          maxRating: { $max: "$rating" },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { avgPrice: -1 } },
    ]);

    const statsAll = await Tour.aggregate([
      // Match to filter beginning of pipeline to reduce internal workload or filter by x criteria
      // { $match: { duration: { $gte: 0 } } },
      {
        $group: {
          _id: null,
          numToursPipeline: { $sum: 1 },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          avgPrice: { $avg: "$price" },
          minDuration: { $min: "$duration" },
          maxDuration: { $max: "$duration" },
          avgDuration: { $avg: "$duration" },
          minRating: { $min: "$rating" },
          maxRating: { $max: "$rating" },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      dataByDifficulty: { stats },
      dataByAll: { statsAll },
    });
  } catch (err) {
    const error = new AppError("Did not found a tour with that id", 404);
    next(error);
  }
};

exports.monthlyTours = async (req, res, next) => {
  try {
    year = req.params.year;
    const monthlyTours = await Tour.aggregate([
      { $unwind: "$startDates" },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numToursMonth: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      { $addFields: { month: "$_id" } },
      { $project: { _id: 0 } },
      { $sort: { numToursMonth: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: { monthlyTours },
    });
  } catch (err) {
    const error = new AppError("Did not found a tour with that id", 404);
    next(error);
  }
};

exports.getToursWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");

    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng)
      throw new AppError(
        "Please provide latitud and longitude in the format lat,lng.",
        400
      );

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        data: tours,
      },
    });
  } catch (err) {
    const error = new AppError("Problem with distances", 404);
    next(error);
  }
};

exports.getDistances = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");

    const multiplier = unit === "mi" ? 0.000621371 : 0.001;

    if (!lat || !lng)
      throw new AppError(
        "Please provide latitutr and longitude in the format lat,lng.",
        400
      );

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: "distance",
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        data: distances,
      },
    });
  } catch (err) {
    const error = new AppError("Problem with distances", 404);
    next(error);
  }
};
