/**
 * Trait system
 * - 12 questions
 * - Trait-based scoring
 * - Closest match (cosine similarity)
 * - Primary + Secondary influence
 * - Trait bars UI
 */

const TRAITS = [
  { key: "authority",  label: "Authority" },
  { key: "compassion", label: "Compassion" },
  { key: "aggression", label: "Aggression" },
  { key: "cunning",    label: "Cunning" },
  { key: "discipline", label: "Discipline" },
  { key: "ambition",   label: "Ambition" },
  { key: "mystique",   label: "Mystique" } // fear/legend/unknowable presence
];

// 12 rewritten questions with trait-weighted answers
const QUESTIONS = [
  {
    prompt: "A settlement asks for your protection. What do you demand in return?",
    options: {
      A: { text: "Tribute and strict rules. Order costs something.", traits: { authority: 2, discipline: 1, ambition: 1 } },
      B: { text: "Nothing upfront. I’ll earn trust, then build structure together.", traits: { compassion: 2, discipline: 1, authority: 1 } },
      C: { text: "A pledge to fight with me. Strength should be shared.", traits: { aggression: 1, ambition: 1, authority: 1 } },
      D: { text: "Information and silence. My protection is invisible.", traits: { cunning: 2, mystique: 2 } }
    }
  },
  {
    prompt: "When someone challenges your authority publicly, you…",
    options: {
      A: { text: "Make an example—fast. Doubt spreads like rot.", traits: { authority: 2, aggression: 2, mystique: 1 } },
      B: { text: "Set terms and offer a way out. Respect is stronger than fear.", traits: { discipline: 2, compassion: 1, authority: 1 } },
      C: { text: "Turn it into a trial by combat. Let strength decide.", traits: { aggression: 2, ambition: 1, authority: 1 } },
      D: { text: "Let them speak… and quietly remove their support network.", traits: { cunning: 2, authority: 1, mystique: 1 } }
    }
  },
  {
    prompt: "Your ideal territory is…",
    options: {
      A: { text: "A defensible zone with checkpoints and patrols.", traits: { authority: 2, discipline: 2 } },
      B: { text: "A safe haven with clear laws and real accountability.", traits: { compassion: 2, discipline: 2, authority: 1 } },
      C: { text: "A proving ground—hard land makes hard people.", traits: { aggression: 2, ambition: 2 } },
      D: { text: "A place no one fully understands. Confusion is protection.", traits: { mystique: 2, cunning: 2 } }
    }
  },
  {
    prompt: "A rival Warlord offers an alliance. Your first move?",
    options: {
      A: { text: "Negotiate from a position of control—terms, limits, leverage.", traits: { authority: 2, cunning: 1, discipline: 1 } },
      B: { text: "Ask what they’re protecting. Motive matters more than power.", traits: { compassion: 2, discipline: 1 } },
      C: { text: "Test them. If they fold, they’re useless.", traits: { aggression: 2, ambition: 1 } },
      D: { text: "Accept—then verify. Trust is a tool, not a feeling.", traits: { cunning: 2, discipline: 1, mystique: 1 } }
    }
  },
  {
    prompt: "What’s your relationship with rules?",
    options: {
      A: { text: "Rules exist to keep people in line.", traits: { authority: 2, discipline: 1 } },
      B: { text: "Rules exist to protect the vulnerable.", traits: { compassion: 2, discipline: 1 } },
      C: { text: "Rules exist until they stop me.", traits: { ambition: 2, aggression: 1 } },
      D: { text: "Rules exist… for other people.", traits: { cunning: 2, mystique: 1 } }
    }
  },
  {
    prompt: "A trusted lieutenant fails a critical mission.",
    options: {
      A: { text: "Demote them publicly. The system must be respected.", traits: { authority: 2, discipline: 2 } },
      B: { text: "Debrief privately. Fix the cause, not just the symptom.", traits: { compassion: 2, discipline: 2 } },
      C: { text: "Replace them. I can’t afford weakness.", traits: { ambition: 2, aggression: 1, authority: 1 } },
      D: { text: "Keep them… and make them useful in a different way.", traits: { cunning: 2, mystique: 1 } }
    }
  },
  {
    prompt: "Your presence in battle is usually…",
    options: {
      A: { text: "Commanding from the center—everyone sees who leads.", traits: { authority: 2, discipline: 1 } },
      B: { text: "Controlled and precise. No wasted motion.", traits: { discipline: 2, authority: 1 } },
      C: { text: "Frontline chaos. I win by willpower and pressure.", traits: { aggression: 2, ambition: 1 } },
      D: { text: "Unseen until it’s over. People feel me more than they see me.", traits: { mystique: 2, cunning: 2 } }
    }
  },
  {
    prompt: "What do you fear most?",
    options: {
      A: { text: "Losing control of my territory.", traits: { authority: 2, ambition: 1 } },
      B: { text: "Becoming the monster I’m trying to stop.", traits: { compassion: 2, discipline: 1 } },
      C: { text: "Being forgotten. I want legacy.", traits: { ambition: 2, aggression: 1 } },
      D: { text: "Being truly known. Mystery keeps me safe.", traits: { mystique: 2, cunning: 1 } }
    }
  },
  {
    prompt: "How do you recruit followers?",
    options: {
      A: { text: "Promises of protection—under my banner.", traits: { authority: 2, discipline: 1 } },
      B: { text: "By showing up when it matters. Consistency builds loyalty.", traits: { compassion: 2, discipline: 1 } },
      C: { text: "Through victory. People follow the unstoppable.", traits: { aggression: 2, ambition: 2 } },
      D: { text: "Through reputation. People come seeking what they can’t explain.", traits: { mystique: 2, cunning: 1, ambition: 1 } }
    }
  },
  {
    prompt: "You uncover a cache of Golden Age tech. You…",
    options: {
      A: { text: "Lock it down. Tech is power, and power needs control.", traits: { authority: 2, discipline: 1, ambition: 1 } },
      B: { text: "Use it carefully to improve lives—no reckless experiments.", traits: { compassion: 2, discipline: 2 } },
      C: { text: "Use it immediately to gain an advantage.", traits: { ambition: 2, aggression: 1 } },
      D: { text: "Hide it. Let others chase shadows while I choose the moment.", traits: { cunning: 2, mystique: 2 } }
    }
  },
  {
    prompt: "If you had to describe your moral code:",
    options: {
      A: { text: "Stability first. A harsh peace beats a soft collapse.", traits: { authority: 2, discipline: 1 } },
      B: { text: "People first. Power is a responsibility.", traits: { compassion: 2, discipline: 1 } },
      C: { text: "Strength first. The weak must adapt or be protected by the strong.", traits: { aggression: 2, ambition: 1, authority: 1 } },
      D: { text: "Outcome first. Methods are flexible.", traits: { cunning: 2, mystique: 1 } }
    }
  },
  {
    prompt: "When the Dark Age ends, what do you want your story to be?",
    options: {
      A: { text: "I built a domain that endured.", traits: { authority: 2, ambition: 2 } },
      B: { text: "I kept people alive—and made something better possible.", traits: { compassion: 2, discipline: 1 } },
      C: { text: "I was the legend nobody could break.", traits: { aggression: 2, ambition: 2, mystique: 1 } },
      D: { text: "They’ll whisper my name and never know the full truth.", traits: { mystique: 2, cunning: 2 } }
    }
  }
];

// Trait maps for every warlord you listed
const WARLORDS = [
  { name: "Benyo Lukacs", traits: { authority: 4, compassion: 1, aggression: 2, cunning: 2, discipline: 3, ambition: 3, mystique: 1 },
    description: "Territory-first leadership: hard borders, strict expectations, and pragmatic stability. People are safer with structure—even if they resent it." },

  { name: "Cathal", traits: { authority: 3, compassion: 2, aggression: 3, cunning: 1, discipline: 2, ambition: 3, mystique: 1 },
    description: "A storm with a spine: direct, intense, and decisive. Protective—so long as people commit and keep up." },

  { name: "Citan", traits: { authority: 4, compassion: 1, aggression: 3, cunning: 3, discipline: 3, ambition: 3, mystique: 1 },
    description: "The tactician-warlord: controlled violence, smart positioning, and relentless pressure to keep your sector yours." },

  { name: "Carnunta", traits: { authority: 4, compassion: 1, aggression: 2, cunning: 2, discipline: 4, ambition: 2, mystique: 1 },
    description: "Discipline as a weapon: clear rules, consistent enforcement, and zero tolerance for chaos." },

  { name: "Castor", traits: { authority: 3, compassion: 2, aggression: 2, cunning: 1, discipline: 4, ambition: 2, mystique: 1 },
    description: "The keeper of a stronghold: steady leadership, reliable routines, and legacy built through discipline." },

  { name: "Felwinter", traits: { authority: 2, compassion: 4, aggression: 1, cunning: 2, discipline: 4, ambition: 1, mystique: 2 },
    description: "Reluctant power with a conscience: precise, controlled, principled. You carry authority like a burden—and wield it carefully." },

  { name: "Heyka-4", traits: { authority: 2, compassion: 2, aggression: 2, cunning: 4, discipline: 2, ambition: 3, mystique: 2 },
    description: "An operator: adaptable, clever, and always thinking two moves ahead. You win by information, timing, and leverage." },

  { name: "Kandak", traits: { authority: 4, compassion: 1, aggression: 3, cunning: 2, discipline: 3, ambition: 3, mystique: 1 },
    description: "Hard-zone command: direct authority, controlled brutality, and the belief that only strength holds contested ground." },

  { name: "Naeem", traits: { authority: 3, compassion: 2, aggression: 2, cunning: 3, discipline: 3, ambition: 2, mystique: 2 },
    description: "Calculated protection: practical compassion mixed with strategy. You’ll help people—on terms that keep the system stable." },

  { name: "Red Man", traits: { authority: 2, compassion: 0, aggression: 3, cunning: 4, discipline: 2, ambition: 2, mystique: 5 },
    description: "A walking rumor: fear as a weapon, presence as a warning. You control the room without ever explaining yourself." },

  { name: "Reich", traits: { authority: 4, compassion: 0, aggression: 2, cunning: 4, discipline: 3, ambition: 4, mystique: 2 },
    description: "Empire-builder energy: power, optics, and control. You don’t just win—you define the rules everyone lives under." },

  { name: "Rience", traits: { authority: 2, compassion: 1, aggression: 2, cunning: 4, discipline: 3, ambition: 3, mystique: 2 },
    description: "A planner with sharp edges: disciplined strategy, quiet ambition, and a preference for outcomes over spectacle." },

  { name: "Segoth", traits: { authority: 3, compassion: 0, aggression: 3, cunning: 3, discipline: 2, ambition: 2, mystique: 4 },
    description: "The dread silhouette: intimidating, uncompromising, hard to read. People obey because uncertainty is terrifying." },

  { name: "Shaxx (formerly)", traits: { authority: 4, compassion: 1, aggression: 5, cunning: 1, discipline: 3, ambition: 4, mystique: 1 },
    description: "Battlefield made flesh: bold leadership, raw momentum, refusal to yield. You inspire through force of will." },

  { name: "The Wake", traits: { authority: 2, compassion: 0, aggression: 2, cunning: 3, discipline: 2, ambition: 2, mystique: 5 },
    description: "An omen: quiet inevitability and lingering fear. Your influence is felt after you’ve already passed." }
];

// --- DOM hooks ---
const form = document.getElementById("quiz");
const progress = document.getElementById("progress");
const warn = document.getElementById("warn");

const resultBox = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultBody = document.getElementById("resultBody");
const traitBars = document.getElementById("traitBars");
const traitSummary = document.getElementById("traitSummary");
const traitNotes = document.getElementById("traitNotes");
const matchConfidence = document.getElementById("matchConfidence");

const secondaryName = document.getElementById("secondaryName");
const secondaryBody = document.getElementById("secondaryBody");

const shareText = document.getElementById("shareText");
const resultChips = document.getElementById("resultChips");

function render() {
  // remove old
  const existingQs = form.querySelectorAll(".q");
  existingQs.forEach(el => el.remove());

  QUESTIONS.forEach((q, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "q";
    wrap.innerHTML = `
      <h3>${idx + 1}️⃣ ${q.prompt}</h3>
      <div class="opts">
        ${Object.entries(q.options).map(([key, opt]) => `
          <label class="opt">
            <input type="radio" name="q${idx}" value="${key}" />
            <div class="txt"><b>${key}.</b> ${opt.text}</div>
          </label>
        `).join("")}
      </div>
    `;
    form.insertBefore(wrap, warn);
  });

  form.addEventListener("change", updateProgress);
  updateProgress();
}

function updateProgress() {
  const answered = QUESTIONS.reduce((acc, _, idx) => {
    return acc + (form.querySelector(`input[name="q${idx}"]:checked`) ? 1 : 0);
  }, 0);
  progress.textContent = `${answered} / ${QUESTIONS.length} answered`;
}

function emptyTraitVector() {
  const v = {};
  TRAITS.forEach(t => v[t.key] = 0);
  return v;
}

function addTraits(total, delta) {
  for (const k in delta) {
    if (typeof total[k] !== "number") total[k] = 0;
    total[k] += delta[k];
  }
}

function computeUserTraits() {
  const totals = emptyTraitVector();

  for (let i = 0; i < QUESTIONS.length; i++) {
    const picked = form.querySelector(`input[name="q${i}"]:checked`);
    if (!picked) return null;
    const opt = QUESTIONS[i].options[picked.value];
    addTraits(totals, opt.traits);
  }

  return totals;
}

function vecToArray(v) {
  return TRAITS.map(t => v[t.key] || 0);
}

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function matchWarlords(userTraits) {
  const u = vecToArray(userTraits);

  const scored = WARLORDS.map(w => {
    const wv = vecToArray(w.traits);
    const sim = cosineSimilarity(u, wv);
    const dot = u.reduce((acc, val, i) => acc + val * wv[i], 0);
    return { warlord: w, sim, dot };
  }).sort((x, y) => (y.sim - x.sim) || (y.dot - x.dot));

  const primary = scored[0];
  const secondary = scored[1] || scored[0];

  const gap = Math.max(0, primary.sim - secondary.sim);
  const conf = Math.min(0.98, 0.62 + gap * 1.6);
  const confPct = Math.round(conf * 100);

  return { primary, secondary, confPct };
}

function prettyTrait(key) {
  const t = TRAITS.find(x => x.key === key);
  return t ? t.label : key;
}

function topTraitKeys(userTraits, n=3) {
  const entries = TRAITS.map(t => [t.key, userTraits[t.key] || 0]);
  entries.sort((a,b) => b[1] - a[1]);
  return entries.slice(0, n).map(e => e[0]);
}

function clamp01(x){ return Math.max(0, Math.min(1, x)); }

function renderTraitBars(userTraits) {
  const vals = TRAITS.map(t => userTraits[t.key] || 0);
  const maxVal = Math.max(...vals, 1);

  traitBars.innerHTML = "";

  TRAITS.forEach(t => {
    const val = userTraits[t.key] || 0;
    const pct = Math.round(clamp01(val / maxVal) * 100);

    const row = document.createElement("div");
    row.className = "traitRow";
    row.innerHTML = `
      <div class="traitName">
        <span class="traitGlyph" aria-hidden="true"></span>
        <span>${t.label}</span>
      </div>
      <div class="bar" aria-label="${t.label} ${val}">
        <div class="barHint" aria-hidden="true"></div>
        <div class="barFill" style="width:0%"></div>
      </div>
      <div class="traitVal">${val}</div>
    `;
    traitBars.appendChild(row);

    requestAnimationFrame(() => {
      row.querySelector(".barFill").style.width = pct + "%";
    });
  });
}

function traitInterpretation(userTraits) {
  const top3 = topTraitKeys(userTraits, 3);
  const low2 = topTraitKeys(userTraits, TRAITS.length).slice(-2);

  const topLine = `Top tendencies: ${top3.map(prettyTrait).join(", ")}.`;
  const lowLine = `Under pressure, you may neglect: ${low2.map(prettyTrait).join(", ")}.`;

  const a = userTraits.authority || 0;
  const c = userTraits.compassion || 0;
  const g = userTraits.aggression || 0;
  const u = userTraits.cunning || 0;
  const d = userTraits.discipline || 0;
  const m = userTraits.mystique || 0;
  const amb = userTraits.ambition || 0;

  let bonus = "";
  if (c >= 8 && d >= 7) bonus = "You prefer stability with a conscience—protective, methodical, and hard to shake.";
  else if (g >= 8 && amb >= 7) bonus = "You thrive on momentum—pressure, decisive action, and high-stakes leadership.";
  else if (u >= 8 && m >= 7) bonus = "You lead indirectly—through timing, uncertainty, and leverage.";
  else if (a >= 8 && d >= 7) bonus = "You build systems—clear hierarchies, controlled territory, and enforced order.";
  else if (c >= 8 && a >= 7) bonus = "You’re a rare blend: protective authority—soft-hearted and uncompromising.";

  return { top3, topLine, lowLine, bonus };
}

function showResult() {
  warn.style.display = "none";

  const userTraits = computeUserTraits();
  if (!userTraits) {
    resultBox.style.display = "none";
    warn.style.display = "block";
    warn.textContent = "Finish all questions to reveal your result.";
    warn.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const { primary, secondary, confPct } = matchWarlords(userTraits);

  resultTitle.textContent = primary.warlord.name;
  resultBody.textContent = primary.warlord.description;
  matchConfidence.textContent = `match: ${confPct}%`;

  renderTraitBars(userTraits);

  const interp = traitInterpretation(userTraits);
  traitSummary.textContent = `top traits: ${interp.top3.map(prettyTrait).join(", ")}`;
  traitNotes.textContent = `${interp.topLine} ${interp.lowLine} ${interp.bonus}`;

  const secSame = secondary.warlord.name === primary.warlord.name;
  secondaryName.textContent = secSame ? "—" : secondary.warlord.name;
  secondaryBody.textContent = secSame
    ? "Your profile is strongly concentrated—your primary match dominates your tendencies."
    : secondary.warlord.description;

  const topTraits = interp.top3.map(prettyTrait).join(", ");
  const secText = secSame ? "None" : secondary.warlord.name;

  const share = `I got: ${primary.warlord.name} (Secondary: ${secText}). Top traits: ${topTraits}.`;
  shareText.textContent = share;

  resultChips.innerHTML = "";
  const chips = [
    `Primary: ${primary.warlord.name}`,
    `Secondary: ${secText}`,
    ...interp.top3.map(k => `Trait: ${prettyTrait(k)}`)
  ];
  chips.forEach(t => {
    const el = document.createElement("div");
    el.className = "chip";
    el.textContent = t;
    resultChips.appendChild(el);
  });

  resultBox.style.display = "block";
  resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetQuiz() {
  form.reset();
  warn.style.display = "none";
  resultBox.style.display = "none";
  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function copyShare() {
  const txt = shareText.textContent.trim();
  const userTraits = computeUserTraits();

  if (!userTraits || !txt) {
    warn.style.display = "block";
    warn.textContent = "Reveal your result first, then copy the share text.";
    return;
  }

  try {
    await navigator.clipboard.writeText(txt);
    warn.style.display = "block";
    warn.style.background = "rgba(199,163,74,.10)";
    warn.style.borderColor = "rgba(199,163,74,.28)";
    warn.style.color = "#f3e8c1";
    warn.textContent = "Copied share text to clipboard.";
  } catch (e) {
    warn.style.display = "block";
    warn.textContent = "Couldn’t copy automatically — select the share text and copy it manually.";
  }
}

document.getElementById("submitBtn").addEventListener("click", showResult);
document.getElementById("resetBtn").addEventListener("click", resetQuiz);
document.getElementById("copyBtn").addEventListener("click", copyShare);

render();
