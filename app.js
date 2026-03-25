// ── Backend API ────────────────────────────────────────────────────────────
const API = 'http://localhost:5000/api';

// ── Users (persisted in localStorage) ─────────────────────────────────────
const defaultUsers = [
  { username: 'netaji123',   password: 'jai_hind',   name: 'Netaji Kumar', party: 'Janata Dal (Funny)',         constituency: 'Chaos Nagar'    },
  { username: 'modi2024',    password: 'vikas123',   name: 'Vikas Bhai',   party: 'BJP (Bakwaas Janata Party)', constituency: 'Gujarat Central' },
  { username: 'rahul_g',     password: 'congress1',  name: 'Rahul G',      party: 'INC (I Need Chai)',          constituency: 'Wayanad West'   },
  { username: 'kejri_broom', password: 'aap4ever',   name: 'Arvind K',     party: 'AAP (Angry Aam Party)',      constituency: 'Delhi Darbar'   },
];
const users = JSON.parse(localStorage.getItem('democrazy_users') || JSON.stringify(defaultUsers));

let loggedInUser = null;
let selectedExam  = '';
let candidateName = '';
let currentQ      = 0;
let answers       = [];
let timerInterval = null;
let timeLeft      = 3 * 60 * 60;
let leaderboard   = JSON.parse(localStorage.getItem('democrazy_lb') || '[]');

// ── Auto-login on page load ─────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('democrazy_session');
  if (saved) {
    const user = users.find(u => u.username === saved);
    if (user) { loginSuccess(user); return; }
  }
  goTo('page-login');
});

// ── Navigation ──────────────────────────────────────────────────────────────
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
  if (tabId === 'tab-leaderboard') renderLeaderboard();
}

// ── Auth ────────────────────────────────────────────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value.trim();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    document.getElementById('login-error').textContent = "❌ Wrong credentials. Even your voters don't trust you.";
    return;
  }
  document.getElementById('login-error').textContent = '';
  loginSuccess(user);
}

async function handleRegisterNew(e) {
  e.preventDefault();
  const username = document.getElementById('new-username').value.trim();
  if (users.find(u => u.username === username)) {
    document.getElementById('reg-error').textContent = '❌ Username taken. Like every good constituency.';
    return;
  }
  const user = {
    username,
    password:      document.getElementById('new-password').value,
    name:          document.getElementById('new-name').value.trim(),
    party:         document.getElementById('new-party').value.trim(),
    constituency:  document.getElementById('new-constituency').value.trim(),
  };

  // Save to backend
  try {
    await fetch(`${API}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: user.name, email: `${username}@democrazy.com` }),
    });
  } catch (_) { /* backend down — still allow local login */ }

  users.push(user);
  localStorage.setItem('democrazy_users', JSON.stringify(users));
  loginSuccess(user);
}

function loginSuccess(user) {
  loggedInUser = user;
  localStorage.setItem('democrazy_session', user.username);
  document.getElementById('candidate-name').value = user.name;
  document.getElementById('party-name').value      = user.party;
  document.getElementById('constituency').value    = user.constituency;
  document.getElementById('nav-username').textContent = user.name;
  updateProfileUI();
  goTo('page-home');
  renderNews();
}

function goToDashboard() {
  goTo('page-home');
  showTabById('tab-home');
}

function showTabById(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.querySelector(`.nav-link[onclick="showTab('${tabId}')"]`)?.classList.add('active');
}

function restartApp() {
  clearInterval(timerInterval);
  loggedInUser = null;
  localStorage.removeItem('democrazy_session');
  closeEditProfile();
  document.getElementById('profile-menu').classList.remove('open');
  goTo('page-login');
}

// ── Profile ──────────────────────────────────────────────────────────────────
function updateProfileUI() {
  const u = loggedInUser;
  const initial = u.name.charAt(0).toUpperCase();
  document.getElementById('nav-username').textContent   = u.name;
  document.getElementById('profile-avatar').textContent = initial;
  document.getElementById('profile-avatar-lg').textContent = initial;
  document.getElementById('pm-name').textContent  = u.name;
  document.getElementById('pm-party').textContent = u.party;
}

function toggleProfileMenu() {
  document.getElementById('profile-menu').classList.toggle('open');
}

// close menu when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('profile-menu');
  if (dropdown && !e.target.closest('.profile-dropdown')) {
    dropdown.classList.remove('open');
  }
});

function openEditProfile() {
  document.getElementById('profile-menu').classList.remove('open');
  document.getElementById('edit-name').value         = loggedInUser.name;
  document.getElementById('edit-party').value        = loggedInUser.party;
  document.getElementById('edit-constituency').value = loggedInUser.constituency;
  document.getElementById('edit-password').value     = '';
  document.getElementById('edit-error').textContent  = '';
  document.getElementById('profile-modal-overlay').classList.add('open');
  document.getElementById('profile-modal').classList.add('open');
}

function closeEditProfile() {
  document.getElementById('profile-modal-overlay').classList.remove('open');
  document.getElementById('profile-modal').classList.remove('open');
}

function saveProfile(e) {
  e.preventDefault();
  const name         = document.getElementById('edit-name').value.trim();
  const party        = document.getElementById('edit-party').value.trim();
  const constituency = document.getElementById('edit-constituency').value.trim();
  const newPass      = document.getElementById('edit-password').value;

  if (!name || !party || !constituency) {
    document.getElementById('edit-error').textContent = '❌ All fields except password are required.';
    return;
  }

  loggedInUser.name         = name;
  loggedInUser.party        = party;
  loggedInUser.constituency = constituency;
  if (newPass) loggedInUser.password = newPass;

  // persist updated user list
  localStorage.setItem('democrazy_users', JSON.stringify(users));

  // sync hidden fields
  document.getElementById('candidate-name').value = name;
  document.getElementById('party-name').value      = party;
  document.getElementById('constituency').value    = constituency;

  updateProfileUI();
  closeEditProfile();
}

// ── Exam ────────────────────────────────────────────────────────────────────
function selectExam(exam) {
  selectedExam  = exam;
  candidateName = loggedInUser ? loggedInUser.name : document.getElementById('candidate-name').value;
  currentQ      = 0;
  answers       = new Array(10).fill(null);
  timeLeft      = 3 * 60 * 60;

  document.getElementById('exam-title-label').textContent = exam.toUpperCase();
  document.getElementById('candidate-label').textContent  = `Candidate: ${candidateName}`;
  goTo('page-exam');
  renderQuestion();
  startTimer();
}

function renderQuestion() {
  const questions = examQuestions[selectedExam];
  const q = questions[currentQ];
  const total = questions.length;

  document.getElementById('q-counter').textContent = `Question ${currentQ + 1} of ${total}`;
  document.getElementById('progress-bar').style.width = `${((currentQ + 1) / total) * 100}%`;
  document.getElementById('prev-btn').disabled = currentQ === 0;
  document.getElementById('next-btn').disabled = currentQ === total - 1;

  document.getElementById('question-area').innerHTML = `
    <div class="q-number">Q${currentQ + 1} / ${total}</div>
    <div class="q-text">${q.q}</div>
    <div class="options">
      ${q.options.map((opt, i) => `
        <button class="option ${answers[currentQ] === i ? 'selected' : ''}" onclick="selectAnswer(${i})">
          ${String.fromCharCode(65 + i)}. ${opt}
        </button>`).join('')}
    </div>`;
}

function selectAnswer(i) { answers[currentQ] = i; renderQuestion(); }
function nextQuestion()   { if (currentQ < 9) { currentQ++; renderQuestion(); } }
function prevQuestion()   { if (currentQ > 0) { currentQ--; renderQuestion(); } }

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    const h = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
    const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${h}:${m}:${s}`;
    if (timeLeft <= 0) submitExam();
  }, 1000);
}

const verdicts = [
  { max: 2,  emoji: '🤡', text: "Congratulations! You are perfectly qualified for Indian politics. No knowledge required." },
  { max: 4,  emoji: '😬', text: "Below average. You're overqualified for a cabinet post but underqualified for everything else." },
  { max: 6,  emoji: '😐', text: "Mediocre. You might make it as a spokesperson — facts are optional anyway." },
  { max: 8,  emoji: '🤔', text: "Not bad. But knowing things is a disadvantage in politics. Reconsider your career." },
  { max: 10, emoji: '🧠', text: "Excellent! You are dangerously overqualified. Please become a scientist instead." },
];

async function submitExam() {
  clearInterval(timerInterval);
  const questions = examQuestions[selectedExam];
  const score = answers.reduce((acc, ans, i) => acc + (ans === questions[i].answer ? 1 : 0), 0);
  const wrong = answers.filter((a, i) => a !== null && a !== questions[i].answer).length;
  const marks = score * 4 - wrong;
  const verdict = verdicts.find(v => score <= v.max) || verdicts[verdicts.length - 1];

  // Save to leaderboard — update existing entry for same name+exam, don't duplicate
  const existingIdx = leaderboard.findIndex(r => r.name === document.getElementById('candidate-name').value && r.exam === selectedExam.toUpperCase());
  const entry = {
    name:         document.getElementById('candidate-name').value,
    party:        document.getElementById('party-name').value,
    constituency: document.getElementById('constituency').value,
    exam:         selectedExam.toUpperCase(),
    score, marks,
    emoji:        verdict.emoji,
    date:         new Date().toLocaleDateString('en-IN'),
  };
  if (existingIdx >= 0) {
    leaderboard[existingIdx] = entry;
  } else {
    leaderboard.push(entry);
  }
  leaderboard.sort((a, b) => b.marks - a.marks);
  localStorage.setItem('democrazy_lb', JSON.stringify(leaderboard));

  // Save to backend
  try {
    await fetch(`${API}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: entry.name, score: marks }),
    });
  } catch (_) { /* backend down — local leaderboard still works */ }

  document.getElementById('result-emoji').textContent  = verdict.emoji;
  document.getElementById('result-name').textContent   = `${document.getElementById('candidate-name').value} — ${document.getElementById('party-name').value}`;
  document.getElementById('result-score').textContent  = `${score} / 10 correct  •  ${marks} / 40 marks`;
  document.getElementById('result-verdict').textContent = verdict.text;
  document.getElementById('result-rank').textContent   = `Constituency: ${document.getElementById('constituency').value}  |  Exam: ${selectedExam.toUpperCase()}`;
  goTo('page-result');
}

// ── Leaderboard ─────────────────────────────────────────────────────────────
// Seed fake candidates so leaderboard isn't empty on first load
const seedData = [
  { name: 'Pappu Sharma',    party: 'Bakwaas Party',        constituency: 'Ullu Nagar',     exam: 'JEE',  score: 1,  marks: 4,  emoji: '🤡', date: '01/01/2025' },
  { name: 'Chamcha Singh',   party: 'Haan Ji Dal',          constituency: 'Sycophant Pur',  exam: 'NEET', score: 3,  marks: 11, emoji: '😬', date: '02/01/2025' },
  { name: 'Loot Prasad',     party: 'Swiss Bank Congress',  constituency: 'Scam Nagar',     exam: 'JEE',  score: 0,  marks: -2, emoji: '🤡', date: '03/01/2025' },
  { name: 'Jumla Devi',      party: 'Promise Party',        constituency: 'Jhooth Gaon',    exam: 'NEET', score: 5,  marks: 19, emoji: '😐', date: '04/01/2025' },
  { name: 'Neta Babu',       party: 'Kursi Bachao Dal',     constituency: 'Chair City',     exam: 'JEE',  score: 7,  marks: 27, emoji: '🤔', date: '05/01/2025' },
  { name: 'Tukde Tukde',     party: 'Divide & Rule FC',     constituency: 'Chaos Colony',   exam: 'NEET', score: 2,  marks: 7,  emoji: '🤡', date: '06/01/2025' },
  { name: 'Ghoos Kumar',     party: 'Under Table Alliance', constituency: 'Bribe Bazaar',   exam: 'JEE',  score: 9,  marks: 35, emoji: '🧠', date: '07/01/2025' },
  { name: 'Pending Lal',     party: 'Awaiting Results FC',  constituency: 'TBD Nagar',      exam: 'NEET', score: null, marks: null, emoji: '⏳', date: '08/01/2025' },
  { name: 'Abhi Abhi',       party: 'Just Joined Party',    constituency: 'New Entry Ward', exam: 'JEE',  score: null, marks: null, emoji: '⏳', date: '09/01/2025' },
];

function getStatus(r) {
  if (r.score === null) return { label: 'Pending', cls: 'status-pending', icon: '⏳' };
  if (r.score >= 5)     return { label: 'Pass',    cls: 'status-pass',    icon: '✅' };
  return                       { label: 'Fail',    cls: 'status-fail',    icon: '❌' };
}

function renderLeaderboard() {
  // Merge: real results take priority over seed data, no duplicate names
  const allData = [...leaderboard];
  seedData.forEach(seed => {
    const alreadyExists = allData.some(r => r.name === seed.name);
    if (!alreadyExists) allData.push(seed);
  });

  // Sort: completed first (by marks desc), then pending
  const sorted = [...allData].sort((a, b) => {
    if (a.marks === null && b.marks !== null) return 1;
    if (a.marks !== null && b.marks === null) return -1;
    return (b.marks ?? 0) - (a.marks ?? 0);
  });

  const pass    = sorted.filter(r => r.score !== null && r.score >= 5).length;
  const fail    = sorted.filter(r => r.score !== null && r.score < 5).length;
  const pending = sorted.filter(r => r.score === null).length;

  document.getElementById('lb-pass').textContent    = pass;
  document.getElementById('lb-fail').textContent    = fail;
  document.getElementById('lb-pending').textContent = pending;
  document.getElementById('lb-total').textContent   = sorted.length;

  const medals = ['🥇','🥈','🥉'];
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = sorted.map((r, i) => {
    const st = getStatus(r);
    return `
    <tr class="${i < 3 && r.score !== null ? 'top-row' : ''}">
      <td>${medals[i] && r.score !== null ? medals[i] : i + 1}</td>
      <td>${r.name}</td>
      <td style="color:#888;font-size:0.85rem">${r.party}</td>
      <td><span class="exam-label">${r.exam}</span></td>
      <td>${r.marks !== null ? `<strong style="color:#f97316">${r.marks}/40</strong>` : '<span style="color:#555">—</span>'}</td>
      <td><span class="status-badge ${st.cls}">${st.icon} ${st.label}</span></td>
    </tr>`;
  }).join('');
}

// ── News ────────────────────────────────────────────────────────────────────
const newsItems = [
  { tag: '🔴 BREAKING', title: 'Local MP Promises Free WiFi on Moon', body: 'Constituency of Chandranagar to get 5G coverage by 2025. Rocket procurement tender issued to lowest bidder.', time: '2 mins ago' },
  { tag: '📢 POLITICS', title: 'Minister Attends 3 Inaugurations of Same Road', body: 'The road, inaugurated in 2019, 2021, and 2024, remains under construction. Fourth inauguration planned for election season.', time: '15 mins ago' },
  { tag: '🎓 EDUCATION', title: 'Democrazy Exam Pass Rate: 0.003%', body: 'Of 10,000 aspiring politicians who took the JEE mock, only 3 passed. All 3 immediately disqualified for being "too smart".', time: '1 hour ago' },
  { tag: '💰 ECONOMY', title: 'Govt Launches ₹1 Lakh Crore Scheme to Study Why Previous Schemes Failed', body: 'A committee has been formed to form a committee. Report expected in 2047.', time: '3 hours ago' },
  { tag: '🗳️ ELECTIONS', title: 'Candidate Promises to Build Taj Mahal in Every Village', body: '"One Taj per village, two if you vote twice," said the candidate at a rally attended by 14 people and one confused goat.', time: '5 hours ago' },
  { tag: '🤡 SATIRE', title: 'New Bill Proposes Politicians Must Score 50% in Democrazy Exam', body: 'Opposition walks out. Treasury benches also walk out. Bill passes with zero members present.', time: '1 day ago' },
];

function renderNews() {
  document.getElementById('news-grid').innerHTML = newsItems.map(n => `
    <div class="news-card">
      <div class="news-tag">${n.tag}</div>
      <h3 class="news-title">${n.title}</h3>
      <p class="news-body">${n.body}</p>
      <span class="news-time">🕐 ${n.time}</span>
    </div>`).join('');
}

// ── Promise Generator ────────────────────────────────────────────────────────
const promiseTemplates = [
  (c) => `I solemnly promise the people of ${c} that every household will receive a free mango tree, a pet cow, and unlimited data — all by next Tuesday.`,
  (c) => `If elected from ${c}, I will personally ensure that potholes are renamed 'adventure zones' and declared a tourist attraction.`,
  (c) => `The youth of ${c} deserve better. That is why I promise to build 500 colleges, 200 hospitals, and one very large statue of myself.`,
  (c) => `I promise ${c} will have 24/7 electricity — except during load shedding, which I promise will only happen during sleeping hours.`,
  (c) => `Every family in ${c} will get ₹15 lakh. The money is currently in Switzerland. I am personally going to fetch it next week.`,
  (c) => `I promise to make ${c} the Silicon Valley of India. Step 1: Rename the main road 'Silicon Road'. Step 2: Done.`,
];

function generatePromise() {
  const input = document.getElementById('promise-input').value.trim() || 'your constituency';
  const text = promiseTemplates[Math.floor(Math.random() * promiseTemplates.length)](input);
  appendChat('promise-chat', '🧑 You', input);
  appendChat('promise-chat', '🤝 Bot', text);
  document.getElementById('promise-input').value = '';
}

// ── Speech Generator ─────────────────────────────────────────────────────────
const speechTemplates = [
  (t) => `Brothers and sisters! The issue of ${t} is not just an issue — it is THE issue. Our opponents have ignored ${t} for 70 years. We will solve ${t} in 70 days. Jai Hind!`,
  (t) => `My dear voters, when I think of ${t}, I think of you. And when I think of you, I think of votes. I mean, ${t}. Together, we will ${t} our way to victory!`,
  (t) => `The previous government did NOTHING about ${t}. We have done EVERYTHING about ${t}. What exactly? That is classified. But trust me, it was everything.`,
  (t) => `${t} is the backbone of this nation. Without ${t}, where would we be? Exactly. That is why I have formed a 14-member committee to study ${t} for the next 5 years.`,
  (t) => `I was born in a small village. We had no ${t}. Today, I stand before you, still with no ${t}, but with a lot of confidence. Vote for me!`,
];

function generateSpeech() {
  const input = document.getElementById('speech-input').value.trim() || 'development';
  const text = speechTemplates[Math.floor(Math.random() * speechTemplates.length)](input);
  appendChat('speech-chat', '🧑 You', input);
  appendChat('speech-chat', '🎤 Bot', text);
  document.getElementById('speech-input').value = '';
}

function appendChat(containerId, sender, text) {
  const box = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = `chat-msg ${sender.includes('You') ? 'chat-user' : 'chat-bot'}`;
  div.innerHTML = `<span class="chat-sender">${sender}</span><p>${text}</p>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
