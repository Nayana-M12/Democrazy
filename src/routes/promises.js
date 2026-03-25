const express = require("express");
const router = express.Router();
const Analytics = require("../models/analytics");

const subjects = [
  "free WiFi on every cloud",
  "a second moon for better lighting",
  "Monday to be declared illegal",
  "pizza as the national currency",
  "naps as a fundamental right",
  "free time machines for senior citizens",
  "gravity reduction on Fridays",
  "a government-issued pet dragon for every household",
  "traffic jams replaced by teleportation booths",
  "rain only on weekdays between 3–4 AM",
];

const actions = [
  "within my first 100 days",
  "if elected, definitely maybe",
  "as soon as the paperwork clears",
  "once we figure out the budget (we won't)",
  "by the next election cycle, probably",
  "after extensive committee discussions that go nowhere",
  "pending approval from my astrologer",
];

// GET a random promise
router.get("/", async (req, res) => {
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const promise = `I solemnly promise to deliver ${subject} ${action}.`;

  try {
    await Analytics.findOneAndUpdate(
      {},
      { $inc: { promisesGenerated: 1 } },
      { upsert: true }
    );
  } catch (_) {
    // analytics failure shouldn't break the response
  }

  res.json({ promise });
});

module.exports = router;
