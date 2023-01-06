const fs = require("fs");
const Tour = require(`${__dirname}/../models/tourModel.js`);

const app = require(`${__dirname}/../app.js`);

// Getting info from json file instead of database for testing purposes. After db connection is useless.
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/tours.json`)
// );

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    length: Object.keys(tours).length,
    data: { tours },
  });
};

exports.createNewTour = (req, res) => {
  const newId = tours[tours.length - 1]._id + 1;
  const newTour = Object.assign({ _id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/tours.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        length: Object.keys(tours).length,
        data: { tours },
      });
      console.log(err);
    }
  );
};

exports.getTourById = (req, res) => {
  const tourId = tours.find((ele) => {
    if (!+req.params.id) {
      return ele._id === req.params.id;
    } else {
      return ele._id === +req.params.id;
    }
  });

  if (tourId) {
    res.status(200).json({
      status: "success",
      length: 1,
      data: { tourId },
    });
  } else {
    res.status(404).json({
      status: "id does not exist",
    });
  }
};

exports.updateTourById = (req, res) => {
  const tourId = tours.find((ele) => {
    if (!+req.params.id) {
      return ele._id === req.params.id;
    } else {
      return ele._id === +req.params.id;
    }
  });

  const tourArrayId = tours.map((ele) => ele._id);
  const positionId = tourArrayId.indexOf(
    !+req.params.id ? req.params.id : +req.params.id
  );

  if (tourId) {
    Object.keys(req.body).forEach((ele, ind) => {
      tours[positionId][`${ele}`] = req.body[`${ele}`];
    });

    fs.writeFile(
      `${__dirname}/dev-data/tours.json`,
      JSON.stringify(tours),
      (err) => {
        res.status(200).json({
          status: "success",
          length: 1,
          data: tours[positionId],
        });
        console.log(err);
      }
    );
  } else {
    res.status(404).json({
      status: "id does not exist",
    });
  }
};

exports.deleteTourById = (req, res) => {
  const tourId = tours.find((ele) => {
    if (!+req.params.id) {
      return ele._id === req.params.id;
    } else {
      return ele._id === +req.params.id;
    }
  });

  const tourArrayId = tours.map((ele) => ele._id);
  const positionId = tourArrayId.indexOf(
    !+req.params.id ? req.params.id : +req.params.id
  );

  if (tourId) {
    const elementRemoved = tours.splice(positionId, 1);
    fs.writeFile(
      `${__dirname}/dev-data/tours.json`,
      JSON.stringify(tours),
      (err) => {
        res.status(200).json({
          status: "success",
          length: 1,
          elementRemoved: elementRemoved,
        });
        console.log(err);
      }
    );
  } else {
    res.status(404).json({
      status: "id does not exist",
    });
  }
};
