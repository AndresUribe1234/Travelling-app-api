const Tour = require(`${__dirname}/../models/tourModel.js`);

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: "success",
      length: Object.keys(tours).length,
      data: { tours },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      error: err,
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
