const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.addHobieValidator = [
  check("title")
    .notEmpty()
    .withMessage("title required")
    .isLength({ max: 30 })
    .withMessage("too long title"),
  check("startTime").notEmpty().withMessage("start time required"),
  check("endTime").notEmpty().withMessage("end time required"),
  validatorMiddleware,
];
exports.deleteHobieValidator = [
  check("id")
    .notEmpty()
    .withMessage("ID required")
    .isMongoId()
    .withMessage("should be MongoDB ID"),
  validatorMiddleware,
];

exports.updateHobieValidator = [
  check("id")
    .notEmpty()
    .withMessage("ID required")
    .isMongoId()
    .withMessage("should be MongoDB ID"),
  check("title"),
  check("startTime"),
  check("endTime"),
  validatorMiddleware,
];
