const fs = require("fs");
const Tour = require(`${__dirname}/../models/tourModel.js`);

const app = require(`${__dirname}/../app.js`);

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    // length: Object.keys(tours).length,
    // data: { tours },
  });
};

exports.createNewTour = (req, res) => {
  res.status(200).json({
    status: "success",
    // length: Object.keys(tours).length,
    // data: { tours },
  });
};

exports.getTourById = (req, res) => {
  res.status(200).json({
    status: "success",
    // length: Object.keys(tours).length,
    // data: { tours },
  });
};

exports.updateTourById = (req, res) => {
  res.status(200).json({
    status: "success",
    // length: Object.keys(tours).length,
    // data: { tours },
  });
};

exports.deleteTourById = (req, res) => {
  res.status(200).json({
    status: "success",
    // length: Object.keys(tours).length,
    // data: { tours },
  });
};
