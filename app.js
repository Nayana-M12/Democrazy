// ── Language ─────────────────────────────────────────────────────────────────
let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;
  const t = i18n[lang];

  // nav links
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  navLinks[0].textContent = t.home;
  navLinks[1].textContent = t.exams;
  navLinks[2].textContent = t.chatbot;
  navLinks[3].textContent = t.leaderboard;
  navLinks[4].textContent = t.profile;

  // tab titles & subs
  document.querySelector('#tab-home .tab-title').innerHTML    = t.newsTitle + ' <span class="live-badge">LIVE</span>';
  document.querySelector('#tab-home .tab-sub').textContent    = t.newsSub;
  document.querySelector('#tab-exams .tab-title').textContent = t.examsTitle;
  document.querySelector('#tab-exams .tab-sub').textContent   = t.examsSub;
  document.querySelector('#tab-chatbot .tab-title').textContent = t.chatbotTitle;
  document.querySelector('#tab-chatbot .tab-sub').textContent   = t.chatbotSub;
  document.querySelector('#tab-leaderboard .tab-title').textContent = t.lbTitle;
  document.querySelector('#tab-leaderboard .tab-sub').textContent   = t.lbSub;

  // exam cards
  const examCards = document.querySelectorAll('.exam-card');
  examCards[0].querySelector('h3').textContent = t.netTitle;
  examCards[0].querySelector('p').innerHTML = `${t.netDesc}<br/><span class="tag">${t.netTag}</span>`;
  examCards[1].querySelector('h3').textContent = t.ddtTitle;
  examCards[1].querySelector('p').innerHTML = `${t.ddtDesc}<br/><span class="tag">${t.ddtTag}</span>`;
  document.querySelector('.disclaimer').textContent = t.disclaimer;

  // chatbot cards
  document.querySelector('#promise-chat').closest('.chatbot-card').querySelector('h3').textContent = t.promiseTitle;
  document.querySelector('#promise-chat').closest('.chatbot-card').querySelector('p').textContent  = t.promiseSub;
  document.getElementById('promise-input').placeholder = t.promisePlaceholder;
  document.querySelector('[onclick="generatePromise()"]').textContent = t.promiseBtn;
  document.querySelector('#speech-chat').closest('.chatbot-card').querySelector('h3').textContent = t.speechTitle;
  document.querySelector('#speech-chat').closest('.chatbot-card').querySelector('p').textContent  = t.speechSub;
  document.getElementById('speech-input').placeholder = t.speechPlaceholder;
  document.querySelector('[onclick="generateSpeech()"]').textContent = t.speechBtn;

  // profile menu
  document.querySelector('.pm-item:not(.pm-logout)').textContent = t.editProfile;
  document.querySelector('.pm-logout').textContent = t.logout;

  // leaderboard stats
  const lbLabels = document.querySelectorAll('.lb-stat-label');
  if (lbLabels[0]) lbLabels[0].textContent = t.totalCandidates;
  if (lbLabels[1]) lbLabels[1].textContent = t.passed;
  if (lbLabels[2]) lbLabels[2].textContent = t.failed;
  if (lbLabels[3]) lbLabels[3].textContent = t.pending;

  // leaderboard table headers
  const ths = document.querySelectorAll('.leaderboard-table th');
  if (ths.length >= 6) {
    ths[0].textContent = t.rank;
    ths[1].textContent = t.candidate;
    ths[2].textContent = t.party;
    ths[3].textContent = t.examCol;
    ths[4].textContent = t.marks;
    ths[5].textContent = t.status;
  }

  // exam page buttons
  const submitBtn = document.querySelector('[onclick="submitExam()"]');
  if (submitBtn) submitBtn.textContent = t.submitExam;
  const cancelBtn = document.querySelector('[onclick="cancelExam()"]');
  if (cancelBtn) cancelBtn.textContent = t.cancelExam;
  const prevBtn = document.getElementById('prev-btn');
  if (prevBtn) prevBtn.textContent = t.prevBtn;
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) nextBtn.textContent = t.nextBtn;

  // cancel modal
  const cancelTitle = document.querySelector('#cancel-modal .modal-header h3');
  if (cancelTitle) cancelTitle.textContent = t.cancelTitle;
  const cancelMsg = document.querySelector('#cancel-modal .modal-sub');
  if (cancelMsg) cancelMsg.textContent = t.cancelMsg;
  const yesCancelBtn = document.querySelector('[onclick="confirmCancelExam()"]');
  if (yesCancelBtn) yesCancelBtn.textContent = t.yesCancel;
  const keepGoingBtn = document.querySelector('[onclick="dismissCancelExam()"]');
  if (keepGoingBtn) keepGoingBtn.textContent = t.keepGoing;

  // result page
  const backBtn = document.querySelector('[onclick="goToDashboard()"]');
  if (backBtn) backBtn.textContent = t.backDashboard;

  // re-render news in new language
  renderNews();

  // re-render leaderboard if visible
  if (document.getElementById('tab-leaderboard').classList.contains('active')) renderLeaderboard();

  // active lang button
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`).classList.add('active');
}

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

function showTab(tabId, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (el) el.classList.add('active');
  if (tabId === 'tab-leaderboard') renderLeaderboard();
}

// ── Auth ────────────────────────────────────────────────────────────────────
function calculateAge(dob) {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value.trim();
  const dob      = document.getElementById('login-dob').value;

  if (!dob) {
    document.getElementById('login-error').textContent = "❌ Please enter your date of birth.";
    return;
  }
  if (calculateAge(dob) < 18) {
    document.getElementById('login-error').textContent = "❌ You must be 18 or older to enter. Come back when you're old enough to be disappointed by politics.";
    return;
  }

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
  const dob      = document.getElementById('new-dob').value;

  if (!dob) {
    document.getElementById('reg-error').textContent = '❌ Please enter your date of birth.';
    return;
  }
  if (calculateAge(dob) < 18) {
    document.getElementById('reg-error').textContent = '❌ You must be 18 or older to register. Politics will still be a mess when you grow up.';
    return;
  }

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
  document.querySelector(`.nav-link[onclick*="${tabId}"]`)?.classList.add('active');
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
  const display = u.avatar || u.name.charAt(0).toUpperCase();
  document.getElementById('nav-username').textContent   = u.name;
  document.getElementById('profile-avatar').textContent = display;
  document.getElementById('profile-avatar-lg').textContent = display;
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

function selectAvatar(btn, emoji) {
  document.querySelectorAll('.avatar-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  loggedInUser.avatar = emoji;
}

function toggleChangePassword() {
  const section = document.getElementById('change-pass-section');
  const btn = document.getElementById('change-pass-btn');
  const isOpen = section.style.display !== 'none';
  section.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? '🔒 Change Password' : '🔓 Cancel';
  if (isOpen) {
    document.getElementById('current-password').value = '';
    document.getElementById('edit-password').value = '';
  }
}

function togglePassword(id, btn) {
  const input = document.getElementById(id);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

function openEditProfile() {
  document.getElementById('profile-menu').classList.remove('open');
  document.getElementById('edit-name').value         = loggedInUser.name;
  document.getElementById('edit-dob').value          = loggedInUser.dob || '';
  document.getElementById('edit-party').value        = loggedInUser.party;
  document.getElementById('edit-constituency').value = loggedInUser.constituency;
  document.getElementById('edit-password').value     = '';
  document.getElementById('edit-error').textContent  = '';

  // highlight current avatar
  document.querySelectorAll('.avatar-opt').forEach(b => {
    b.classList.toggle('selected', b.textContent.trim() === loggedInUser.avatar);
  });

  document.getElementById('profile-modal-overlay').classList.add('open');
  document.getElementById('profile-modal').classList.add('open');
}

function closeEditProfile() {
  document.getElementById('profile-modal-overlay').classList.remove('open');
  document.getElementById('profile-modal').classList.remove('open');
  document.getElementById('change-pass-section').style.display = 'none';
  document.getElementById('change-pass-btn').textContent = '🔒 Change Password';
}

function saveProfile(e) {
  e.preventDefault();
  const name         = document.getElementById('edit-name').value.trim();
  const dob          = document.getElementById('edit-dob').value;
  const party        = document.getElementById('edit-party').value.trim();
  const constituency = document.getElementById('edit-constituency').value.trim();
  const currentPass  = document.getElementById('current-password').value;
  const newPass      = document.getElementById('edit-password').value;
  const isChangingPass = document.getElementById('change-pass-section').style.display !== 'none';

  if (!name || !party || !constituency) {
    document.getElementById('edit-error').textContent = '❌ All fields except password are required.';
    return;
  }

  if (dob && calculateAge(dob) < 18) {
    document.getElementById('edit-error').textContent = '❌ Date of birth shows you are under 18. Nice try.';
    return;
  }

  if (isChangingPass) {
    if (!currentPass) {
      document.getElementById('edit-error').textContent = '❌ Please enter your current password.';
      return;
    }
    if (currentPass !== loggedInUser.password) {
      document.getElementById('edit-error').textContent = '❌ Current password is incorrect.';
      return;
    }
    if (!newPass) {
      document.getElementById('edit-error').textContent = '❌ Please enter a new password.';
      return;
    }
    loggedInUser.password = newPass;
  }

  loggedInUser.name         = name;
  loggedInUser.dob          = dob;
  loggedInUser.party        = party;
  loggedInUser.constituency = constituency;

  localStorage.setItem('democrazy_users', JSON.stringify(users));
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

  document.getElementById('exam-title-label').textContent = exam === 'jee' ? 'NET' : 'DDT';
  document.getElementById('candidate-label').textContent  = `Candidate: ${candidateName}`;
  goTo('page-exam');
  renderQuestion();
  startTimer();
}

function getQuestions() {
  if (currentLang === 'hi') return examQuestionsHi[selectedExam];
  if (currentLang === 'kn') return examQuestionsKn[selectedExam];
  return examQuestions[selectedExam];
}

function renderQuestion() {
  const questions = getQuestions();
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

function cancelExam() {
  document.getElementById('cancel-modal').classList.add('open');
  document.getElementById('cancel-modal-overlay').classList.add('open');
}

function confirmCancelExam() {
  document.getElementById('cancel-modal').classList.remove('open');
  document.getElementById('cancel-modal-overlay').classList.remove('open');
  clearInterval(timerInterval);
  goTo('page-home');
  showTabById('tab-exams');
}

function dismissCancelExam() {
  document.getElementById('cancel-modal').classList.remove('open');
  document.getElementById('cancel-modal-overlay').classList.remove('open');
}

async function submitExam() {
  clearInterval(timerInterval);
  const questions = getQuestions();
  const score = answers.reduce((acc, ans, i) => acc + (ans === questions[i].answer ? 1 : 0), 0);
  const wrong = answers.filter((a, i) => a !== null && a !== questions[i].answer).length;
  const marks = score * 4 - wrong;
  const verdictTexts = i18n[currentLang].verdicts;
  const verdictEmojis = ['🤡','😬','😐','🤔','🧠'];
  const verdictIdx = score <= 2 ? 0 : score <= 4 ? 1 : score <= 6 ? 2 : score <= 8 ? 3 : 4;
  const verdictText = verdictTexts[verdictIdx];
  const verdictEmoji = verdictEmojis[verdictIdx];

  const existingIdx = leaderboard.findIndex(r => r.name === document.getElementById('candidate-name').value && r.exam === selectedExam.toUpperCase());
  const entry = {
    name:         document.getElementById('candidate-name').value,
    party:        document.getElementById('party-name').value,
    constituency: document.getElementById('constituency').value,
    exam:         selectedExam === 'jee' ? 'NET' : 'DDT',
    score, marks,
    emoji:        verdictEmoji,
    date:         new Date().toLocaleDateString('en-IN'),
  };
  if (existingIdx >= 0) {
    leaderboard[existingIdx] = entry;
  } else {
    leaderboard.push(entry);
  }
  leaderboard.sort((a, b) => b.marks - a.marks);
  localStorage.setItem('democrazy_lb', JSON.stringify(leaderboard));

  try {
    await fetch(`${API}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: entry.name, score: marks }),
    });
  } catch (_) {}

  document.getElementById('result-emoji').textContent  = verdictEmoji;
  document.getElementById('result-name').textContent   = `${document.getElementById('candidate-name').value} — ${document.getElementById('party-name').value}`;
  document.getElementById('result-score').textContent  = `${score} / 10 correct  •  ${marks} / 40 marks`;
  document.getElementById('result-verdict').textContent = verdictText;
  document.getElementById('result-rank').textContent   = `Constituency: ${document.getElementById('constituency').value}  |  Exam: ${selectedExam === 'jee' ? 'NET' : 'DDT'}`;
  goTo('page-result');
}

// ── Leaderboard ─────────────────────────────────────────────────────────────
// Seed fake candidates so leaderboard isn't empty on first load
const seedData = [
  { name: 'Pappu Sharma',    party: 'Bakwaas Party',        constituency: 'Ullu Nagar',     exam: 'NET',  score: 1,  marks: 4,  emoji: '🤡', date: '01/01/2025' },
  { name: 'Chamcha Singh',   party: 'Haan Ji Dal',          constituency: 'Sycophant Pur',  exam: 'DDT',  score: 3,  marks: 11, emoji: '😬', date: '02/01/2025' },
  { name: 'Loot Prasad',     party: 'Swiss Bank Congress',  constituency: 'Scam Nagar',     exam: 'NET',  score: 0,  marks: -2, emoji: '🤡', date: '03/01/2025' },
  { name: 'Jumla Devi',      party: 'Promise Party',        constituency: 'Jhooth Gaon',    exam: 'DDT',  score: 5,  marks: 19, emoji: '😐', date: '04/01/2025' },
  { name: 'Neta Babu',       party: 'Kursi Bachao Dal',     constituency: 'Chair City',     exam: 'NET',  score: 7,  marks: 27, emoji: '🤔', date: '05/01/2025' },
  { name: 'Tukde Tukde',     party: 'Divide & Rule FC',     constituency: 'Chaos Colony',   exam: 'DDT',  score: 2,  marks: 7,  emoji: '🤡', date: '06/01/2025' },
  { name: 'Ghoos Kumar',     party: 'Under Table Alliance', constituency: 'Bribe Bazaar',   exam: 'NET',  score: 9,  marks: 35, emoji: '🧠', date: '07/01/2025' },
  { name: 'Pending Lal',     party: 'Awaiting Results FC',  constituency: 'TBD Nagar',      exam: 'DDT',  score: null, marks: null, emoji: '⏳', date: '08/01/2025' },
  { name: 'Abhi Abhi',       party: 'Just Joined Party',    constituency: 'New Entry Ward', exam: 'NET',  score: null, marks: null, emoji: '⏳', date: '09/01/2025' },
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
const newsIllustrations = {
  development: `<svg viewBox="0 0 120 80" class="news-svg">
    <rect x="10" y="50" width="100" height="20" rx="2" fill="#1a1a2e" stroke="#2a2a4a" stroke-width="1.5"/>
    <rect x="20" y="35" width="20" height="35" rx="2" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <rect x="50" y="25" width="20" height="45" rx="2" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <rect x="80" y="40" width="20" height="30" rx="2" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <text x="60" y="18" text-anchor="middle" font-size="10" fill="#a855f7">2044 →</text>
    <path d="M20 48 L30 35 L50 38 L60 25 L80 30 L90 40" stroke="#a855f7" stroke-width="2" fill="none" stroke-dasharray="4 3" class="svg-dash"/>
  </svg>`,

  pressconf: `<svg viewBox="0 0 120 80" class="news-svg">
    <rect x="30" y="20" width="60" height="35" rx="4" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <circle cx="60" cy="37" r="8" fill="none" stroke="#a855f7" stroke-width="2"/>
    <text x="60" y="41" text-anchor="middle" font-size="10" fill="#a855f7">?</text>
    <text x="60" y="68" text-anchor="middle" font-size="8" fill="#555">PRESS CONF</text>
    <path d="M45 20 L40 10" stroke="#a855f7" stroke-width="1.5" opacity="0.5"/>
    <path d="M60 20 L60 8" stroke="#a855f7" stroke-width="1.5" class="svg-wave1"/>
    <path d="M75 20 L80 10" stroke="#a855f7" stroke-width="1.5" opacity="0.5"/>
  </svg>`,

  cow: `<svg viewBox="0 0 120 80" class="news-svg">
    <text x="35" y="52" font-size="32">🐄</text>
    <path d="M72 30 Q80 22 88 28" fill="none" stroke="#a855f7" stroke-width="2" class="svg-wave1"/>
    <path d="M76 24 Q84 16 92 22" fill="none" stroke="#a855f7" stroke-width="2" class="svg-wave2"/>
    <path d="M80 18 Q88 10 96 16" fill="none" stroke="#a855f7" stroke-width="2" class="svg-wave3"/>
    <circle cx="96" cy="14" r="5" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <text x="96" y="18" text-anchor="middle" font-size="7" fill="#a855f7">📶</text>
  </svg>`,

  committee: `<svg viewBox="0 0 120 80" class="news-svg">
    <circle cx="30" cy="35" r="10" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <text x="30" y="39" text-anchor="middle" font-size="10">👤</text>
    <circle cx="60" cy="35" r="10" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <text x="60" y="39" text-anchor="middle" font-size="10">👤</text>
    <circle cx="90" cy="35" r="10" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <text x="90" y="39" text-anchor="middle" font-size="10">👤</text>
    <path d="M40 35 L50 35" stroke="#a855f7" stroke-width="1.5"/>
    <path d="M70 35 L80 35" stroke="#a855f7" stroke-width="1.5"/>
    <text x="60" y="62" text-anchor="middle" font-size="8" fill="#555">COMMITTEE → COMMITTEE</text>
    <path d="M60 45 L60 55" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="3 2"/>
  </svg>`,

  speech: `<svg viewBox="0 0 120 80" class="news-svg">
    <text x="25" y="52" font-size="30">🎤</text>
    <rect x="60" y="15" width="50" height="30" rx="6" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <rect x="68" y="22" width="34" height="3" rx="2" fill="#2a2a4a"/>
    <rect x="68" y="29" width="28" height="3" rx="2" fill="#2a2a4a"/>
    <rect x="68" y="36" width="20" height="3" rx="2" fill="#2a2a4a"/>
    <path d="M85 45 L85 52" stroke="#a855f7" stroke-width="1.5"/>
    <text x="85" y="62" text-anchor="middle" font-size="8" fill="#555">TOPIC: ???</text>
  </svg>`,

  road: `<svg viewBox="0 0 120 80" class="news-svg">
    <rect x="0" y="50" width="120" height="30" fill="#2a2a2a"/>
    <rect x="50" y="55" width="20" height="6" rx="2" fill="#a855f7" class="svg-blink"/>
    <rect x="0" y="45" width="120" height="8" fill="#555"/>
    <rect x="10" y="20" width="30" height="25" rx="3" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <text x="25" y="36" text-anchor="middle" font-size="14">🎪</text>
    <rect x="80" y="20" width="30" height="25" rx="3" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <text x="95" y="36" text-anchor="middle" font-size="14">🎪</text>
    <text x="60" y="15" text-anchor="middle" font-size="8" fill="#a855f7">3rd TIME</text>
  </svg>`,

  train: `<svg viewBox="0 0 120 80" class="news-svg">
    <rect x="10" y="35" width="80" height="25" rx="6" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <rect x="15" y="40" width="15" height="12" rx="2" fill="#0a0a18" stroke="#a855f744" stroke-width="1"/>
    <rect x="35" y="40" width="15" height="12" rx="2" fill="#0a0a18" stroke="#a855f744" stroke-width="1"/>
    <circle cx="25" cy="62" r="5" fill="#2a2a4a" stroke="#a855f7" stroke-width="1.5"/>
    <circle cx="65" cy="62" r="5" fill="#2a2a4a" stroke="#a855f7" stroke-width="1.5"/>
    <text x="90" y="48" font-size="18" class="svg-float">🏘️</text>
    <text x="60" y="25" text-anchor="middle" font-size="8" fill="#a855f7">₹80,000 CR</text>
    <path d="M0 60 L120 60" stroke="#555" stroke-width="2"/>
  </svg>`,

  historic: `<svg viewBox="0 0 120 80" class="news-svg">
    <rect x="25" y="15" width="70" height="50" rx="4" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <text x="60" y="38" text-anchor="middle" font-size="22">📜</text>
    <text x="60" y="52" text-anchor="middle" font-size="8" fill="#a855f7">HISTORIC</text>
    <circle cx="95" cy="20" r="10" fill="#ff4d4d22" stroke="#ff4d4d" stroke-width="1.5" class="svg-pulse"/>
    <text x="95" y="24" text-anchor="middle" font-size="10" fill="#ff7070">?</text>
  </svg>`,

  blame: `<svg viewBox="0 0 120 80" class="news-svg">
    <text x="15" y="45" font-size="22">😤</text>
    <text x="80" y="45" font-size="22">😤</text>
    <path d="M42 35 L55 35" stroke="#ff7070" stroke-width="2" marker-end="url(#arr)"/>
    <path d="M65 42 L52 42" stroke="#ff7070" stroke-width="2"/>
    <text x="60" y="38" text-anchor="middle" font-size="8" fill="#ff7070">←BLAME→</text>
    <text x="60" y="65" text-anchor="middle" font-size="7" fill="#555">since 1947</text>
  </svg>`,

  biryani: `<svg viewBox="0 0 120 80" class="news-svg">
    <text x="38" y="52" font-size="36">🍛</text>
    <text x="78" y="30" font-size="18" class="svg-float">🗳️</text>
    <path d="M72 38 Q80 30 88 38" fill="none" stroke="#a855f7" stroke-width="2" class="svg-wave1"/>
    <text x="60" y="72" text-anchor="middle" font-size="8" fill="#555">AFTER ELECTIONS</text>
  </svg>`,

  slogan: `<svg viewBox="0 0 120 80" class="news-svg">
    <rect x="10" y="20" width="100" height="35" rx="6" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <text x="60" y="42" text-anchor="middle" font-size="7" fill="#a855f7">JAI VIKAS PRAGATI</text>
    <text x="60" y="52" text-anchor="middle" font-size="7" fill="#a855f7">BHARAT UNNATI 🤷</text>
    <circle cx="95" cy="18" r="8" fill="#ff4d4d22" stroke="#ff4d4d" stroke-width="1.5"/>
    <text x="95" y="22" text-anchor="middle" font-size="10" fill="#ff7070">?</text>
  </svg>`,

  pressconf2: `<svg viewBox="0 0 120 80" class="news-svg">
    <rect x="10" y="15" width="45" height="30" rx="4" fill="#1a1a2e" stroke="#a855f7" stroke-width="1.5"/>
    <text x="32" y="34" text-anchor="middle" font-size="9" fill="#a855f7">CONF 1</text>
    <rect x="65" y="30" width="45" height="30" rx="4" fill="#1a1a2e" stroke="#c084fc" stroke-width="1.5"/>
    <text x="87" y="49" text-anchor="middle" font-size="9" fill="#c084fc">CONF 2</text>
    <path d="M55 30 L65 40" stroke="#a855f7" stroke-width="2" stroke-dasharray="3 2" class="svg-dash"/>
    <text x="60" y="72" text-anchor="middle" font-size="8" fill="#555">→ ANNOUNCING →</text>
  </svg>`,
};

const newsItems = [
  { tag: '🔴 BREAKING', title: 'Politician Promises Development, Details in 20 Years', body: 'A senior leader assured voters that full details of the development plan will be revealed sometime before 2044. "Trust the process," he said, boarding a private jet.', time: '2 mins ago', img: 'development' },
  { tag: '📢 POLITICS', title: 'Leader Answers Every Question Except the One Asked', body: 'In a 45-minute press conference, the minister responded to 12 questions — none of which were actually asked. Journalists are still waiting.', time: '10 mins ago', img: 'pressconf' },
  { tag: '🐄 BREAKING', title: 'Candidate Promises Free WiFi for Cows and Buffaloes', body: '"Our cattle deserve connectivity," said the candidate. A ₹4,200 crore scheme has been announced. Cows remain unimpressed and offline.', time: '18 mins ago', img: 'cow' },
  { tag: '📋 GOVERNANCE', title: 'Committee Formed to Decide If Another Committee Is Needed', body: 'The 14-member panel will meet quarterly to evaluate whether a second committee should be constituted. First report expected in 2031.', time: '35 mins ago', img: 'committee' },
  { tag: '🎤 POLITICS', title: '40-Minute Speech Delivered, Topic Still Unidentified', body: 'Experts, journalists, and the speaker himself were unable to determine the subject of yesterday\'s address. "It was historic," said an aide.', time: '1 hour ago', img: 'speech' },
  { tag: '🛣️ BREAKING', title: 'Same Road Inaugurated for the Third Time This Year', body: 'The 2.4 km stretch in Jumla Nagar was inaugurated in January, April, and now August. Construction is expected to begin by 2027.', time: '2 hours ago', img: 'road' },
  { tag: '🚄 DEVELOPMENT', title: 'Bullet Train Promised Between Two Villages With Five People', body: 'The ₹80,000 crore high-speed rail project connecting Ullu Nagar (pop. 3) and Bakwaas Pur (pop. 2) was announced to thunderous applause.', time: '3 hours ago', img: 'train' },
  { tag: '📣 POLITICS', title: '"Historic Decision" Announced, Explanation Still Missing', body: 'The government called it "the most transformative policy of the century." What it actually does remains unclear. A clarification is expected never.', time: '4 hours ago', img: 'historic' },
  { tag: '⚔️ BLAME GAME', title: 'Opposition Blames Govt; Govt Blames Previous Govt', body: 'In a seamless relay of responsibility, the current government blamed its predecessor, who blamed the one before that. The chain goes back to 1947.', time: '5 hours ago', img: 'blame' },
  { tag: '🍛 ELECTIONS', title: 'Free Biryani Promised Every Sunday After Elections', body: '"Every Sunday, biryani for all," declared the candidate. Nutritionists, economists, and biryani chefs have all raised concerns. Voters have not.', time: '6 hours ago', img: 'biryani' },
  { tag: '🗣️ POLITICS', title: 'New Political Slogan Announced, Meaning Still Unclear', body: '"Jai Vikas Pragati Bharat Unnati Zindabad!" The party president unveiled the new slogan. A 7-member committee has been formed to explain it.', time: '8 hours ago', img: 'slogan' },
  { tag: '📸 MEDIA', title: 'Press Conference Held to Announce Another Press Conference', body: 'Journalists gathered at 11 AM to be informed that a more important press conference will be held at 3 PM to announce a future press conference.', time: '1 day ago', img: 'pressconf2' },
];

function renderNews() {
  const news = i18n[currentLang].news;
  const imgs = ['development','pressconf','cow','committee','speech','road','train','historic','blame','biryani','slogan','pressconf2'];
  document.getElementById('news-grid').innerHTML = news.map((n, idx) => `
    <div class="news-card">
      <div class="news-illustration">${newsIllustrations[imgs[idx]]}</div>
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

function generatePromise() {
  const input = document.getElementById('promise-input').value.trim();
  if (!input) {
    document.getElementById('promise-input').style.borderColor = '#a855f7';
    document.getElementById('promise-input').placeholder = 'Please enter your constituency first!';
    return;
  }
  document.getElementById('promise-input').style.borderColor = '';
  const text = promiseTemplates[Math.floor(Math.random() * promiseTemplates.length)](input);
  appendChat('promise-chat', '🧑 You', input);
  appendChat('promise-chat', '🤝 Bot', text);
  document.getElementById('promise-input').value = '';
}

// ── Speech Generator ─────────────────────────────────────────────────────────
const speechTemplates = [
  (t) => `Brothers and sisters! The issue of ${t} is not just an issue — it is THE issue of our generation, our children's generation, and frankly our grandchildren's generation too, because we definitely won't solve it before then. For 70 years, the previous government ignored ${t}. We have been ignoring it more efficiently. But today, I stand before you to announce that a 14-member committee has been formed to look into ${t}. They will submit a report. The report will be reviewed. The review will be reviewed. And then, my friends, we will have a press conference. Jai Hind!`,
  (t) => `My dear voters, when I think of ${t}, I think of you. And when I think of you, I think of your votes. I mean — your future. ${t} is the backbone of this nation. Without ${t}, where would we be? Exactly. Nobody knows. That is why I have personally written a letter to ${t} asking it to improve. The letter is being translated into 22 languages. Action will follow. Probably. Thank you, sit down, clap now.`,
  (t) => `People of this great nation! ${t} has been a problem since independence. Actually, since before independence. Possibly since the dinosaurs. The point is — it is old. And old problems need fresh solutions. That is why we are forming a new committee, with new members, in a new building, with new furniture, to study this very old problem of ${t}. The committee will meet every third Tuesday, unless it is raining, or a holiday, or someone has a wedding. Results expected by 2047. God bless you all.`,
  (t) => `My fellow citizens! Today I want to talk about ${t}. Actually, I was going to talk about something else, but my advisor said ${t} is trending, so here we are. Now, ${t} is a complex issue. Very complex. So complex that even I don't understand it, and I have a degree from a university that definitely exists. But complexity has never stopped this government. We have been confidently wrong about many things, and ${t} will be no different. A scheme worth ₹50,000 crore has been announced. Where is the money? It is in the pipeline. The pipeline is under construction. The construction is under review. Vote for us!`,
  (t) => `Brothers, sisters, and undecided voters! The opposition says we have done nothing about ${t}. That is completely false. We have done many things. We held a rally about ${t}. We printed pamphlets about ${t}. We changed our WhatsApp status to ${t}. And just last week, I personally googled ${t} for 45 minutes. If that is not dedication, I don't know what is. The results of my research will be shared with the public once we figure out what they mean. Until then, trust the process. The process is also under review.`,
  (t) => `Honourable guests, media persons, and people who came for the free lunch! ${t} is the single most important issue facing our nation today. Yesterday it was something else, and tomorrow it will be something else again, but today — today it is ${t}. I have personally visited 14 districts to study ${t}. In each district, I gave a speech about ${t}, took a photo with a farmer, and left. The farmer is still waiting. But the photo was excellent. It got 4,000 likes. That is democracy in action, my friends.`,
  (t) => `Respected citizens! ${t} has been ignored for too long. I was also ignoring it, but then my PR team said it was trending, so now I care deeply. From the bottom of my heart, which was recently scanned and found to be in excellent condition, I promise to address ${t}. Not immediately. Not soon. But eventually. And when that day comes, I will be there, cutting a ribbon, taking a photo, and giving a speech very similar to this one. Thank you, vote for me, Jai Hind!`,
  (t) => `My dear citizens! Our nation's sports policy is very clear — we win medals, I take selfies with the winners. We lose, I was never involved. Under my government, sports will get the attention it deserves. We have allocated ₹10,000 crore for a world-class stadium. The stadium will be built right after the inauguration of the stadium announced in 2018, which is scheduled to begin after the 2019 stadium is completed, which is pending the 2016 stadium's foundation stone ceremony. Our athletes train very hard — despite no equipment, no coaches, no funding, and no food. That is the true Olympic spirit. If they win, it is because of our government. If they lose, it is because of the previous government. Either way, I will be at the airport with a garland. Vote for me!`,
  (t) => `Brothers and sisters! Corruption is a very serious problem and I take it very seriously. In fact, I have personally experienced corruption from both sides, which gives me a unique 360-degree perspective. Under my government, corruption will be eliminated. We have already eliminated the people who were reporting it. The journalists, the whistleblowers, the RTI activists — all transferred to very remote locations for their own safety. The corruption itself is still there but it is now much quieter and better organised. We call it "efficiency." A committee has been formed to rename it something even more positive. Suggestions welcome. Cash only.`,
  (t) => `People of this great nation! The roads of our constituency are world class. Yes, they have potholes. But these are not ordinary potholes — these are heritage potholes. Some of them are older than our democracy. They have character. They have history. Tourists come from neighbouring villages just to see them. Under my government, these potholes will be preserved, protected, and given Aadhaar cards. For the rest of the roads, we have a 10-point plan. Points 1 through 9 involve forming committees. Point 10 is the inauguration ceremony, which we have already booked for next March. The road construction will follow the inauguration, once we figure out where the ₹500 crore went. It is in the pipeline. The pipeline has a pothole.`,
];

function generateSpeech() {
  const input = document.getElementById('speech-input').value.trim();
  if (!input) {
    document.getElementById('speech-input').style.borderColor = '#a855f7';
    document.getElementById('speech-input').placeholder = 'Please enter a topic first!';
    return;
  }
  document.getElementById('speech-input').style.borderColor = '';
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
