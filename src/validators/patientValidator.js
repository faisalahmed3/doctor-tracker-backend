
import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID.");

const patientFields = {
  name: z
    .string()
    .trim()
    .min(2, "Patient name must be at least 2 characters.")
    .max(80),

  age: z
    .number()
    .int("Age must be a whole number.")
    .min(0)
    .max(130),

  condition: z
    .string()
    .trim()
    .min(2, "Patient condition is required.")
    .max(200),
};

export const createPatientSchema = z.strictObject(patientFields);

export const updatePatientSchema = z
  .strictObject(patientFields)
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required."
  );

export const transferPatientSchema = z.strictObject({
  newDoctorId: objectId,
});
