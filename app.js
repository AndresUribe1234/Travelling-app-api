const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

process.on("uncaughtException", (err) => {
  console.log({ errorName: err.name, message: err.message, err });
  console.log("Unhandle rejection! Shutting down app...");
  process.exit(1);
});

const tourRouter = require("./routes/toursRoute");
const userRouter = require("./routes/usersRoute");
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
app.use(helmet());

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many request from this IP, please try again in an hour!",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use("/api", limiter);

app.use((req, res, next) => {
  req.requestTimeMade = new Date().toUTCString();
  console.log(req.requestTimeMade);
  next();
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(express.static(`${__dirname}/public`));

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
