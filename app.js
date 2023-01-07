const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const tourRouter = require("./routes/tours");
const userRouter = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 8000;

dotenv.config({ path: `./config.env` });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
).replace("<DBNAME>", process.env.DATABASE_NAME);

mongoose.set("strictQuery", false);

mongoose.connect(DB).then((con) => {
  console.log("DB connection successful");
});

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  req.requestTimeMade = new Date().toUTCString();
  console.log(req.requestTimeMade);
  next();
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static(`${__dirname}/public`));

// console.log(process.env);

// Routes

app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);

// Server
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

module.exports = app;
