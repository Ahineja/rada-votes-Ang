import axios from "axios";
import * as cheerio from "cheerio";
import { VotingResult, VotingStatistics, FactionStats } from "../types/voting";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { VotingModel } from "../models/voting.model";

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

export class VotingService {
  private readonly savedDataDir = path.join(__dirname, "../../saved-data");

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.savedDataDir)) {
      throw new Error("Saved data directory does not exist!");
    }
  }

  private async processLocalData(dataDir: string): Promise<VotingResult[]> {
    try {
      const files = await readdir(dataDir);
      const jsonFiles = files.filter(file => file.endsWith(".json"));
      
      if (jsonFiles.length === 0) {
        console.log(`⚠️ No JSON files found in directory: ${dataDir}`);
        return [];
      }

      const results: VotingResult[] = [];
      
      // Process all JSON files in the directory
      for (const jsonFile of jsonFiles) {
        try {
          const content = await readFile(path.join(dataDir, jsonFile), "utf-8");
          const data = JSON.parse(content);
          const result = this.transformStructuredData(data, path.parse(jsonFile).name);
          if (result) {
            results.push(result);
          }
        } catch (error) {
          console.error(`❌ Error processing file ${jsonFile}:`, error);
          continue;
        }
      }

      return results;
    } catch (error) {
      console.error(`❌ Error processing directory ${dataDir}:`, error);
      return [];
    }
  }

  public async updateVotingData(): Promise<void> {
    try {
      console.log("🔄 Starting local voting data update...");
      
      // Get all subdirectories in saved-data
      const dataDirs = await readdir(this.savedDataDir);
      const validDirs = dataDirs.filter(dir => !dir.startsWith("."));
      
      if (validDirs.length === 0) {
        console.log("⚠️ No data directories found");
        return;
      }

      console.log(`📂 Found ${validDirs.length} data directories to process`);

      for (const dir of validDirs) {
        console.log(`📥 Processing directory: ${dir}`);
        const fullPath = path.join(this.savedDataDir, dir);
        const stats = await fs.promises.stat(fullPath);
        
        if (stats.isDirectory()) {
          const votingResults = await this.processLocalData(fullPath);
          
          for (const votingData of votingResults) {
            // Save to MongoDB
            await VotingModel.findOneAndUpdate(
              { 
                date: votingData.date, 
                title: votingData.title,
                fileId: votingData.fileId 
              },
              votingData,
              { upsert: true, new: true }
            );
          }
          console.log(`✅ Successfully processed and saved ${votingResults.length} files from ${dir}`);
        }
      }
      
      console.log("✅ Local voting data update completed successfully");
    } catch (error: unknown) {
      console.error("❌ Error updating voting data:", error);
      throw new Error(`Failed to update voting data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private transformStructuredData(data: any, fileId: string): VotingResult {
    const deputies = data.DPList?.map((d: any) => ({
      name: d.DPName || "",
      faction: "", // Faction information is not available in the source data
      vote: this.normalizeVote(d.DPGolos)
    })) || [];

    return {
      fileId, // Add unique file identifier
      date: data.GLTime?.split(" ")[0] || "", // Extract date from GLTime
      title: data.GL_Text || "",
      totalVotes: deputies.length,
      votesFor: deputies.filter((d: any) => d.vote === "for").length,
      votesAgainst: deputies.filter((d: any) => d.vote === "against").length,
      abstained: deputies.filter((d: any) => d.vote === "abstained").length,
      didNotVote: deputies.filter((d: any) => d.vote === "not_voted").length,
      deputies
    };
  }

  private normalizeVote(vote: string): "for" | "against" | "abstained" | "not_voted" {
    if (!vote) return "not_voted";
    
    const normalizedVote = vote.trim();
    if (normalizedVote === "За") return "for";
    if (normalizedVote === "Проти") return "against";
    if (normalizedVote === "Утримався") return "abstained";
    if (normalizedVote === "Не голосував" || normalizedVote === ".........") return "not_voted";
    
    return "not_voted";
  }

  public async getAllVotings(): Promise<VotingResult[]> {
    const votings = await VotingModel.find().sort({ date: -1 }).lean();
    return votings.map(voting => ({
      ...voting,
      _id: voting._id.toString(),
      fileId: voting.fileId || undefined
    })) as VotingResult[];
  }

  public async getVotingById(id: string): Promise<VotingResult | null> {
    const voting = await VotingModel.findById(id).lean();
    return voting ? {
      ...voting,
      _id: voting._id.toString(),
      fileId: voting.fileId || undefined
    } as VotingResult : null;
  }

  public async getAvailableData(): Promise<Array<{ id: string; date: string; title: string }>> {
    const votings = await VotingModel.find({}, { _id: 1, date: 1, title: 1 })
      .sort({ date: -1 })
      .lean();
    
    return votings.map(voting => ({
      id: voting._id.toString(),
      date: voting.date,
      title: voting.title
    }));
  }

  public async getVotingStatistics(): Promise<VotingStatistics> {
    const votings = await VotingModel.find().lean();
    const factionMap = new Map<string, FactionStats>();
    
    let totalParticipation = 0;
    let totalSessions = votings.length;

    // Process each voting session
    votings.forEach(voting => {
      if (!voting.deputies?.length) return;

      const participationRate = ((voting.votesFor || 0) + (voting.votesAgainst || 0) + (voting.abstained || 0)) / voting.deputies.length;
      totalParticipation += participationRate;

      // Process faction statistics
      const factionVotes = new Map<string, { total: number, patterns: Record<string, number> }>();

      voting.deputies.forEach(deputy => {
        if (!deputy.faction) return;

        const factionData = factionVotes.get(deputy.faction) || { 
          total: 0, 
          patterns: { for: 0, against: 0, abstained: 0, notVoted: 0 } 
        };

        factionData.total++;
        if (deputy.vote) {
          factionData.patterns[deputy.vote === "not_voted" ? "notVoted" : deputy.vote]++;
        }

        factionVotes.set(deputy.faction, factionData);
      });

      // Update overall faction statistics
      factionVotes.forEach((data, faction) => {
        const existingStats = factionMap.get(faction) || {
          totalMembers: data.total,
          averageParticipation: 0,
          votingPattern: { for: 0, against: 0, abstained: 0, notVoted: 0 }
        };

        existingStats.votingPattern.for += data.patterns.for;
        existingStats.votingPattern.against += data.patterns.against;
        existingStats.votingPattern.abstained += data.patterns.abstained;
        existingStats.votingPattern.notVoted += data.patterns.notVoted;

        factionMap.set(faction, existingStats);
      });
    });

    // Calculate final statistics
    const factionStatistics: Record<string, FactionStats> = {};
    factionMap.forEach((stats, faction) => {
      const totalVotes = stats.votingPattern.for + stats.votingPattern.against + 
                        stats.votingPattern.abstained + stats.votingPattern.notVoted;
      
      factionStatistics[faction] = {
        totalMembers: stats.totalMembers,
        averageParticipation: totalVotes > 0 ? 
          (stats.votingPattern.for + stats.votingPattern.against + stats.votingPattern.abstained) / totalVotes : 0,
        votingPattern: stats.votingPattern
      };
    });

    return {
      totalSessions,
      averageParticipation: totalSessions > 0 ? totalParticipation / totalSessions : 0,
      factionStatistics
    };
  }

  public async getFactionStatistics(factionName: string): Promise<FactionStats | null> {
    const votings = await VotingModel.find({ "deputies.faction": factionName }).lean();
    if (!votings.length) return null;

    let totalMembers = 0;
    let totalParticipation = 0;
    const votingPattern = { for: 0, against: 0, abstained: 0, notVoted: 0 };

    votings.forEach(voting => {
      const factionDeputies = voting.deputies.filter(d => d.faction === factionName);
      totalMembers = Math.max(totalMembers, factionDeputies.length);

      factionDeputies.forEach(deputy => {
        if (deputy.vote) {
          votingPattern[deputy.vote === "not_voted" ? "notVoted" : deputy.vote]++;
        }
      });

      const participation = factionDeputies.filter(d => d.vote !== "not_voted").length;
      totalParticipation += participation / factionDeputies.length;
    });

    return {
      totalMembers,
      averageParticipation: votings.length > 0 ? totalParticipation / votings.length : 0,
      votingPattern
    };
  }
} 