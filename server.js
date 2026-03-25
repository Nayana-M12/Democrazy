require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./src/config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/leaderboard", require("./src/routes/leaderboard"));
app.use("/api/users", require("./src/routes/user"));
app.use("/api/analytics", require("./src/routes/analytics"));
app.use("/api/promises", require("./src/routes/promises"));
app.use("/api/speech", require("./src/routes/speech"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve static files (css, js, etc.)
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
