
import "dotenv/config";

import app from "./app.js";
import connectDB from "./src/config/db.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log("----------------------------------");
      console.log(" Doctor Tracker Backend Started");
      console.log(` Server: http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("----------------------------------");
    });

    server.on("error", (error) => {
      console.error("Server Error:", error.message);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error("Server Startup Failed:", error.message);
    process.exitCode = 1;
  }
};

startServer();
