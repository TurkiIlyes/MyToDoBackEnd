const router = require("express").Router();

const { protect } = require("../middlewares/Auth/protect");
const {
  addTask,
  updateTask,
  deleteTask,
  getTasks,
  updateTaskStatus,
  uploadTaskImage,
  resizeTaskImage,
  getTask,
} = require("../services/taskServices");
const {
  addTaskValidator,
  deleteTaskValidator,
  getTasksValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
} = require("../utils/validators/taskValidator");

router.post(
  "/",
  protect,
  uploadTaskImage,
  resizeTaskImage,
  addTaskValidator,
  addTask
);

router.put(
  "/:id",
  protect,
  uploadTaskImage,
  resizeTaskImage,
  updateTaskValidator,
  updateTask
);

router.put(
  "/updateTaskStatus/:id",
  protect,
  updateTaskStatusValidator,
  updateTaskStatus
);

router.delete("/:id", protect, deleteTaskValidator, deleteTask);

router.get("/", protect, getTasks);

router.get("/:id", protect, getTask);

module.exports = router;
