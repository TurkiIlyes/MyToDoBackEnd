const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.addTaskValidator = [
  check("title")
    .notEmpty()
    .withMessage("title required")
    .isLength({ max: 30 })
    .withMessage("too long title"),
  check("status").custom(async (status) => {
    if (!["To Do", "In Progress", "Done"].includes(status)) {
      throw new Error("invalid status -_-");
    }
    return true;
  }),
  check("details").isLength({ max: 256 }).withMessage("too long details"),
  check("startDate"),
  check("checkSendEmail"),
  validatorMiddleware,
];

exports.deleteTaskValidator = [
  check("id")
    .notEmpty()
    .withMessage("ID required")
    .isMongoId()
    .withMessage("should be MongoDB ID"),
  validatorMiddleware,
];

exports.updateTaskValidator = [
  check("title").isLength({ max: 30 }).withMessage("too long title"),
  check("status").custom(async (status) => {
    if (!["To Do", "In Progress", "Done"].includes(status)) {
      throw new Error("invalid status -_-");
    }
    return true;
  }),
  check("details").isLength({ max: 256 }).withMessage("too long details"),
  check("startDate"),
  check("checkSendEmail"),
  validatorMiddleware,
];

exports.updateTaskStatusValidator = [
  check("status").custom(async (status) => {
    if (!["To Do", "In Progress", "Done"].includes(status)) {
      throw new Error("invalid status -_-");
    }
    return true;
  }),

  validatorMiddleware,
];
