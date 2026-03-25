const express = require("express");
const router = express.Router();
const Leaderboard = require("../models/leaderboard");
const Analytics = require("../models/analytics");

// GET top 10 leaderboard entries
router.get("/", async (req, res) => {
  try {
    const entries = await Leaderboard.find().sort({ score: -1 }).limit(10);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// POST a new score
router.post("/", async (req, res) => {
  const { name, score } = req.body;
  if (!name || score === undefined) {
    return res.status(400).json({ error: "name and score are required" });
  }
  try {
    const entry = await Leaderboard.create({ name, score });

    // increment exams taken
    await Analytics.findOneAndUpdate(
      {},
      { $inc: { examsTaken: 1 } },
      { upsert: true }
    );

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
});

module.exports = router;
