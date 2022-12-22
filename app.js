const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/tours.json`));

app.get("/api/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    length: Object.keys(tours).length,
    data: { tours },
  });
});

app.post("/api/tours", (req, res) => {
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
});

app.get("/api/tours/:id", (req, res) => {
  console.log(req.params);
  console.log(req.params.id);
  const tourId = tours.find((ele) => ele._id === req.params.id);

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
});

app.patch("/api/tours/:id", (req, res) => {
  console.log(req.params);
  const tourId = tours.find((ele) => {
    if (!+req.params.id) {
      return ele._id === req.params.id;
    } else {
      console.log("before carsh", +req.params.id);
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
});

app.delete("/api/tours/:id", (req, res) => {
  console.log(req.params);
  const tourId = tours.find((ele) => {
    if (!+req.params.id) {
      return ele._id === req.params.id;
    } else {
      console.log("before carsh", +req.params.id);
      return ele._id === +req.params.id;
    }
  });

  const tourArrayId = tours.map((ele) => ele._id);
  const positionId = tourArrayId.indexOf(
    !+req.params.id ? req.params.id : +req.params.id
  );

  if (tourId) {
    const elementRemoved = tours.splice(positionId, 1);
    console.log(elementRemoved);
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
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
