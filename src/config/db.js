
import dns from "node:dns";
import mongoose from "mongoose";

let connectionPromise = null;
let dnsConfigured = false;

const configureDns = () => {
  if (process.env.NODE_ENV === "production" || dnsConfigured) {
    return;
  }

  const servers = (
    process.env.DNS_SERVERS || "1.1.1.1,1.0.0.1"
  )
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length) {
    dns.setServers(servers);
    dnsConfigured = true;

    console.log(`DNS Resolvers Configured: ${servers.join(", ")}`);
  }
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI?.trim();

  if (!mongoURI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (
    mongoose.connection.readyState === 0 ||
    mongoose.connection.readyState === 3
  ) {
    connectionPromise = null;
  }

  if (!connectionPromise) {
    configureDns();

    connectionPromise = mongoose
      .connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 5,
        minPoolSize: 0,
      })
      .then(() => {
        console.log(
          `MongoDB Connected Successfully: ${mongoose.connection.host}`
        );

        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;

        console.error(
          "MongoDB Connection Failed:",
          error.message
        );

        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;
