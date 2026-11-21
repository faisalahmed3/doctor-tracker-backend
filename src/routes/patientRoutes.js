
import { Router } from "express";

import {
  getAllPatients,
  getDoctorPatients,
  createPatient,
  updatePatient,
  deletePatient,
  transferPatient,
} from "../controllers/patientController.js";

import {
  protect,
  restrictTo,
} from "../middleware/authMiddleware.js";

import { validateBody } from "../middleware/validate.js";

import {
  createPatientSchema,
  updatePatientSchema,
  transferPatientSchema,
} from "../validators/patientValidator.js";

const router = Router();

router.use(protect, restrictTo("admin"));

router.get("/", getAllPatients);
router.get("/doctor/:doctorId", getDoctorPatients);

router.post(
  "/doctor/:doctorId",
  validateBody(createPatientSchema),
  createPatient
);

router.patch(
  "/doctor/:doctorId/:patientId",
  validateBody(updatePatientSchema),
  updatePatient
);

router.delete(
  "/doctor/:doctorId/:patientId",
  deletePatient
);

router.post(
  "/doctor/:doctorId/:patientId/transfer",
  validateBody(transferPatientSchema),
  transferPatient
);

export default router;
