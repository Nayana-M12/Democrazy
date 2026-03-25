const express = require("express");
const router = express.Router();
const Analytics = require("../models/analytics");

// GET analytics stats
router.get("/", async (req, res) => {
  try {
    const stats = await Analytics.findOne();
    if (!stats) return res.json({ examsTaken: 0, promisesGenerated: 0 });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
