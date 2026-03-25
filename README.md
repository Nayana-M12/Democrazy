# 🗳️ Democrazy – Politician Entrance Coaching Portal

> The world's first (and only) preparation platform for an exam that doesn't exist.

Democrazy is a satirical web app that humorously prepares users for a fictional "Politician Eligibility Exam." Since no real exam is required to become a politician, we built one — completely pointless, entirely entertaining.

---

## 🚀 Features

- **Mock Eligibility Exam** — NET (for MLAs) and DDT (for MPs) with 10 satirical questions each
- **Promise Generator** — Generates absurd election promises using your constituency name
- **Speech Generator** — Produces vague, meaningless rally speeches on any topic
- **Leaderboard** — Hall of shame ranked by exam scores, saved to MongoDB
- **Political News Feed** — 12 satirical headlines with custom SVG illustrations
- **User Auth** — Register/login with age verification (18+) via date of birth
- **Profile Management** — Edit name, party, constituency, avatar, and password
- **Multi-language Support** — English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ)
- **Landing Page** — Dark grid-style landing page at `/`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Fonts | Google Fonts (Inter) |

---

## 📁 Project Structure

```
Democrazy/
├── server.js           # Express server entry point
├── landing.html        # Landing page
├── index.html          # Main app
├── app.js              # Frontend logic
├── style.css           # Styles
├── questions.js        # Exam questions (English)
├── questions_hi.js     # Exam questions (Hindi)
├── questions_kn.js     # Exam questions (Kannada)
├── translations.js     # Full UI translations
├── package.json
├── .env                # Environment variables (not committed)
└── src/
    ├── config/
    │   └── db.js       # MongoDB connection
    ├── models/
    │   ├── leaderboard.js
    │   ├── user.js
    │   └── analytics.js
    └── routes/
        ├── leaderboard.js
        ├── user.js
        ├── analytics.js
        ├── promises.js
        └── speech.js
```

---

## ⚙️ Setup & Run

1. Clone the repo and install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/democrazy?retryWrites=true&w=majority
```

3. Start the server:
```bash
npm run dev
```

4. Open your browser at `http://localhost:5000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Fetch top 10 scores |
| POST | `/api/leaderboard` | Submit exam score |
| POST | `/api/users/register` | Register a user |
| GET | `/api/analytics` | Get usage stats |
| GET | `/api/promises` | Random election promise |
| GET | `/api/speech` | Random political speech |

---

## 🎭 Demo Accounts

| Username | Password |
|----------|----------|
| netaji123 | jai_hind |
| modi2024 | vikas123 |
| rahul_g | congress1 |
| kejri_broom | aap4ever |

---

## 📝 Notes

- Age verification: must be 18+ to register or login
- Scores are saved to MongoDB Atlas
- Frontend falls back to localStorage if backend is unavailable
- All promises and speeches are fictional and satirical

---

*A Stupid Hackathon Project — because democracy deserves better, but this is what we built.*
