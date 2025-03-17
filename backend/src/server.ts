import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { votingRoutes } from "./routes/voting.routes";
import { connectDatabase } from "./config/database";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ Error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// Routes
app.use("/api/voting", votingRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API endpoint: http://localhost:${PORT}/api/voting`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer(); 