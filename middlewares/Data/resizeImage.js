const sharp = require("sharp");
const { uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `profil-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/profil/${filename}`);
    req.body.image = filename;
  }
  next();
});

module.exports = resizeImage;
