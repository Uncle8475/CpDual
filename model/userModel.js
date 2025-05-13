import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  },
  localRating: {
    type: Number,
    default: 1500
  },
  duelsWon: {
    type: Number,
    default: 0
  },
  duelsLost: {
    type: Number,
    default: 0
  },
  cfRating: {
    type: Number,
    default: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  duelHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Duel"
    }
  ]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


userSchema.virtual("totalDuels").get(function () {
  return this.duelsWon + this.duelsLost;
});

export default mongoose.model("users", userSchema);
