import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema({
  challengeId: {
    type: String,
    required: true,
    unique: true
  },
  sender: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true
  },
  senderRating: {
    type: Number,
    required: true
  },
  receiverRating: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'terminated'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  questions: [
    {
      contestId: Number,
      index: String,
      name: String,
      url: String,
      rating: Number
    }
  ],
  startTime: Date,
  endTime: Date,
  winner: {
    type: String,
    enum: ['sender', 'receiver', null],
    default: null
  },
  terminationReason: {
    type: String,
    default: null
  },
  completedBy: {
    type: String,
    default: null
  },

  
  questionWinners: {
  type: [String], // 'sender', 'receiver', or null
  default: [null, null, null]
}
 
});

const Challenge = mongoose.model('Challenge', ChallengeSchema);
export default Challenge;
