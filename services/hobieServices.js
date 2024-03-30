const asyncHandler = require("express-async-handler");

const Hobie = require("../models/hobieModel");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/ApiFeatures");
const { uploadImage } = require("../middlewares/Data/uploadImage");

const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

exports.uploadHobieImage = uploadImage("image");

exports.resizeHobieImage = asyncHandler(async (req, res, next) => {
  const filename = `hobie-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(720, 1080)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/hobie/${filename}`);
    req.body.image = filename;
  }
  next();
});

exports.addHobie = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { title, startTime, endTime, image } = req.body;
  const hobie = await Hobie.create({
    title,
    startTime,
    endTime,
    image,
    userId,
  });
  res.status(201).json({ data: hobie });
});

exports.updateHobie = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const hobieId = req.params.id;
  const { title, startTime, endTime, image } = req.body;
  const notEmptyData = {};
  for (const [key, value] of Object.entries({
    title,
    startTime,
    endTime,
    image,
  })) {
    if (value) {
      notEmptyData[key] = value;
    }
  }
  const hobie = await Hobie.findOneAndUpdate(
    { _id: hobieId, userId },
    { $set: notEmptyData },
    { new: true }
  );
  if (!hobie) {
    return next(new ApiError("invalid user ID or hobie ID -_-", 400));
  }
  res.status(201).json({ data: hobie });
});

exports.deleteHobie = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const hobieId = req.params.id;
  const user = await Hobie.findOneAndDelete({ _id: hobieId, userId });
  if (!user) {
    return next(new ApiError("invalid user ID or hobie ID -_-", 400));
  }
  res
    .status(201)
    .json({ status: "success", message: "hobie deleted successfully" });
});

exports.getHobies = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { mongooseQuery } = new ApiFeatures(Hobie.find({ userId }), req.query)
    .Paginate()
    .Filter()
    .Search()
    .LimitFields()
    .Sort();

  const hobies = await mongooseQuery;
  res.status(200).json({ results: hobies.length, data: hobies });
});

exports.getHobie = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const hobieId = req.params.id;
  const hobie = await Hobie.findOne({ _id: hobieId, userId });
  if (!hobie) {
    return next(new ApiError("invalid user ID or hobie ID -_-", 400));
  }
  res.status(200).json({ data: hobie });
});
