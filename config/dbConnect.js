const mongoose = require("mongoose");

const dbConnect = () => {
  mongoose.connect(process.env.DB_URI).then(() => {
    console.log("Data Base Connected *.* ");
  });
};

module.exports = dbConnect;
