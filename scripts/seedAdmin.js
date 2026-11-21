
import "dotenv/config";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../src/models/User.js";
import connectDB from "../src/config/db.js";

const seedAdmin = async () => {
  const name = process.env.ADMIN_NAME || "System Administrator";
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be configured."
    );
  }

  if (password.length < 8) {
    throw new Error("Administrator password must be at least 8 characters.");
  }

  await connectDB();

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log("----------------------------------");
  console.log("Administrator initialized successfully");
  console.log(`Email: ${email}`);
  console.log("Password: configured securely");
  console.log("----------------------------------");
};

try {
  await seedAdmin();
} catch (error) {
  console.error("Administrator Initialization Failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
