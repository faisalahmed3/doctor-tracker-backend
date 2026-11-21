
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

import Doctor from "../models/Doctor.js";
import AppError from "../utils/AppError.js";

const PATIENT_FIELDS = ["name", "age", "condition"];

const validateDoctorId = (id) => {
  if (!/^[0-9a-fA-F]{24}$/.test(String(id))) {
    throw new AppError("Invalid doctor ID.", 400);
  }
};

const normalizeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString().slice(0, 10);
};

const formatPatient = (patient) => {
  if (!patient) return null;

  return {
    id: patient.id,
    name: patient.name,
    age: patient.age,
    condition: patient.condition,
    registeredAt: normalizeDate(patient.registeredAt),
  };
};

const sanitizePatientData = (data = {}) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("Invalid patient information.", 400);
  }

  return Object.fromEntries(
    PATIENT_FIELDS
      .filter((field) => Object.hasOwn(data, field))
      .map(([field]) => [field, data[field]])
  );
};

const parsePagination = (query = {}) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  if (!Number.isSafeInteger(page) || page < 1) {
    throw new AppError("Invalid page number.", 400);
  }

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError("Limit must be between 1 and 100.", 400);
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const getAllPatients = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const [result] = await Doctor.aggregate([
    { $unwind: "$patients" },
    {
      $project: {
        _id: 0,
        id: "$patients.id",
        name: "$patients.name",
        age: "$patients.age",
        condition: "$patients.condition",
        registeredAt: "$patients.registeredAt",
        doctorId: { $toString: "$_id" },
        doctorName: "$name",
        specialization: "$specialization",
        hospital: "$hospital",
        doctorStatus: "$status",
      },
    },
    { $sort: { registeredAt: -1, id: 1 } },
    {
      $facet: {
        records: [
          { $skip: skip },
          { $limit: limit },
        ],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const totalPatients = result?.total?.[0]?.count || 0;

  return {
    patients: (result?.records || []).map((patient) => ({
      ...patient,
      registeredAt: normalizeDate(patient.registeredAt),
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(totalPatients / limit)),
      totalPatients,
      limit,
    },
  };
};

export const getDoctorPatients = async (doctorId) => {
  validateDoctorId(doctorId);

  const doctor = await Doctor.findById(doctorId)
    .select("patients")
    .lean();

  if (!doctor) {
    throw new AppError("Doctor not found.", 404);
  }

  return (doctor.patients || []).map(formatPatient);
};

export const createPatient = async (doctorId, patientData) => {
  validateDoctorId(doctorId);

  const patient = {
    ...sanitizePatientData(patientData),
    id: `PAT-${randomUUID()}`,
    registeredAt: new Date(),
  };

  const doctor = await Doctor.findOneAndUpdate(
    {
      _id: doctorId,
      status: "Active",
    },
    {
      $push: { patients: patient },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!doctor) {
    throw new AppError("Active doctor not found.", 404);
  }

  const savedPatient = doctor.patients.find(
    (item) => item.id === patient.id
  );

  return formatPatient(savedPatient);
};

export const updatePatient = async (
  doctorId,
  patientId,
  updates
) => {
  validateDoctorId(doctorId);

  const sanitizedUpdates = sanitizePatientData(updates);

  if (!Object.keys(sanitizedUpdates).length) {
    throw new AppError(
      "Please provide at least one valid field to update.",
      400
    );
  }

  const fields = Object.fromEntries(
    Object.entries(sanitizedUpdates).map(([key, value]) => [
      `patients.$.${key}`,
      value,
    ])
  );

  const doctor = await Doctor.findOneAndUpdate(
    {
      _id: doctorId,
      "patients.id": patientId,
    },
    {
      $set: fields,
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!doctor) {
    throw new AppError("Patient not found for this doctor.", 404);
  }

  return formatPatient(
    doctor.patients.find((patient) => patient.id === patientId)
  );
};

export const deletePatient = async (doctorId, patientId) => {
  validateDoctorId(doctorId);

  const doctor = await Doctor.findOneAndUpdate(
    {
      _id: doctorId,
      "patients.id": patientId,
    },
    {
      $pull: { patients: { id: patientId } },
    },
    {
      new: true,
    }
  ).select("_id").lean();

  if (!doctor) {
    throw new AppError("Patient not found for this doctor.", 404);
  }

  return { id: patientId };
};

export const transferPatient = async (
  oldDoctorId,
  patientId,
  newDoctorId
) => {
  validateDoctorId(oldDoctorId);
  validateDoctorId(newDoctorId);

  if (oldDoctorId.toLowerCase() === newDoctorId.toLowerCase()) {
    throw new AppError(
      "Patient is already assigned to this doctor.",
      400
    );
  }

  let transferredPatient;

  await mongoose.connection.transaction(async (session) => {
    const oldDoctor = await Doctor.findOne({
      _id: oldDoctorId,
      "patients.id": patientId,
    }).session(session);

    if (!oldDoctor) {
      throw new AppError(
        "Patient or source doctor not found.",
        404
      );
    }

    const newDoctor = await Doctor.findOne({
      _id: newDoctorId,
      status: "Active",
    }).session(session);

    if (!newDoctor) {
      throw new AppError(
        "Destination doctor not found or inactive.",
        404
      );
    }

    const patient = oldDoctor.patients.find(
      (item) => item.id === patientId
    );

    if (!patient) {
      throw new AppError("Patient not found.", 404);
    }

    const patientData = patient.toObject();

    const removal = await Doctor.updateOne(
      {
        _id: oldDoctorId,
        "patients.id": patientId,
      },
      {
        $pull: { patients: { id: patientId } },
      },
      { session }
    );

    if (removal.modifiedCount !== 1) {
      throw new AppError("Patient transfer failed.", 409);
    }

    const addition = await Doctor.updateOne(
      {
        _id: newDoctorId,
        status: "Active",
      },
      {
        $push: { patients: patientData },
      },
      {
        session,
        runValidators: true,
      }
    );

    if (addition.modifiedCount !== 1) {
      throw new AppError(
        "Unable to assign the destination doctor.",
        409
      );
    }

    transferredPatient = {
      ...formatPatient(patientData),
      doctorId: newDoctorId,
    };
  });

  return transferredPatient;
};
