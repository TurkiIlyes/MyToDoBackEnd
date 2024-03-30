const asyncHandler = require("express-async-handler");

const moment = require("moment-timezone");

const User = require("../models/userModel");
const Task = require("../models/taskModel");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/ApiFeatures");
const { uploadImage } = require("../middlewares/Data/uploadImage");

const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

exports.uploadTaskImage = uploadImage("image");

exports.resizeTaskImage = asyncHandler(async (req, res, next) => {
  const filename = `task-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(720, 1080)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/task/${filename}`);
    req.body.image = filename;
  }
  next();
});

exports.addTask = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { title, status, details, startDate, checkSendEmail, image } = req.body;
  const date = moment(startDate).tz("Africa/Tunis");

  date.set("seconds", 0);

  const task = await Task.create({
    title,
    status,
    details,
    startDate: date.format(),
    checkSendEmail,
    image,
    userId,
  });
  res.status(201).json({ data: task });
});

exports.updateTask = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const taskId = req.params.id;
  const { title, status, details, startDate, checkSendEmail, image } = req.body;

  const notEmptyData = {};
  for (const [key, value] of Object.entries({
    title,
    status,
    details,
    startDate,
    checkSendEmail,
    image,
  })) {
    if (value) {
      notEmptyData[key] = value;
    }
  }

  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { $set: notEmptyData },
    { new: true }
  );
  if (!task) {
    return next(new ApiError("invalid user ID or task ID -_-", 400));
  }
  res.status(201).json({ data: task });
});
exports.updateTaskStatus = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const taskId = req.params.id;
  const { status } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { status },
    { new: true }
  );
  if (!task) {
    return next(new ApiError("invalid user ID or task ID -_-", 400));
  }
  res.status(201).json({ data: task });
});
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const taskId = req.params.id;
  const user = await Task.findOneAndDelete({ _id: taskId, userId });
  if (!user) {
    return next(new ApiError("invalid user ID or task ID -_-", 400));
  }
  res
    .status(201)
    .json({ status: "success", message: "task deleted successfully" });
});

exports.getTasks = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  if (req.query.startDate) {
    req.query.startDate.gte = new Date(req.query.startDate.gte);
    req.query.startDate.lte = new Date(req.query.startDate.lte);
  }
  const { mongooseQuery } = new ApiFeatures(Task.find({ userId }), req.query)
    .Paginate()
    .Filter()
    .Search()
    .LimitFields()
    .Sort();

  const tasks = await mongooseQuery;
  res.status(200).json({ results: tasks.length, data: tasks });
});

exports.getTask = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const taskId = req.params.id;
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    return next(new ApiError("invalid user ID or task ID -_-", 400));
  }
  res.status(200).json({ data: task });
});
