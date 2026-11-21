
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 130,
    },
    condition: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
    id: false,
    versionKey: false,
  }
);

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required."],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
      maxlength: 20,
      validate: {
        validator(value) {
          const digits = value.replace(/\D/g, "");
          return /^\+?[\d\s()-]+$/.test(value) &&
            digits.length >= 7 &&
            digits.length <= 15;
        },
        message: "Please provide a valid phone number.",
      },
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required."],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    hospital: {
      type: String,
      required: [true, "Hospital name is required."],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    patients: {
      type: [patientSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ status: 1 });
doctorSchema.index({ createdAt: -1 });

const Doctor =
  mongoose.models.Doctor ||
  mongoose.model("Doctor", doctorSchema);

export default Doctor;
