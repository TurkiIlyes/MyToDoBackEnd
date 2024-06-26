const multer = require("multer");
const ApiError = require("../../utils/ApiError");

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.split("/")[0] === "image") {
      cb(null, true);
    } else {
      cb(new ApiError("only Images allowed -_-", 400), false);
    }
  };
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};

exports.uploadImage = (fieldName) => multerOptions().single(fieldName);
