const { check } = require("express-validator");
const User = require("../../models/userModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
exports.signUpValidator = [
  check("name")
    .notEmpty()
    .withMessage("username required")
    .isLength({ max: 20 })
    .withMessage("too long username"),
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email adress")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user && user.accountVerifyed) {
        throw new Error("email already used -_-");
      }
      return true;
    }),
  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 8 })
    .withMessage("too short password")
    .custom((password, { req }) => {
      if (password !== req.body.passwordconfirm) {
        throw new Error("password confirmation error");
      }
      return true;
    }),
  check("passwordconfirm")
    .notEmpty()
    .withMessage("password confirmation required"),
  validatorMiddleware,
];

exports.verifySignUpValidator = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email adress"),
  check("signUpCode")
    .notEmpty()
    .withMessage("signUpCode required")
    .isLength({ min: 6, max: 6 })
    .withMessage("signUpCode should be 6 numbers"),
  validatorMiddleware,
];

exports.signInValidator = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email adress"),
  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 8 })
    .withMessage("too short password"),
  validatorMiddleware,
];

exports.forgetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email adress"),
  validatorMiddleware,
];
exports.verifyPwResetCodeValidator = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email adress"),
  check("resetcode")
    .notEmpty()
    .withMessage("resetcode required")
    .isLength({ min: 6, max: 6 })
    .withMessage("resetcode should be 6 numbers"),
  validatorMiddleware,
];

exports.resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalid email adress"),
  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 8 })
    .withMessage("too short password")
    .custom((password, { req }) => {
      if (password !== req.body.passwordconfirm) {
        throw new Error("password confirmation error");
      }
      return true;
    }),
  check("passwordconfirm")
    .notEmpty()
    .withMessage("password confirmation required"),
  validatorMiddleware,
];

exports.updatePasswordValidator = [
  check("oldPassword")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 8 })
    .withMessage("too short password"),
  check("newPassword")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 8 })
    .withMessage("too short password")
    .custom((newPassword, { req }) => {
      if (newPassword !== req.body.confirmNewPassword) {
        throw new Error("password confirmation error");
      }
      return true;
    }),
  check("confirmNewPassword")
    .notEmpty()
    .withMessage("password confirmation required"),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id")
    .notEmpty()
    .withMessage("ID required")
    .isMongoId()
    .withMessage("should be MongoDB ID"),
  validatorMiddleware,
];
