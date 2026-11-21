
import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .max(20, "Phone number is too long.")
  .refine((value) => {
    const digits = value.replace(/\D/g, "");

    return (
      /^\+?[\d\s()-]+$/.test(value) &&
      digits.length >= 7 &&
      digits.length <= 15
    );
  }, "Enter a valid phone number.");

const doctorFields = {
  name: z
    .string()
    .trim()
    .min(2, "Doctor name must be at least 2 characters.")
    .max(80, "Doctor name cannot exceed 80 characters."),

  specialization: z
    .string()
    .trim()
    .min(2, "Specialization is required.")
    .max(100, "Specialization cannot exceed 100 characters."),

  hospital: z
    .string()
    .trim()
    .min(2, "Hospital name is required.")
    .max(150, "Hospital name cannot exceed 150 characters."),

  phone: phoneSchema,

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email address is too long.")
    .toLowerCase(),
};

export const createDoctorSchema = z.strictObject(doctorFields);

export const updateDoctorSchema = z
  .strictObject(doctorFields)
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required for updating a doctor."
  );

export const doctorIdSchema = z.strictObject({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID."),
});
