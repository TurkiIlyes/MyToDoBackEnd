const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "title required"],
    },

    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
    },

    details: {
      type: String,
    },

    startDate: {
      type: Date,
    },
    checkSendEmail: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "task must be belong to user"],
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("task", taskSchema);

module.exports = Task;
