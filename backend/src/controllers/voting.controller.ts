import { Request, Response } from "express";
import { VotingService } from "../services/voting.service";
import { VotingResult, VotingStatistics } from "../types/voting";

export class VotingController {
  private votingService: VotingService;

  constructor() {
    this.votingService = new VotingService();
  }

  public getAllVotings = async (req: Request, res: Response): Promise<void> => {
    try {
      const votings = await this.votingService.getAllVotings();
      res.json(votings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch voting data" });
    }
  };

  public getVotingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const voting = await this.votingService.getVotingById(req.params.id);
      if (!voting) {
        res.status(404).json({ message: "Voting session not found" });
        return;
      }
      res.json(voting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch voting data" });
    }
  };

  public getVotingStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await this.votingService.getVotingStatistics();
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch voting statistics" });
    }
  };

  public getFactionStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const factionStats = await this.votingService.getFactionStatistics(req.params.factionName);
      if (!factionStats) {
        res.status(404).json({ message: "Faction not found" });
        return;
      }
      res.json(factionStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch faction statistics" });
    }
  };

  public updateVotingData = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.votingService.updateVotingData();
      res.json({ message: "Voting data updated successfully" });
    } catch (error) {
      console.error("Error updating voting data:", error);
      res.status(500).json({ message: "Failed to update voting data" });
    }
  };

  public getAvailableData = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.votingService.getAvailableData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching available data:", error);
      res.status(500).json({ message: "Failed to fetch available data" });
    }
  };
} 