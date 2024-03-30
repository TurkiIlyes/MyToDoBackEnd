const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const ApiError = require("../../utils/ApiError");
const User = require("../../models/userModel");

exports.protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization || null;
  if (!token) {
    return next(new ApiError("You are not login, please login -_-", 401));
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findById(decodedToken.userId);
  if (!user) {
    return next(new ApiError("user with this token no more exist -_-", 401));
  }
  if (decodedToken.iat < parseInt(user.pwUpdatedAt.getTime() / 1000)) {
    return next(
      new ApiError("user changed his password , please login again -_-", 401)
    );
  }
  req.user = user;
  next();
});
