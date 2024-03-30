const router = require("express").Router();

const { protect } = require("../middlewares/Auth/protect");
const {
  signUp,
  signIn,
  forgetPassword,
  resetPassword,
  verifyPwResetCode,
  uploadProfilImage,
  resizeProfilImage,
  updateUser,
  deleteUser,
  updatePassword,
  verifySignUp,
} = require("../services/userServices");
const {
  signUpValidator,
  signInValidator,
  forgetPasswordValidator,
  verifyPwResetCodeValidator,
  resetPasswordValidator,
  deleteUserValidator,
  updatePasswordValidator,
  verifySignUpValidator,
} = require("../utils/validators/userValidator");
router.post(
  "/signup",
  uploadProfilImage,
  resizeProfilImage,
  signUpValidator,
  signUp
);

router.post("/verifySignUpCode", verifySignUpValidator, verifySignUp);

router.post("/signin", signInValidator, signIn);

router.post("/forgetPassword", forgetPasswordValidator, forgetPassword);
router.post(
  "/verifyPwResetCode",
  verifyPwResetCodeValidator,
  verifyPwResetCode
);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

router.put("/updatePassword", protect, updatePasswordValidator, updatePassword);

router.put("/", protect, uploadProfilImage, resizeProfilImage, updateUser);
router.delete("/:id", protect, deleteUserValidator, deleteUser);

module.exports = router;
