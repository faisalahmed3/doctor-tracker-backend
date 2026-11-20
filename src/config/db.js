
import dns from "node:dns";
import mongoose from "mongoose";

// Use public DNS resolvers for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    const connection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(
      `MongoDB Connected Successfully: ${connection.connection.host}`
    );

    return connection;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};

export default connectDB;
