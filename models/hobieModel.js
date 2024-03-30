const mongoose = require("mongoose");

const hobieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "title required"],
    },

    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    image: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "hobie must be belong to user"],
    },
  },
  { timestamps: true }
);

const Hobie = mongoose.model("hobie", hobieSchema);

module.exports = Hobie;
