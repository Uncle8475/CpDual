import mongoose from "mongoose";

const AllCodeforcesSchema = new mongoose.Schema({
  contestId: {
    type: Number,
    required: true,
  },
  index: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
  },
  tags: {
    type: [String],
    default: [],
  },
  url: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});


AllCodeforcesSchema.index({ contestId: 1, index: 1 }, { unique: true });

const AllCodeforces = mongoose.model("AllCodeforces", AllCodeforcesSchema);

export default AllCodeforces;
