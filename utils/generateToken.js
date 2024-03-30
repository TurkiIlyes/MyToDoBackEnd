const jwt = require("jsonwebtoken");
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

module.exports = generateToken;
