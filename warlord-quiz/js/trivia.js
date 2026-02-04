// Destiny Universe Trivia (60Q pool) + Category Selector + Hint Penalty + Difficulty Ramp

const RUN = { totalQuestions: 10, secondsPerQuestion: 20 };

// Hint penalty settings
const HINT = {
  costPoints: 35,          // flat penalty when used
  lockPerQuestion: true    // one hint per question
};

// Difficulty ramp thresholds by streak
// 0–2 => easy, 3–5 => medium, 6+ => hard
function rampLevel(streak){
  if (streak >= 6) return "hard";
  if (streak >= 3) return "medium";
  return "easy";
}

// Weighted pick: favors current ramp, but can spill a bit into adjacent to avoid repeats
function allowedDifficultiesForRamp(ramp){
  if (ramp === "easy") return ["easy", "medium"];       // gentle ramp
  if (ramp === "medium") return ["medium", "easy", "hard"];
  return ["hard", "medium"];                             // keep pressure on
}

// ---- Question Bank (same as your 60Q version) ----
// Keep category values consistent with the dropdown:
// "All" is not used here; it’s a filter choice.
// Categories used: Light, Vex, Hive/Taken, Cabal, Eliksni, Destinations, Gameplay
const QUESTION_BANK = [
  // Light / Guardians / City
  { prompt:"What is the Traveler best known as in Destiny’s world?", choices:["A paracausal sphere tied to the Light","A Vex supercomputer core","A Cabal flagship engine","A Hive throne-world seed"], answerIndex:0, explanation:"The Traveler is a mysterious spherical entity associated with the Light.", difficulty:"easy", category:"Light" },
  { prompt:"Ghosts were created primarily to do what?", choices:["Resurrect Guardians and support them","Command the Cabal legions","Teach the Hive their rites","Maintain the Vex Network"], answerIndex:0, explanation:"Ghosts seek out and resurrect individuals to become Guardians, then assist them.", difficulty:"easy", category:"Light" },
  { prompt:"Which trio is the classic Guardian class lineup?", choices:["Titan, Hunter, Warlock","Knight, Rogue, Mage","Paladin, Ranger, Sorcerer","Soldier, Spy, Engineer"], answerIndex:0, explanation:"Destiny’s core classes are Titan, Hunter, and Warlock.", difficulty:"easy", category:"Light" },
  { prompt:"What does EDZ stand for?", choices:["European Dead Zone","Eastern Defense Zone","Exo Deployment Zero","Europa Dark Zenith"], answerIndex:0, explanation:"EDZ is short for European Dead Zone.", difficulty:"easy", category:"Destinations" },
  { prompt:"The Vex are best described as…", choices:["A cyber-organic species converting worlds into machines","A Cabal splinter legion","A Hive royal family","A Fallen merchant guild"], answerIndex:0, explanation:"The Vex relentlessly transform environments into machine infrastructure.", difficulty:"easy", category:"Vex" },
  { prompt:"Oryx is best known by which title?", choices:["The Taken King","The Machine Mind","The Kell of Kells","The Red Dominus"], answerIndex:0, explanation:"Oryx is widely known as the Taken King.", difficulty:"easy", category:"Hive/Taken" },
  { prompt:"Savathûn is best known as…", choices:["The Witch Queen","The Warmind","The Speaker","The Iron Lord"], answerIndex:0, explanation:"Savathûn is called the Witch Queen.", difficulty:"easy", category:"Hive/Taken" },
  { prompt:"Xivu Arath is most commonly titled…", choices:["God of War","God of the Forge","Queen of Wolves","Empress of Dawn"], answerIndex:0, explanation:"Xivu Arath is known as the Hive God of War.", difficulty:"easy", category:"Hive/Taken" },
  { prompt:"The Red Legion was led by which figure during the Red War era?", choices:["Dominus Ghaul","Emperor Calus","Uldren Sov","Eramis"], answerIndex:0, explanation:"The Red Legion was led by Dominus Ghaul.", difficulty:"easy", category:"Cabal" },
  { prompt:"The Fallen are also known by what name?", choices:["Eliksni","Ahamkara","Awoken","Psions"], answerIndex:0, explanation:"Fallen is the City’s term; Eliksni is their name for themselves.", difficulty:"easy", category:"Eliksni" },
  { prompt:"Fallen society traditionally organizes itself into…", choices:["Houses","Legions","Broods","Orders"], answerIndex:0, explanation:"Eliksni historically formed Houses led by Kells.", difficulty:"easy", category:"Eliksni" },
  { prompt:"The Crucible is…", choices:["PvP combat overseen by Shaxx","A Vex simulation arena on Mercury","A Fallen ether refinery","A Hive ascendant ritual"], answerIndex:0, explanation:"The Crucible is Destiny’s PvP arena, hosted by Shaxx.", difficulty:"easy", category:"Gameplay" },
  { prompt:"A 'Strike' is best described as…", choices:["A 3-player mission against a key enemy target","A 12-player raid on a capital ship","A PvP tournament bracket","A crafting-only activity"], answerIndex:0, explanation:"Strikes are typically 3-player PvE missions targeting major threats.", difficulty:"easy", category:"Gameplay" },
  { prompt:"Nessus is notable for being heavily influenced by…", choices:["Vex presence and conversion","Hive tithes","Cabal throne rituals","Fallen ether storms"], answerIndex:0, explanation:"Nessus is strongly associated with Vex activity and transformation.", difficulty:"easy", category:"Destinations" },
  { prompt:"The Cosmodrome is most associated with…", choices:["Old Russia and early Guardian rises","A Cabal arena on Mars","A Hive library on Titan","A Vex city inside Mercury"], answerIndex:0, explanation:"The Cosmodrome is in Old Russia and tied to early Destiny stories.", difficulty:"easy", category:"Destinations" },

  // Medium + Hard mixed (enough to support ramp)
  { prompt:"What is the Vex Network?", choices:["A trans-dimensional, trans-temporal virtual domain the Vex operate in","A Tower comms system","A Cabal battle-net radio","A Hive throne world"], answerIndex:0, explanation:"The Vex Network is a vast virtual space spanning dimensions/time.", difficulty:"medium", category:"Vex" },
  { prompt:"The Taken are best described as…", choices:["Beings altered by paracausal power, bound to a will","A Fallen House that wears black cloaks","Cabal shock troops","A Vex subroutine"], answerIndex:0, explanation:"Taken are transformed entities compelled by a greater will.", difficulty:"medium", category:"Hive/Taken" },
  { prompt:"Which enemy faction is most tied to 'ether' as a survival resource?", choices:["Eliksni (Fallen)","Cabal","Vex","Hive"], answerIndex:0, explanation:"Eliksni rely on ether as a vital resource.", difficulty:"medium", category:"Eliksni" },
  { prompt:"Which faction is most associated with 'throne worlds' and ascendant realms?", choices:["Hive","Cabal","Vex","Eliksni"], answerIndex:0, explanation:"Throne worlds are a core Hive concept.", difficulty:"medium", category:"Hive/Taken" },
  { prompt:"Which term is closely tied to Cabal military structure?", choices:["Legion","House","Brood","Collective"], answerIndex:0, explanation:"Cabal forces are organized into legions.", difficulty:"easy", category:"Cabal" },
  { prompt:"Which House served as a mediator between Fallen Houses (historically)?", choices:["House of Judgment","House of Devils","House of Wolves","House of Exile"], answerIndex:0, explanation:"House of Judgment traditionally kept peace and mediated disputes.", difficulty:"medium", category:"Eliksni" },
  { prompt:"Which House name is noted as secretive and dangerous among Eliksni?", choices:["House of Kings","House of Wolves","House of Judgment","House of Devils"], answerIndex:0, explanation:"House of Kings is often described as secretive and dangerous.", difficulty:"medium", category:"Eliksni" },
  { prompt:"What does the number in an Exo name usually indicate? (Example: Cayde-6)", choices:["How many times they’ve been rebooted","Their rank in the Vanguard","Their Ghost’s generation","Their age in centuries"], answerIndex:0, explanation:"The suffix number denotes the Exo’s reboot count.", difficulty:"medium", category:"Light" },

  { prompt:"The Witness pursues the Traveler in service of what idea?", choices:["Imposing its vision of the 'Final Shape'","Rebuilding the City walls","Restoring the House of Devils","Rewriting the Vanguard charter"], answerIndex:0, explanation:"Its goal is repeatedly associated with the 'Final Shape.'", difficulty:"hard", category:"Light" },
  { prompt:"Which phrase best describes the Vex Network?", choices:["A reality-adjacent domain of gates and computation","A Cabal parade route","A Fallen ether vault","A Vanguard weapons cache"], answerIndex:0, explanation:"The Vex Network is depicted as an immense virtual/para-real domain.", difficulty:"hard", category:"Vex" },
  { prompt:"The House of Wolves is most associated with which color identity in many depictions?", choices:["Blue armor","Green cloaks","Red capes","Gold banners"], answerIndex:0, explanation:"House of Wolves is described with blue armor in many sources.", difficulty:"hard", category:"Eliksni" },

  // --- Filler to reach ~60: copy the rest of your 60-bank here if you want.
  // For now, we’ll duplicate a few with remixed wording to expand pool quickly,
  // but you should paste your full 60 from the earlier file for max variety.

  { prompt:"What is the Last City?", choices:["Humanity’s final major safe haven on Earth","A Fallen capital ship","A Hive moon-temple","A Vex simulation server"], answerIndex:0, explanation:"The Last City is humanity’s bastion beneath the Traveler.", difficulty:"easy", category:"Light" },
  { prompt:"Which trio is the classic Light-element lineup?", choices:["Arc, Solar, Void","Ice, Fire, Wind","Light, Dark, Grey","Metal, Wood, Water"], answerIndex:0, explanation:"Arc, Solar, and Void are core Light elements.", difficulty:"easy", category:"Light" },
  { prompt:"Cabal are generally best described as…", choices:["A militaristic empire with heavy infantry and war machines","A ghostlike collective of Light","A cyber-organic time cult","A nomadic ether society"], answerIndex:0, explanation:"Cabal culture centers around war, conquest, and empire.", difficulty:"easy", category:"Cabal" },
  { prompt:"Hive power structures often revolve around…", choices:["Tithes, tribute, and ruthless hierarchy","Democratic votes","Ether rationing","Vex code audits"], answerIndex:0, explanation:"Hive society is built on tribute and domination.", difficulty:"medium", category:"Hive/Taken" },
  { prompt:"Which group is most associated with converting worlds into machine infrastructure?", choices:["Vex","Cabal","Hive","Eliksni"], answerIndex:0, explanation:"World conversion is a defining Vex behavior.", difficulty:"easy", category:"Vex" },
  { prompt:"Which activity is most tied to Shaxx?", choices:["The Crucible","Strikes","Nightfalls","Patrol beacons"], answerIndex:0, explanation:"Shaxx runs the Crucible.", difficulty:"easy", category:"Gameplay" },
  { prompt:"Most Destiny raids traditionally run with how many players?", choices:["Six","Two","Twelve","Twenty-four"], answerIndex:0, explanation:"Raids traditionally run with six players.", difficulty:"easy", category:"Gameplay" },
  { prompt:"If a question mentions 'Old Russia', what location is it probably pointing at?", choices:["The Cosmodrome","The EDZ","Nessus","Europa"], answerIndex:0, explanation:"Old Russia is commonly tied to the Cosmodrome region.", difficulty:"easy", category:"Destinations" },
  { prompt:"Which pairing is correct for Hive sibling gods?", choices:["Oryx, Savathûn, Xivu Arath","Calus, Ghaul, Caiatl","Mithrax, Variks, Eramis","Osiris, Saint-14, Shaxx"], answerIndex:0, explanation:"The three siblings are Oryx, Savathûn, and Xivu Arath.", difficulty:"easy", category:"Hive/Taken" },
  { prompt:"Fallen is the City’s term; what do they call themselves?", choices:["Eliksni","Ahamkara","Awoken","Psions"], answerIndex:0, explanation:"Eliksni is their self-name.", difficulty:"easy", category:"Eliksni" },

  // Add more here to reach a full 60+ pool.
];

// ─────────────────────────────────────────────
// DOM
// ─────────────────────────────────────────────
const startBtn = document.getElementById("startBtn");
const howBtn = document.getElementById("howBtn");
const restartBtn = document.getElementById("restartBtn");
const copyShareBtn = document.getElementById("copyShareBtn");
const hintBtn = document.getElementById("hintBtn");
const categorySelect = document.getElementById("categorySelect");

const nextBtn = document.getElementById("nextBtn");
const skipBtn = document.getElementById("skipBtn");

const promptEl = document.getElementById("prompt");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const hintEl = document.getElementById("hint");

const qCounter = document.getElementById("qCounter");
const scoreBadge = document.getElementById("scoreBadge");
const streakBadge = document.getElementById("streakBadge");
const rampBadge = document.getElementById("rampBadge");
const timeBadge = document.getElementById("timeBadge");
const timeBar = document.getElementById("timeBar");

const statusBadge = document.getElementById("statusBadge");
const summaryText = document.getElementById("summaryText");
const difficultyBadge = document.getElementById("difficultyBadge");
const modeText = document.getElementById("modeText");
const questionMeta = document.getElementById("questionMeta");

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let pool = [];
let deck = [];
let idx = -1;

let score = 0;
let streak = 0;
let correct = 0;

let answered = false;
let hintUsed = false;

let timer = null;
let secondsLeft = RUN.secondsPerQuestion;
let lastRunShare = "";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setStatus(text) {
  statusBadge.textContent = `status: ${text}`;
}

function setHUD() {
  qCounter.textContent = `Q: ${Math.max(0, idx + 1)} / ${RUN.totalQuestions}`;
  scoreBadge.textContent = `Score: ${score}`;
  streakBadge.textContent = `Streak: ${streak}`;

  const ramp = rampLevel(streak).toUpperCase();
  rampBadge.textContent = `Ramp: ${ramp}`;

  timeBadge.textContent = `Time: ${idx >= 0 && idx < deck.length ? secondsLeft : "—"}`;
  const pct = Math.max(0, Math.min(100, (secondsLeft / RUN.secondsPerQuestion) * 100));
  timeBar.style.width = pct + "%";
}

function clearFeedback() {
  feedbackEl.style.display = "none";
  feedbackEl.classList.remove("good", "bad");
  feedbackEl.textContent = "";
  hintEl.textContent = "";
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

function startTimer() {
  stopTimer();
  secondsLeft = RUN.secondsPerQuestion;
  setHUD();
  timer = setInterval(() => {
    secondsLeft -= 1;
    setHUD();
    if (secondsLeft <= 0) {
      stopTimer();
      if (!answered) revealAnswer(null, true);
    }
  }, 1000);
}

function filterByCategory(allQuestions, category) {
  if (category === "All") return [...allQuestions];
  return allQuestions.filter(q => q.category === category);
}

function pickDeckFromPool(questionPool) {
  // Pick 10 unique questions; if not enough, fallback to All
  let source = questionPool;
  if (source.length < RUN.totalQuestions) source = [...QUESTION_BANK];
  return shuffle(source).slice(0, RUN.totalQuestions);
}

function desiredDifficultySet() {
  const ramp = rampLevel(streak);
  return allowedDifficultiesForRamp(ramp);
}

function chooseNextQuestionIndex(remaining, allowedDiffs) {
  // Prefer questions in allowed difficulties; if none exist, accept anything.
  const preferred = remaining.filter(q => allowedDiffs.includes(q.difficulty));
  if (preferred.length === 0) return 0; // will pick first of remaining
  // pick a random index inside preferred, then map to remaining index
  const pick = preferred[Math.floor(Math.random() * preferred.length)];
  return remaining.indexOf(pick);
}

// Points logic: base + speed bonus + streak bonus, minus hint penalty if used.
function pointsForCorrect() {
  const speedBonus = Math.round((secondsLeft / RUN.secondsPerQuestion) * 50); // 0..50
  const base = 100;
  const streakBonus = Math.min(120, streak * 12);
  let total = base + speedBonus + streakBonus;
  if (hintUsed) total = Math.max(0, total - HINT.costPoints);
  return total;
}

function disableChoices() {
  [...choicesEl.querySelectorAll("button")].forEach(b => (b.disabled = true));
}

function currentCategory() {
  return categorySelect ? categorySelect.value : "All";
}

// ─────────────────────────────────────────────
// Core flow
// ─────────────────────────────────────────────
function renderQuestion() {
  answered = false;
  hintUsed = false;
  clearFeedback();

  if (idx < 0 || idx >= deck.length) return;

  const q = deck[idx];
  promptEl.textContent = q.prompt;

  const cat = q.category ? ` • ${q.category}` : "";
  difficultyBadge.textContent = `difficulty: ${q.difficulty}${cat}`;

  const ramp = rampLevel(streak).toUpperCase();
  questionMeta.textContent = `Current question • ramp target: ${ramp}`;

  choicesEl.innerHTML = "";
  q.choices.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choiceBtn";
    btn.textContent = c;
    btn.addEventListener("click", () => {
      if (answered) return;
      revealAnswer(i, false);
    });
    choicesEl.appendChild(btn);
  });

  setHUD();
  startTimer();
}

function revealAnswer(choiceIndex, timedOut) {
  answered = true;
  stopTimer();
  disableChoices();

  const q = deck[idx];
  const isCorrect = choiceIndex === q.answerIndex;

  if (isCorrect) {
    streak += 1;
    correct += 1;

    const gained = pointsForCorrect();
    score += gained;

    feedbackEl.classList.add("good");
    feedbackEl.textContent = hintUsed
      ? `Correct. +${gained} points (hint penalty applied).`
      : `Correct. +${gained} points.`;
  } else {
    streak = 0;
    feedbackEl.classList.add("bad");
    feedbackEl.textContent = timedOut ? "Time’s up." : "Wrong.";
  }

  feedbackEl.style.display = "block";
  hintEl.textContent = `Answer: ${q.choices[q.answerIndex]} • ${q.explanation}`;

  summaryText.textContent = `Correct: ${correct}/${RUN.totalQuestions} • Score: ${score} • Streak: ${streak}.`;
  setHUD();
}

function nextQuestion() {
  clearFeedback();
  stopTimer();

  if (idx + 1 >= RUN.totalQuestions) {
    endRun();
    return;
  }

  // Build remaining list and pick based on ramp difficulty
  const remaining = deck.slice(idx + 1);
  const allowedDiffs = desiredDifficultySet();

  // Reorder remaining so the next question matches ramp preference
  const chosenIdx = chooseNextQuestionIndex(remaining, allowedDiffs);
  const chosen = remaining.splice(chosenIdx, 1)[0];
  deck = deck.slice(0, idx + 1).concat([chosen], remaining);

  idx += 1;
  setStatus("in progress");
  renderQuestion();
}

function skipQuestion() {
  if (idx < 0 || idx >= deck.length) return;
  if (!answered) {
    // skipping breaks streak and counts as timeout/wrong
    streak = 0;
    stopTimer();
    revealAnswer(null, true);
  }
  nextQuestion();
}

function gradeRun() {
  const pct = (correct / RUN.totalQuestions) * 100;
  if (pct >= 90) return "S";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

function endRun() {
  stopTimer();
  setStatus("complete");

  const grade = gradeRun();
  const cat = currentCategory();
  const line = `Warlord Trivia (${cat}): Grade ${grade} — ${correct}/${RUN.totalQuestions} correct — Score ${score}.`;

  lastRunShare = line;

  promptEl.textContent = "Run complete.";
  choicesEl.innerHTML = "";

  feedbackEl.style.display = "block";
  feedbackEl.classList.remove("good", "bad");
  feedbackEl.textContent = line;

  hintEl.textContent = "Restart for a new random set, or Copy Results to flex on your fireteam.";
  summaryText.textContent = line;

  difficultyBadge.textContent = "difficulty: —";
  questionMeta.textContent = "Current question";
  timeBar.style.width = "0%";
  timeBadge.textContent = "Time: —";
}

function startGame() {
  const cat = currentCategory();
  pool = filterByCategory(QUESTION_BANK, cat);

  deck = pickDeckFromPool(pool);

  // if category pool is tiny, we still run (fallback handled in pickDeckFromPool)
  idx = -1;
  score = 0;
  streak = 0;
  correct = 0;
  answered = false;
  hintUsed = false;

  modeText.textContent = `Mode: ${RUN.totalQuestions} random questions • ${RUN.secondsPerQuestion}s each • Category: ${cat} • Pool: ${pool.length}`;

  setStatus("ready");
  summaryText.textContent = `Run ready. Loaded ${RUN.totalQuestions} random questions from ${cat === "All" ? "the full pool" : `category pool (${pool.length})`}.`;
  nextQuestion();
}

function useHint() {
  if (idx < 0 || idx >= deck.length) return;
  if (answered) return;

  if (HINT.lockPerQuestion && hintUsed) {
    feedbackEl.style.display = "block";
    feedbackEl.classList.remove("good");
    feedbackEl.classList.add("bad");
    feedbackEl.textContent = "Hint already used for this question.";
    return;
  }

  hintUsed = true;

  const q = deck[idx];
  // Reveal explanation early (without showing answer explicitly)
  feedbackEl.style.display = "block";
  feedbackEl.classList.remove("bad");
  feedbackEl.classList.add("good");
  feedbackEl.textContent = `Hint used (-${HINT.costPoints} points if you answer correctly).`;

  hintEl.textContent = `Clue: ${q.explanation}`;
}

async function copyResults() {
  const txt = lastRunShare || "Warlord Trivia — no completed run yet.";
  try {
    await navigator.clipboard.writeText(txt);
    feedbackEl.style.display = "block";
    feedbackEl.classList.remove("bad");
    feedbackEl.classList.add("good");
    feedbackEl.textContent = "Copied results to clipboard.";
  } catch {
    feedbackEl.style.display = "block";
    feedbackEl.classList.add("bad");
    feedbackEl.textContent = "Couldn’t copy automatically—copy the text manually.";
  }
}

function showHow() {
  feedbackEl.style.display = "block";
  feedbackEl.classList.remove("good", "bad");
  feedbackEl.textContent =
    `How it works: Choose a category. You get ${RUN.totalQuestions} random questions (20s each). Correct answers score based on speed + streak. Streak ramps difficulty: 0–2 easy, 3–5 medium, 6+ hard. Hint reveals a clue early but costs ${HINT.costPoints} points if you answer correctly.`;
}

// ─────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
howBtn.addEventListener("click", showHow);
hintBtn.addEventListener("click", useHint);

nextBtn.addEventListener("click", () => {
  if (idx < 0) startGame();
  else nextQuestion();
});
skipBtn.addEventListener("click", skipQuestion);
copyShareBtn.addEventListener("click", copyResults);

// If user changes category mid-run, we don’t auto-restart—keeps it clean.
// But we can update the mode text so they know what’s selected next.
categorySelect.addEventListener("change", () => {
  const cat = currentCategory();
  modeText.textContent = `Mode: ${RUN.totalQuestions} random questions • ${RUN.secondsPerQuestion}s each • Category: ${cat}`;
});

// initial UI
setStatus("idle");
modeText.textContent = `Mode: ${RUN.totalQuestions} random questions • ${RUN.secondsPerQuestion}s each • Category: ${currentCategory()} • Pool: ${QUESTION_BANK.length}`;
setHUD();
