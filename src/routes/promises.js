const express = require("express");
const router = express.Router();
const Analytics = require("../models/analytics");

const promises = [
  (c) => `I solemnly promise the people of ${c} that every household will receive a free mango tree, a pet cow, and unlimited data — all by next Tuesday.`,
  (c) => `If elected from ${c}, I will personally ensure that potholes are renamed 'adventure zones' and declared a tourist attraction.`,
  (c) => `The youth of ${c} deserve better. That is why I promise to build 500 colleges, 200 hospitals, and one very large statue of myself.`,
  (c) => `I promise ${c} will have 24/7 electricity — except during load shedding, which I promise will only happen during sleeping hours.`,
  (c) => `Every family in ${c} will get ₹15 lakh. The money is currently in Switzerland. I am personally going to fetch it next week.`,
  (c) => `I promise to make ${c} the Silicon Valley of India. Step 1: Rename the main road 'Silicon Road'. Step 2: Done.`,
  (c) => `The people of ${c} will get free WiFi on every cloud. We are currently in talks with the clouds.`,
  (c) => `I promise that Monday will be declared illegal in ${c} within my first 100 days. The paperwork is almost ready.`,
  (c) => `Every citizen of ${c} will receive a government-issued pet dragon. Delivery timelines are subject to dragon availability.`,
  (c) => `Traffic jams in ${c} will be replaced by teleportation booths. The technology is almost invented.`,
  (c) => `I promise rain in ${c} will only happen on weekdays between 3–4 AM so it doesn't disturb anyone.`,
  (c) => `Pizza will become the official currency of ${c} under my government. Exchange rates will be announced after elections.`,
  (c) => `Naps will be declared a fundamental right in ${c}. A Ministry of Sleep will be established immediately.`,
  (c) => `I promise to build a bullet train between ${c} and the moon. Ticket prices will be very reasonable.`,
  (c) => `Every pothole in ${c} will be filled — with gold. We are currently sourcing the gold from the previous government's promises.`,
  (c) => `I promise the sun will rise 2 hours later in ${c} so people can sleep more. We are in talks with NASA.`,
  (c) => `Free biryani every Sunday for all residents of ${c}. The biryani will be home-delivered by trained government pigeons.`,
  (c) => `I promise to rename ${c} to something cooler. A committee has been formed to decide the new name by 2047.`,
  (c) => `Gravity will be reduced by 30% in ${c} on Fridays so the weekend feels lighter. Science is working on it.`,
  (c) => `Every child in ${c} will get a free time machine for school commute. Production begins after the next election.`,
  (c) => `I promise ${c} will have zero corruption within 5 years. The corrupt officials have been asked to please stop.`,
  (c) => `All exams in ${c} will be replaced by a vibe check. Results will be announced based on confidence levels.`,
  (c) => `I promise to personally reply to every complaint from ${c} within 10 years, give or take a decade.`,
  (c) => `The roads of ${c} will be so smooth, you'll forget you're in India. We are importing roads from Switzerland.`,
  (c) => `I promise ${c} will have flying cars by 2030. The cars are currently learning to fly.`,
  (c) => `I promise the people of ${c} that school bags will be replaced by WhatsApp forwards. Education will be fully digital and completely unverified.`,
  (c) => `Under my government, ${c} will get a second sun for better lighting. Environmental clearance is pending.`,
  (c) => `I promise to build a wall around ${c} to keep out bad vibes. Tenders have been issued to the lowest bidder's cousin.`,
  (c) => `Under my rule, ${c} will export moonlight to other countries. Foreign exchange earnings expected to be astronomical.`,
  (c) => `I promise the people of ${c} that all potholes will be converted into swimming pools. Lifeguards are being recruited from the unemployment committee.`,
  (c) => `The air in ${c} will be so clean, you can bottle it and sell it abroad. A committee has been formed to smell it first.`,
  (c) => `Under my rule, ${c} will get a direct flight to Mars. Boarding passes will be distributed after the next election.`,
  (c) => `I promise every cow in ${c} will have its own Aadhaar card. Biometric enrollment begins next monsoon.`,
  (c) => `The internet speed in ${c} will be so fast, your complaints will reach me before you even type them. Action will still take 10 years.`,
  (c) => `Under my government, ${c} will have a 25-hour day. The extra hour will be used exclusively for government meetings that achieve nothing.`,
];

// GET a random promise
router.get("/", async (req, res) => {
  const promise = promises[Math.floor(Math.random() * promises.length)]("your constituency");

  try {
    await Analytics.findOneAndUpdate(
      {},
      { $inc: { promisesGenerated: 1 } },
      { upsert: true }
    );
  } catch (_) {}

  res.json({ promise });
});

module.exports = router;
