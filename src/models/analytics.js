const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  examsTaken: { type: Number, default: 0 },
  promisesGenerated: { type: Number, default: 0 },
});

module.exports = mongoose.model("Analytics", analyticsSchema);
