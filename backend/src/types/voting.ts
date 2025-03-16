export interface VotingResult {
  id: string;
  date: string;
  title: string;
  totalVotes?: number;
  votesFor?: number;
  votesAgainst?: number;
  abstained?: number;
  didNotVote?: number;
  deputies?: Deputy[];
}

export interface Deputy {
  id: string;
  name: string;
  faction?: string;
  vote?: "for" | "against" | "abstained" | "not_voted";
}

export interface VotingStatistics {
  totalSessions: number;
  averageParticipation: number;
  factionStatistics: Record<string, FactionStats>;
}

export interface FactionStats {
  totalMembers: number;
  averageParticipation: number;
  votingPattern: {
    for: number;
    against: number;
    abstained: number;
    notVoted: number;
  };
} 