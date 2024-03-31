const moment = require("moment-timezone");

const Task = require("../models/taskModel");
const User = require("../models/userModel");

const sendEmail = require("./sendEmail");

const handleSendEmail = async (task) => {
  const user = await User.findById(task.userId);
  const subject = "Subject: Your task started - Act Now!";
  const html = `
  <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; max-width: 600px; margin: 20px auto; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #333333;">Sign Up Request</h1>
      <p>Dear ${user.name},</p>
      <p>go do your task ### ${task.title} ### .</p>
      <p> ### ${task.details} ### .</p>
       <p>Thank you for choosing ${process.env.APP_NAME}!</p>
      <p>Best regards,<br>${process.env.APP_NAME} Team</p>
  </div>
  `;

  await sendEmail({
    email: user.email,
    subject,
    html,
  });
};
const scheduleEmails = async () => {
  const date = moment().tz("Africa/Tunis");
  // const date = new Date();
  date.set("seconds", 0);
  date.utcOffset(0, true);
  const tasks = await Task.find({
    startDate: date.format(),
    status: "To Do",
  });

  console.log("##########");
  console.log("Current Date : ", date.format());
  console.log(tasks);
  console.log("##########");

  tasks.forEach(async (task) => {
    task.status = "In Progress";
    await task.save();
    if (task.checkSendEmail) {
      handleSendEmail(task);
    }
  });
};

module.exports = scheduleEmails;

// const date = moment().tz("Africa/Tunis");
// const currentMinutes = date.minutes();
// const roundedMinutes = Math.floor(currentMinutes / 30) * 30;

// const gteDate = moment(date).set("minutes", roundedMinutes);
// const lteDate = moment(gteDate).add(30, "minutes");

// const gteDateString = gteDate.format();
// const lteDateString = lteDate.format();

// const tasks = await Task.find({
//   startDate: { $gte: gteDateString, $lt: lteDateString },
//   status: "To Do",
//   checkSendEmail: true,
// });
