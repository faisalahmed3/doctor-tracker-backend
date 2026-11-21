
import {
  createDoctor as createDoctorService,
  getAllDoctors as getAllDoctorsService,
  getDoctorById as getDoctorByIdService,
  updateDoctor as updateDoctorService,
  deleteDoctor as deleteDoctorService,
} from "../services/doctorService.js";

const sendSuccess = (res, statusCode, message, data, extra = {}) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });

export const createDoctor = async (req, res) => {
  const doctor = await createDoctorService(req.body);

  return sendSuccess(res, 201, "Doctor created successfully.", doctor);
};

export const getAllDoctors = async (req, res) => {
  const result = await getAllDoctorsService(req.query);

  return sendSuccess(
    res,
    200,
    "Doctors retrieved successfully.",
    result.doctors,
    { pagination: result.pagination }
  );
};

export const getDoctorById = async (req, res) => {
  const doctor = await getDoctorByIdService(req.params.id);

  return sendSuccess(res, 200, "Doctor retrieved successfully.", doctor);
};

export const getDoctor = getDoctorById;

export const updateDoctor = async (req, res) => {
  const doctor = await updateDoctorService(req.params.id, req.body);

  return sendSuccess(res, 200, "Doctor updated successfully.", doctor);
};

export const deleteDoctor = async (req, res) => {
  const doctor = await deleteDoctorService(req.params.id);

  return sendSuccess(
    res,
    200,
    "Doctor deactivated successfully.",
    doctor
  );
};
