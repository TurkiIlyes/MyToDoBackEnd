const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: [8, "too short password"],
    },
    image: {
      type: String,
    },
    accountVerifyed: {
      type: Boolean,
      default: false,
    },
    signUpCode: {
      type: String,
    },
    signUpCodeExpires: {
      type: Date,
    },
    pwUpdatedAt: {
      type: Date,
      default: Date.now(),
    },
    pwResetCode: {
      type: String,
    },
    pwResetExpires: {
      type: Date,
    },
    pwResetVerified: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
