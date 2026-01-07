const express = require("express");
const {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
} = require("../controllers/exerciseController");

const router = express.Router();

router.post("/", createExercise);
router.get("/", getExercises);
router.get("/:id", getExerciseById);
router.put("/:id", updateExercise);
router.patch("/:id", updateExercise);
router.delete("/:id", deleteExercise);

module.exports = router;
