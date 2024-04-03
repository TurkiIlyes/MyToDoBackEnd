const path = require("path");

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const dbConnect = require("./config/dbConnect");
const globalError = require("./middlewares/globalError");
const ApiError = require("./utils/ApiError");
const userRoute = require("./routes/userRoutes");
const taskRoute = require("./routes/taskRoutes");
const hobieRoute = require("./routes/hobieRoutes");
const scheduleEmails = require("./utils/scheduleEmails");
const {
  sendAppEmail,
  getAllUsers,
  getStatus,
} = require("./services/appServices");
dbConnect();
const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

// test
app.post("/send-email", sendAppEmail);

app.get("/users", getAllUsers);

app.get("/status", getStatus);

// test

app.use("/user", userRoute);
app.use("/tasks", taskRoute);
app.use("/hobies", hobieRoute);
app.use("*", (req, res, next) => {
  next(new ApiError("Can't find this route ", 404));
});

app.use(globalError);

const server = app.listen(process.env.PORT, () => {
  console.log(`APP STARTING ON PORT ${process.env.PORT}... ^^ `);
});

process.on("uncaughtException", () => {
  console.log("uncaughtException");
  server.close(() => {
    console.log(`APP SHUTTING DOWN... *.* `);
    process.exit(1);
  });
});

cron.schedule("* * * * *", scheduleEmails);
