const mongoose = require("mongoose");
const slugify = require("slugify");
const User = require(`${__dirname}/userModel.js`);

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Every tour has to have a name"],
      unique: true,
      trim: true,
      maxLength: [40, "Each string can have a maximum length of 40 characters"],
      minLength: [5, "Each string must have at least 5 characters"],
    },
    rating: {
      type: Number,
      required: false,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    price: {
      type: Number,
      required: [true, "Every tour has to have a price"],
      default: 25,
      validate: {
        validator: function (value) {
          return value >= 0 ? true : false;
        },
        message: "Price cannot be negative",
      },
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
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either easy, medium or difficult",
      },
    },
    ratingAvg: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
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
    slug: String,
    start: { type: Date },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // Embedding guides
    // guides: Array,
    // Referencing guides
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  { strict: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Document middleware: runes before .save() and .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post("save", function (doc, next) {
  console.log(doc.slug);
  next();
});

// Middleware to embedd guides
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// Query middleware
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

// // Aggregation middleware
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
