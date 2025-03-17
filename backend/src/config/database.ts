import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rada-votes";

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log("📍 URI:", MONGODB_URI.replace(/mongodb:\/\/([^:]+):([^@]+)@/, "mongodb://****:****@")); // Hide credentials if any

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connection established");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 MongoDB disconnected");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}; 