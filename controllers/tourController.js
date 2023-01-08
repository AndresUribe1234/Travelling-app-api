const Tour = require(`${__dirname}/../models/tourModel.js`);

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
}

exports.getAllTours = async (req, res) => {
  try {
    // Build query
    // 1A)Filtering
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((ele) => delete queryObj[ele]);

    // 1B)Advance filtering
    let queryStr = JSON.stringify(queryObj);
    // Regular expression to find any of the exact values as stand alone string multiple times andreplace it
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    // 2)Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    }

    // 3)Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // 4)Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numbTours = await Tour.countDocuments();
      if (skip >= numbTours) throw new Error("This page does not exist");
    }

    // Execute query
    const tours = await query;

    console.log(req.query);
    // Send response
    res.status(200).json({
      status: "success",
      length: Object.keys(tours).length,
      data: { tours },
    });
  } catch (err) {
    console.log(req.query);
    console.log(err);
    res.status(400).json({
      status: "failed",
      error: err.message,
    });
  }
};

exports.createNewTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: "success",
      data: { newTour },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      error: err,
    });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tourById = await Tour.find({ _id: req.params.id });

    res.status(200).json({
      status: "success",
      data: { tourById },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      error: err,
    });
  }
};

exports.updateTourById = async (req, res) => {
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
    res.status(400).json({
      status: "failed",
      error: err,
    });
  }
};

exports.deleteTourById = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      error: err,
    });
  }
};
