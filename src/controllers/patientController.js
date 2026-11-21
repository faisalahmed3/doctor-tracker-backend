
import {
  getAllPatients as getAllPatientsService,
  getDoctorPatients as getDoctorPatientsService,
  createPatient as createPatientService,
  updatePatient as updatePatientService,
  deletePatient as deletePatientService,
  transferPatient as transferPatientService,
} from "../services/patientService.js";

export const getAllPatients = async (req, res) => {
  const result = await getAllPatientsService(req.query);

  res.status(200).json({
    success: true,
    data: result.patients,
    pagination: result.pagination,
  });
};

export const getDoctorPatients = async (req, res) => {
  const patients = await getDoctorPatientsService(req.params.doctorId);

  res.status(200).json({
    success: true,
    data: patients,
  });
};

export const createPatient = async (req, res) => {
  const patient = await createPatientService(
    req.params.doctorId,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Patient added successfully.",
    data: patient,
  });
};

export const updatePatient = async (req, res) => {
  const patient = await updatePatientService(
    req.params.doctorId,
    req.params.patientId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Patient updated successfully.",
    data: patient,
  });
};

export const deletePatient = async (req, res) => {
  const result = await deletePatientService(
    req.params.doctorId,
    req.params.patientId
  );

  res.status(200).json({
    success: true,
    message: "Patient deleted successfully.",
    data: result,
  });
};

export const transferPatient = async (req, res) => {
  const patient = await transferPatientService(
    req.params.doctorId,
    req.params.patientId,
    req.body.newDoctorId
  );

  res.status(200).json({
    success: true,
    message: "Patient transferred successfully.",
    data: patient,
  });
};
