
import "dotenv/config";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";

const seedAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
      process.env;

    // Validate environment variables
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required."
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error(
        "Admin password must contain at least 12 characters."
      );
    }

    // Connect to MongoDB
    await connectDB();

    const email = ADMIN_EMAIL.trim().toLowerCase();

    // Prevent duplicate admin creation
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      console.log(`Email: ${email}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      ADMIN_PASSWORD,
      12
    );

    // Create administrator
    await User.create({
      name: ADMIN_NAME.trim(),
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("----------------------------------");
    console.log("Admin account created successfully!");
    console.log(`Name: ${ADMIN_NAME}`);
    console.log(`Email: ${email}`);
    console.log("Password: Securely hashed");
    console.log("----------------------------------");

  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    throw error;
  }
};

try {
  await seedAdmin();
} catch {
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
