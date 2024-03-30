const router = require("express").Router();

const { protect } = require("../middlewares/Auth/protect");
const {
  addHobie,
  updateHobie,
  deleteHobie,
  getHobies,
  updateHobieStatus,
  uploadHobieImage,
  resizeHobieImage,
  getHobie,
} = require("../services/hobieServices");
const {
  addHobieValidator,
  deleteHobieValidator,
  getHobiesValidator,
  updateHobieValidator,
  updateHobieStatusValidator,
} = require("../utils/validators/hobieValidator");

router.post(
  "/",
  protect,
  uploadHobieImage,
  resizeHobieImage,
  addHobieValidator,
  addHobie
);

router.put(
  "/:id",
  protect,
  uploadHobieImage,
  resizeHobieImage,
  updateHobieValidator,
  updateHobie
);

router.delete("/:id", protect, deleteHobieValidator, deleteHobie);

router.get("/", protect, getHobies);

router.get("/:id", protect, getHobie);

module.exports = router;
