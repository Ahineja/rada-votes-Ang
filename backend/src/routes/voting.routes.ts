import { Router } from "express";
import { VotingController } from "../controllers/voting.controller";

const router = Router();
const votingController = new VotingController();

// Get all voting sessions
router.get("/", votingController.getAllVotings);

// Get specific voting session by ID
router.get("/:id", votingController.getVotingById);

// Get voting statistics
router.get("/statistics/summary", votingController.getVotingStatistics);

// Get faction-specific statistics
router.get("/statistics/faction/:factionName", votingController.getFactionStatistics);

// Update voting data from ZIP files
router.post("/update", votingController.updateVotingData);

// Get list of available voting data
router.get("/available", votingController.getAvailableData);

export const votingRoutes = router; 