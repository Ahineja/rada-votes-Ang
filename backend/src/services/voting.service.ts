import axios from "axios";
import * as cheerio from "cheerio";
import { VotingResult, VotingStatistics, FactionStats, Deputy } from "../types/voting";
import * as fs from "fs";
import * as path from "path";
import AdmZip from "adm-zip";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

export class VotingService {
  private readonly baseUrl = "https://kmr.gov.ua/uk/result_golosuvanya";
  private readonly dataDir = path.join(__dirname, "../../data");
  private readonly zipDir = path.join(this.dataDir, "zips");
  private readonly extractedDir = path.join(this.dataDir, "extracted");
  private cachedData: VotingResult[] | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.dataDir, this.zipDir, this.extractedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private async downloadAndExtractZip(zipUrl: string, fileName: string): Promise<void> {
    try {
      const response = await axios.get(zipUrl, { responseType: "arraybuffer" });
      const zipPath = path.join(this.zipDir, fileName);
      await writeFile(zipPath, response.data);

      const zip = new AdmZip(zipPath);
      const extractDir = path.join(this.extractedDir, fileName.replace(".zip", ""));
      zip.extractAllTo(extractDir, true);
    } catch (error) {
      console.error(`Error processing ZIP file ${fileName}:`, error);
      throw error;
    }
  }

  private async fetchZipLinks(): Promise<Array<{ url: string; date: string }>> {
    try {
      const response = await axios.get(this.baseUrl);
      const $ = cheerio.load(response.data);
      const links: Array<{ url: string; date: string }> = [];

      // Find all ZIP links from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      $("a").each((_, element) => {
        const href = $(element).attr("href");
        const text = $(element).text();
        
        if (href?.endsWith(".zip") && text.includes("структуровані дані")) {
          const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
          if (dateMatch) {
            const date = new Date(dateMatch[1].split(".").reverse().join("-"));
            if (date >= threeMonthsAgo) {
              links.push({
                url: href.startsWith("http") ? href : `https://kmr.gov.ua${href}`,
                date: dateMatch[1]
              });
            }
          }
        }
      });

      return links;
    } catch (error) {
      console.error("Error fetching ZIP links:", error);
      throw error;
    }
  }

  public async updateVotingData(): Promise<void> {
    try {
      const links = await this.fetchZipLinks();
      
      for (const link of links) {
        const fileName = `voting_${link.date.replace(/\./g, "_")}.zip`;
        await this.downloadAndExtractZip(link.url, fileName);
      }

      // Clear cache to force data refresh
      this.cachedData = null;
    } catch (error) {
      console.error("Error updating voting data:", error);
      throw error;
    }
  }

  private async parseExtractedData(): Promise<VotingResult[]> {
    const results: VotingResult[] = [];
    const files = fs.readdirSync(this.extractedDir);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = await readFile(path.join(this.extractedDir, file), "utf-8");
        const data = JSON.parse(content);
        results.push(this.transformStructuredData(data));
      }
    }

    return results;
  }

  private transformStructuredData(data: any): VotingResult {
    // Transform the structured data into our VotingResult format
    // This will need to be implemented based on the actual JSON structure
    return {
      id: data.id || this.generateUniqueId(),
      date: data.date || "",
      title: data.title || "",
      totalVotes: data.totalVotes,
      votesFor: data.votesFor,
      votesAgainst: data.votesAgainst,
      abstained: data.abstained,
      didNotVote: data.didNotVote,
      deputies: data.deputies?.map((d: any) => ({
        id: d.id || this.generateUniqueId(),
        name: d.name,
        faction: d.faction,
        vote: d.vote
      }))
    };
  }

  private async fetchAndParseData(): Promise<VotingResult[]> {
    try {
      const response = await axios.get(this.baseUrl);
      return this.parseVotingData(response.data);
    } catch (error) {
      console.error("Error fetching voting data:", error);
      throw new Error("Failed to fetch voting data");
    }
  }

  private parseVotingData(html: string): VotingResult[] {
    const $ = cheerio.load(html);
    const votingResults: VotingResult[] = [];

    // Find all voting tables
    $("table").each((index: number, element: cheerio.Element) => {
      const votingResult: VotingResult = {
        id: this.generateUniqueId(),
        date: "",
        title: "",
        deputies: []
      };

      // Extract date and title
      const headerRow = $(element).find("tr").first();
      votingResult.date = headerRow.find("td").first().text().trim();
      votingResult.title = headerRow.find("td").last().text().trim();

      // Parse deputy rows
      $(element).find("tr").slice(1).each((index: number, row: cheerio.Element) => {
        const cells = $(row).find("td");
        if (cells.length >= 3) {
          const deputy: Deputy = {
            id: this.generateUniqueId(),
            name: cells.eq(0).text().trim(),
            faction: cells.eq(1).text().trim(),
            vote: this.parseVote(cells.eq(2).text().trim())
          };
          votingResult.deputies?.push(deputy);
        }
      });

      // Calculate voting statistics
      if (votingResult.deputies?.length) {
        votingResult.totalVotes = votingResult.deputies.length;
        votingResult.votesFor = votingResult.deputies.filter(d => d.vote === "for").length;
        votingResult.votesAgainst = votingResult.deputies.filter(d => d.vote === "against").length;
        votingResult.abstained = votingResult.deputies.filter(d => d.vote === "abstained").length;
        votingResult.didNotVote = votingResult.deputies.filter(d => d.vote === "not_voted").length;
      }

      votingResults.push(votingResult);
    });

    return votingResults;
  }

  private parseVote(voteText: string): "for" | "against" | "abstained" | "not_voted" {
    const lowerVote = voteText.toLowerCase();
    if (lowerVote.includes("за")) return "for";
    if (lowerVote.includes("проти")) return "against";
    if (lowerVote.includes("утримався")) return "abstained";
    return "not_voted";
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private async getDataWithCache(): Promise<VotingResult[]> {
    const now = Date.now();
    if (!this.cachedData || now - this.lastFetchTime > this.CACHE_DURATION) {
      this.cachedData = await this.fetchAndParseData();
      this.lastFetchTime = now;
    }
    return this.cachedData;
  }

  public async getAllVotings(): Promise<VotingResult[]> {
    return this.getDataWithCache();
  }

  public async getVotingById(id: string): Promise<VotingResult | null> {
    const votings = await this.getDataWithCache();
    return votings.find(voting => voting.id === id) || null;
  }

  public async getVotingStatistics(): Promise<VotingStatistics> {
    const votings = await this.getDataWithCache();
    const factionMap = new Map<string, FactionStats>();
    
    // Calculate statistics
    let totalParticipation = 0;
    votings.forEach(voting => {
      if (voting.deputies) {
        totalParticipation += (voting.totalVotes || 0) / voting.deputies.length;
        
        // Process faction statistics
        voting.deputies.forEach(deputy => {
          if (deputy.faction) {
            const factionStats = factionMap.get(deputy.faction) || {
              totalMembers: 0,
              averageParticipation: 0,
              votingPattern: { for: 0, against: 0, abstained: 0, notVoted: 0 }
            };
            
            // Update faction statistics
            factionStats.totalMembers++;
            if (deputy.vote) {
              factionStats.votingPattern[deputy.vote === "not_voted" ? "notVoted" : deputy.vote]++;
            }
            
            factionMap.set(deputy.faction, factionStats);
          }
        });
      }
    });

    return {
      totalSessions: votings.length,
      averageParticipation: totalParticipation / votings.length,
      factionStatistics: Object.fromEntries(factionMap)
    };
  }

  public async getFactionStatistics(factionName: string): Promise<FactionStats | null> {
    const statistics = await this.getVotingStatistics();
    return statistics.factionStatistics[factionName] || null;
  }

  public async getAvailableData(): Promise<Array<{ date: string; title: string }>> {
    try {
      const files = fs.readdirSync(this.extractedDir);
      const availableData: Array<{ date: string; title: string }> = [];

      for (const file of files) {
        if (file.endsWith(".json")) {
          const content = await readFile(path.join(this.extractedDir, file), "utf-8");
          const data = JSON.parse(content);
          availableData.push({
            date: data.date || "",
            title: data.title || ""
          });
        }
      }

      return availableData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error getting available data:", error);
      throw error;
    }
  }
} 