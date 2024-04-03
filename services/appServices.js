const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

exports.sendAppEmail = asyncHandler(async (req, res) => {
  const { message } = req.body;
  console.log("APP:SEND-EMAIL");
  console.log(message);
  const users = await User.find();

  users.forEach(async (user) => {
    const subject = "Notification!";
    const html = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; max-width: 600px; margin: 20px auto; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333333;">Notification !!</h1>
        <p>Dear ${user.name},</p>
        <p>${message}</p>
         <p>Thank you for choosing ${process.env.APP_NAME}!</p>
        <p>Best regards,<br>${process.env.APP_NAME} Team</p>
    </div>
    `;

    await sendEmail({
      email: user.email,
      subject,
      html,
    });
  });
  res.status(200).json("Email sent successfully");
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  console.log("APP:GET-USERS");
  const users = await User.find();
  res.status(200).json(users);
});

exports.getStatus = asyncHandler(async (req, res) => {
  console.log("APP:GET-STATUS");
  const totalUsers = await User.find();
  const todayUsers = await User.find({
    createdAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) },
  });
  const weekUsers = await User.find({
    createdAt: { $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) },
  });

  res.status(200).json({
    totalUsers: totalUsers.length,
    todayUsers: todayUsers.length,
    weekUsers: weekUsers.length,
  });
});
