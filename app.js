const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log({ errorName: err.name, message: err.message, err });
  console.log("Unhandle rejection! Shutting down app...");
  process.exit(1);
});

const tourRouter = require("./routes/tours");
const userRouter = require("./routes/users");
const AppError = require("./utils/appError.js");
const globalErrorHandler = require("./controllers/errorController.js");

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
  console.log(req.headers);
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

app.all("*", (req, res, next) => {
  const err = new AppError(`Route ${req.url} does not exist`, 404);
  next(err);
});

// Error handling middleware
app.use(globalErrorHandler);

// Server
const server = app.listen(PORT, () =>
  console.log(`Server running on PORT ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.log({ errorName: err.name, message: err.message });
  console.log("Unhandle rejection! Shutting down app...");
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
