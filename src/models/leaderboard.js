const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  score: { type: Number, required: true, min: 0 },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
