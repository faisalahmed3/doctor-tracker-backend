
import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";
import AppError from "../utils/AppError.js";

const CREATE_FIELDS = [
  "name",
  "email",
  "phone",
  "specialization",
  "hospital",
];

const ALLOWED_SORT_FIELDS = new Set([
  "name",
  "email",
  "specialization",
  "hospital",
  "status",
  "createdAt",
  "updatedAt",
]);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const validateDoctorId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid doctor ID.", 400);
  }
};

const normalizeDoctor = (doctor) => {
  if (!doctor) return null;

  const data =
    typeof doctor.toObject === "function"
      ? doctor.toObject()
      : doctor;

  const { _id, __v, ...rest } = data;

  return {
    ...rest,
    id: String(_id ?? data.id),
  };
};

const handleDatabaseError = (error) => {
  if (error.statusCode) throw error;

  if (error.code === 11000) {
    const field = Object.keys(
      error.keyPattern || error.keyValue || {}
    )[0];

    throw new AppError(
      `A doctor with this ${field === "email" ? "email address" : field || "information"} already exists.`,
      409
    );
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors || {})
      .map((item) => item.message)
      .join(", ");

    throw new AppError(message || "Database validation failed.", 400);
  }

  if (error.name === "CastError") {
    throw new AppError("Invalid doctor ID.", 400);
  }

  throw error;
};

const sanitizeDoctorData = (data = {}) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError("Invalid doctor information.", 400);
  }

  return Object.fromEntries(
    CREATE_FIELDS
      .filter((field) => Object.hasOwn(data, field))
      .map((field) => [field, data[field]])
  );
};

const parsePositiveInteger = (
  value,
  defaultValue,
  field,
  max = Number.MAX_SAFE_INTEGER
) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 1 ||
    parsed > max
  ) {
    throw new AppError(`Invalid ${field}.`, 400);
  }

  return parsed;
};

const getQueryString = (value, field, maxLength = 100) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value !== "string") {
    throw new AppError(`Invalid ${field}.`, 400);
  }

  const result = value.trim();

  if (result.length > maxLength) {
    throw new AppError(`${field} is too long.`, 400);
  }

  return result;
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildDateFilter = (fromDate, toDate) => {
  const filter = {};

  const parseDate = (value, field, endOfDay = false) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new AppError(`Invalid ${field}.`, 400);
    }

    const date = new Date(
      `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
    );

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new AppError(`Invalid ${field}.`, 400);
    }

    return date;
  };

  if (fromDate) {
    filter.$gte = parseDate(fromDate, "start date");
  }

  if (toDate) {
    filter.$lte = parseDate(toDate, "end date", true);
  }

  if (filter.$gte && filter.$lte && filter.$gte > filter.$lte) {
    throw new AppError(
      "Start date cannot be after end date.",
      400
    );
  }

  return Object.keys(filter).length ? filter : null;
};

export const createDoctor = async (doctorData) => {
  try {
    const doctor = await Doctor.create(
      sanitizeDoctorData(doctorData)
    );

    return normalizeDoctor(doctor);
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const getAllDoctors = async (query = {}) => {
  const page = parsePositiveInteger(
    query.page,
    DEFAULT_PAGE,
    "page"
  );

  const limit = parsePositiveInteger(
    query.limit,
    DEFAULT_LIMIT,
    "limit",
    MAX_LIMIT
  );

  const filter = {};
  const skip = (page - 1) * limit;

  const search = getQueryString(query.search, "search");

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
      { specialization: regex },
      { hospital: regex },
    ];
  }

  const specialization = getQueryString(
    query.specialization,
    "specialization"
  );

  if (specialization) {
    filter.specialization = specialization;
  }

  const status = getQueryString(query.status, "status");

  if (status) {
    if (!["Active", "Inactive"].includes(status)) {
      throw new AppError("Invalid doctor status.", 400);
    }

    filter.status = status;
  }

  const fromDate = getQueryString(
    query.fromDate,
    "start date",
    10
  );

  const toDate = getQueryString(
    query.toDate,
    "end date",
    10
  );

  const dateFilter = buildDateFilter(fromDate, toDate);

  if (dateFilter) {
    filter.createdAt = dateFilter;
  }

  const requestedSort = getQueryString(
    query.sortBy,
    "sort field"
  );

  const sortBy = ALLOWED_SORT_FIELDS.has(requestedSort)
    ? requestedSort
    : "createdAt";

  const sortOrder = getQueryString(
    query.sortOrder,
    "sort order"
  );

  if (sortOrder && !["asc", "desc"].includes(sortOrder)) {
    throw new AppError("Sort order must be asc or desc.", 400);
  }

  const direction = sortOrder === "asc" ? 1 : -1;

  const [doctors, totalDoctors] = await Promise.all([
    Doctor.find(filter)
      .sort({ [sortBy]: direction, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Doctor.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalDoctors / limit));

  return {
    doctors: doctors.map(normalizeDoctor),
    pagination: {
      currentPage: page,
      totalPages,
      totalDoctors,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const getDoctorById = async (doctorId) => {
  validateDoctorId(doctorId);

  const doctor = await Doctor.findById(doctorId).lean();

  if (!doctor) {
    throw new AppError("Doctor not found.", 404);
  }

  return normalizeDoctor(doctor);
};

export const updateDoctor = async (doctorId, updateData) => {
  validateDoctorId(doctorId);

  const sanitizedData = sanitizeDoctorData(updateData);

  if (!Object.keys(sanitizedData).length) {
    throw new AppError(
      "Please provide at least one valid field to update.",
      400
    );
  }

  try {
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: sanitizedData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doctor) {
      throw new AppError("Doctor not found.", 404);
    }

    return normalizeDoctor(doctor);
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const deleteDoctor = async (doctorId) => {
  validateDoctorId(doctorId);

  try {
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: { status: "Inactive" } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doctor) {
      throw new AppError("Doctor not found.", 404);
    }

    return normalizeDoctor(doctor);
  } catch (error) {
    handleDatabaseError(error);
  }
};
