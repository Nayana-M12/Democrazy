const express = require("express");
const router = express.Router();

const openings = [
  "My fellow citizens, the time has come",
  "Friends, countrymen, and confused voters",
  "People of this great nation, hear me",
  "As I stand before you today, slightly sweating",
];

const middles = [
  "to address the issues that nobody asked about but I will talk about anyway.",
  "to promise things that sound great in a rally but mean absolutely nothing.",
  "to remind you that change is coming — I just can't say what kind.",
  "to assure you that I have a plan. It is in a folder. Somewhere.",
];

const buzzwords = [
  "Together, we will synergize our collective forward-thinking paradigms.",
  "The future is bright, transparent, and full of stakeholder engagement.",
  "We must leverage our grassroots momentum for sustainable disruption.",
  "I believe in a holistic, inclusive, and vaguely defined tomorrow.",
];

const closings = [
  "Vote for me, because the other guy is worse. Probably.",
  "Thank you, and may your taxes remain mysteriously unexplained.",
  "God bless you, and God bless this entirely made-up exam.",
  "Remember: I said it, so it must be true. Clap now.",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// GET a random political speech
router.get("/", (req, res) => {
  const speech = `${pick(openings)}, ${pick(middles)} ${pick(buzzwords)} ${pick(closings)}`;
  res.json({ speech });
});

module.exports = router;
