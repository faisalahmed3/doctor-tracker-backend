
import { Router } from "express";

import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";

import {
  protect,
  restrictTo,
} from "../middleware/authMiddleware.js";

import { validateBody } from "../middleware/validate.js";

import {
  createDoctorSchema,
  updateDoctorSchema,
} from "../validators/doctorValidator.js";

const router = Router();

router.use(protect, restrictTo("admin"));

router.post("/", validateBody(createDoctorSchema), createDoctor);
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.patch("/:id", validateBody(updateDoctorSchema), updateDoctor);
router.delete("/:id", deleteDoctor);

export default router;
