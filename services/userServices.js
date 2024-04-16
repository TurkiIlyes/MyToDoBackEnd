const crypto = require("crypto");

const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { uploadImage } = require("../middlewares/Data/uploadImage");

exports.uploadProfilImage = uploadImage("image");

exports.resizeProfilImage = asyncHandler(async (req, res, next) => {
  const filename = `profil-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(720, 1080)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/profil/${filename}`);
    req.body.image = filename;
  }
  next();
});

exports.signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, image } = req.body;

  const checkUser = await User.findOne({ email });
  if (checkUser && !checkUser.accountVerifyed) {
    await User.findOneAndDelete({ email });
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, +process.env.BCRYPT_SALT),
    image,
  });

  const signUpCode = Math.floor(Math.random() * 900000 + 100000).toString();

  const hashedSignUpCode = crypto
    .createHash("sha256")
    .update(signUpCode)
    .digest("hex");

  user.signUpCode = hashedSignUpCode;
  user.signUpCodeExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  const subject = "Subject: Your Sign Up Code - Act Now!";
  const html = `
  <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; max-width: 600px; margin: 20px auto; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #333333;">Sign Up Request</h1>
      <p>Dear ${user.name},</p>
      <p>You're just one step away from resetting your password and regaining access to your account!</p>
      <p>We've received a request to reset the password associated with your account. To ensure the security of your account, we've generated a unique reset code for you. This code is valid for the next 10 minutes.</p>
      <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          <strong>Reset Code:</strong> ${signUpCode}
      </div>
      <p>Please use this code promptly to set a new password for your account. Simply enter the reset code when prompted during the password reset process on our website.</p>
      <p>Remember, your account security is our top priority. If you didn't initiate this password reset or suspect any unauthorized activity, please reach out to our support team immediately.</p>
      <p>Thank you for choosing ${process.env.APP_NAME}!</p>
      <p>Best regards,<br>${process.env.APP_NAME} Team</p>
  </div>
  `;
  try {
    await sendEmail({
      email: user.email,
      subject,
      html,
    });
  } catch (err) {
    user.signUpCode = undefined;
    user.signUpCodeExpires = undefined;
    await user.save();
    return next(new ApiError("There is an error in sending email -_-", 500));
  }

  res.status(201).json({ data: { email: user.email } });
});

exports.verifySignUp = asyncHandler(async (req, res, next) => {
  const { signUpCode, email } = req.body;
  const hashedSignUpCode = crypto
    .createHash("sha256")
    .update(signUpCode)
    .digest("hex");
  console.log(signUpCode, email);
  const user = await User.findOne({
    email,
    signUpCode: hashedSignUpCode,
    signUpCodeExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("code invalid or expired"));
  }
  user.accountVerifyed = true;
  await user.save();

  const token = generateToken(user._id);
  delete user._doc.password;
  res.status(201).json({ data: user, token });
});

exports.signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (
    !user ||
    !(await bcrypt.compare(password, user.password)) ||
    !user.accountVerifyed
  ) {
    return next(new ApiError("Invalid email or password", 401));
  }
  const token = generateToken(user._id);
  delete user._doc.password;
  res.status(200).json({ data: user, token });
});

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !user.accountVerifyed) {
    return next(new ApiError("There is no user with this email", 400));
  }
  const resetCode = Math.floor(Math.random() * 900000 + 100000).toString();

  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.pwResetCode = hashedResetCode;
  user.pwResetExpires = Date.now() + 10 * 60 * 1000;
  user.pwResetVerified = false;

  await user.save();

  const subject = "Subject: Your Password Reset Code - Act Now!";
  const html = `
  <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; max-width: 600px; margin: 20px auto; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #333333;">Password Reset Request</h1>
      <p>Dear ${user.name},</p>
      <p>You're just one step away from resetting your password and regaining access to your account!</p>
      <p>We've received a request to reset the password associated with your account. To ensure the security of your account, we've generated a unique reset code for you. This code is valid for the next 10 minutes.</p>
      <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          <strong>Reset Code:</strong> ${resetCode}
      </div>
      <p>Please use this code promptly to set a new password for your account. Simply enter the reset code when prompted during the password reset process on our website.</p>
      <p>Remember, your account security is our top priority. If you didn't initiate this password reset or suspect any unauthorized activity, please reach out to our support team immediately.</p>
      <p>Thank you for choosing ${process.env.APP_NAME}!</p>
      <p>Best regards,<br>${process.env.APP_NAME} Team</p>
  </div>
  `;
  try {
    await sendEmail({
      email: user.email,
      subject,
      html,
    });
  } catch (err) {
    user.pwResetCode = undefined;
    user.pwResetExpires = undefined;
    user.pwResetVerified = undefined;
    await user.save();
    return next(new ApiError("There is an error in sending email -_-", 500));
  }
  res.status(200).json({
    status: "success",
    message: "reset code send to email",
  });
});

exports.verifyPwResetCode = asyncHandler(async (req, res, next) => {
  console.log(req.body.resetcode);
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetcode)
    .digest("hex");
  const user = await User.findOne({
    email: req.body.email,
    pwResetCode: hashedResetCode,
    pwResetExpires: { $gt: Date.now() },
  });
  console.log(hashedResetCode);
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }
  user.pwResetVerified = true;
  await user.save();
  res.status(200).json({ status: "success", message: "correct reset code" });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("There is no user with this email", 404));
  }

  if (!user.pwResetVerified) {
    return next(new ApiError("reset code not verified", 400));
  }
  user.password = await bcrypt.hash(
    req.body.password,
    +process.env.BCRYPT_SALT
  );
  user.pwUpdatedAt = Date.now();
  user.pwResetCode = undefined;
  user.pwResetExpires = undefined;
  user.pwResetVerified = undefined;
  await user.save();
  const token = generateToken(user._id);
  delete user._doc.password;
  res.status(200).json({ data: user, token });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(userId);

  if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
    return next(new ApiError("Invalid password", 400));
  }
  user.password = await bcrypt.hash(newPassword, +process.env.BCRYPT_SALT);
  user.pwUpdatedAt = Date.now();
  user.pwResetCode = undefined;
  user.pwResetExpires = undefined;
  user.pwResetVerified = undefined;
  await user.save();
  const token = generateToken(user._id);
  delete user._doc.password;
  res.status(201).json({ data: user, token });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { name, email, image } = req.body;
  console.log(name, email, image);

  if (email && (await User.findOne({ email }))) {
    return next(new ApiError("email used", 400));
  }

  const notEmptyData = {};
  for (const [key, value] of Object.entries({ name, email, image })) {
    if (value) {
      notEmptyData[key] = value;
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: notEmptyData },
    { new: true }
  );
  if (!user) {
    return next(new ApiError("There is no user with this id", 400));
  }
  const token = generateToken(user._id);
  delete user._doc.password;
  res.status(201).json({ data: user, token });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { password } = req.body;
  const user = await User.findById(userId);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Invalid password", 400));
  }
  await User.findByIdAndDelete(userId);
  res
    .status(200)
    .json({ status: "success", message: "account deleted successfully" });
});
