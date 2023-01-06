const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Every tour has to have a name"],
    unique: true,
  },
  rating: {
    type: Number,
    required: false,
    unique: false,
  },
  price: {
    type: Number,
    required: [true, "Every tour has to have a price"],
    default: 20,
  },
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
