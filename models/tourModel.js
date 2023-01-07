const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Every tour has to have a name"],
      unique: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: false,
    },
    price: {
      type: Number,
      required: [true, "Every tour has to have a price"],
      default: 25,
    },
    duration: {
      type: Number,
      required: [true, "Tour has to have a time duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tour has to have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "Tour has to have a group size"],
    },
    ratingAvg: {
      type: Number,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, "Tour has to summary"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Tour has to have a description"],
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  { strict: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
