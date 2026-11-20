
import "dotenv/config";

import app from "./app.js";
import connectDB from "./src/config/db.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start Express server only after successful DB connection
    app.listen(PORT, () => {
      console.log("----------------------------------");
      console.log(" Doctor Tracker Backend Started");
      console.log(` Server: http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV}`);
      console.log("----------------------------------");
    });

  } catch (error) {
    console.error("Server Startup Failed:", error.message);
    process.exit(1);
  }
};

startServer();
