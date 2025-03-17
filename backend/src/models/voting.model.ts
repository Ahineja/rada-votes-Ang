import { Schema, model } from "mongoose";
import { VotingResult, Deputy } from "../types/voting";

// Deputy Schema
interface IDeputy extends Document {
  name: string;
  faction: string;
  vote: "for" | "against" | "abstained" | "not_voted";
}

const DeputySchema = new Schema<Deputy>({
  name: { type: String, required: true },
  faction: { type: String, required: true },
  vote: { 
    type: String, 
    required: true,
    enum: ["for", "against", "abstained", "not_voted"]
  }
});

// Voting Schema
interface IVoting extends Document {
  date: string;
  title: string;
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  abstained: number;
  didNotVote: number;
  deputies: IDeputy[];
  createdAt: Date;
  updatedAt: Date;
}

const VotingSchema = new Schema<VotingResult>({
  fileId: { type: String },  // Optional field for file identification
  date: { type: String, required: true },
  title: { type: String, required: true },
  totalVotes: { type: Number, required: true },
  votesFor: { type: Number, required: true },
  votesAgainst: { type: Number, required: true },
  abstained: { type: Number, required: true },
  didNotVote: { type: Number, required: true },
  deputies: { type: [DeputySchema], required: true }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
VotingSchema.index({ date: -1 });  // Descending index on date
VotingSchema.index({ fileId: 1 }, { sparse: true });  // Index on fileId, sparse because it's optional

export const VotingModel = model<VotingResult>("Voting", VotingSchema); 