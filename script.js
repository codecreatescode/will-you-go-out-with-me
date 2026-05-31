// ─── Put your Formspree form URL here to get her answers by email ───
// Sign up at https://formspree.io → New form → copy the endpoint (e.g. https://formspree.io/f/abcdefgh)
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xykvaway";

const NO_MESSAGES = [
  "Nice try! That button only knows how to say yes 💕",
  "Error 404: 'No' not found. Please try Yes instead!",
  "Breaking news: Scientists confirm this button is broken on purpose.",
  "Plot twist: the No button is shy and ran away!",
  "System message: Invalid response. Cute girlfriend detected. Yes required! ✨",
  "Hmm… that didn't work. Maybe your finger slipped? Try Yes! 😊",
  "The universe whispered: pick Yes. I'm just passing the message along 🌸",
  "Oops! That option is temporarily unavailable (forever).",
];

const TIME_SLOTS = [
  { label: "Morning", time: "10:00 AM" },
  { label: "Lunch", time: "12:30 PM" },
  { label: "Afternoon", time: "3:00 PM" },
  { label: "Early evening", time: "6:00 PM" },
  { label: "Dinner time", time: "7:30 PM" },
  { label: "Late evening", time: "9:00 PM" },
];

const DATE_TYPE_LABELS = {
  dinner: "Dinner date 🍽️",
  fun: "Fun date 🎢",
  surprise: "Surprise me! 🎁",
};

const CUISINE_OPTIONS = [
  { label: "Korean", flag: "🇰🇷" },
  { label: "Chinese", flag: "🇨🇳" },
  { label: "Persian", flagImage: "flags/lion-sun.svg" },
  { label: "Mexican", flag: "🇲🇽" },
  { label: "Sushi", flag: "🇯🇵" },
  { label: "Middle Eastern", flag: "🇱🇧" },
  { label: "Italian", flag: "🇮🇹" },
];

const FUN_ACTIVITY_OPTIONS = [
  { id: "escape", label: "Escape room", emoji: "🔐" },
  { id: "bowling", label: "Bowling", emoji: "🎳" },
  { id: "arcade", label: "Arcade", emoji: "🕹️" },
];

const LOCATION_OPTIONS = [
  "Richmond Hill",
  "North York",
  "Midtown",
  "Downtown",
];

/** All of her choices live here — inspect in DevTools or send via Formspree */
const responses = {
  day: null,
  time: null,
  dateType: null,
  cuisine: null,
  funActivity: null,
  specialRequests: "",
  location: null,
};

let noClickCount = 0;

const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const noMessage = document.getElementById("no-message");
const dayOptions = document.getElementById("day-options");
const timeOptions = document.getElementById("time-options");
const foodOptions = document.getElementById("food-options");
const funOptions = document.getElementById("fun-options");
const locationOptions = document.getElementById("location-options");
const locationTitle = document.getElementById("location-title");
const selectedDayLabel = document.getElementById("selected-day-label");
const summary = document.getElementById("summary");
const submitStatus = document.getElementById("submit-status");
const specialRequestsInput = document.getElementById("special-requests");
const customCuisineInput = document.getElementById("custom-cuisine");
const requestsForm = document.getElementById("requests-form");
const foodCustomForm = document.getElementById("food-custom-form");

function showStep(stepId) {
  document.querySelectorAll(".step").forEach((el) => {
    el.classList.toggle("active", el.id === `step-${stepId}`);
  });
}

function isDinnerDate() {
  return responses.dateType === "dinner";
}

function isFunDate() {
  return responses.dateType === "fun";
}

function updateLocationStepTitle() {
  if (isFunDate() && responses.funActivity) {
    locationTitle.textContent = `Which area works best for ${responses.funActivity}?`;
  } else {
    locationTitle.textContent = "Which area feels most comfortable?";
  }
}

function getPayload() {
  const typeLabel = DATE_TYPE_LABELS[responses.dateType] || responses.dateType;
  return {
    day: responses.day
      ? `${responses.day.weekday}, ${responses.day.shortDate}`
      : "",
    dayIso: responses.day?.iso || "",
    time: responses.time ? `${responses.time.label} (${responses.time.time})` : "",
    dateType: typeLabel,
    cuisine: responses.cuisine || "(not applicable)",
    funActivity: responses.funActivity || "(not applicable)",
    specialRequests: responses.specialRequests.trim() || "(none)",
    location: responses.location || "",
  };
}

function renderSummaryHtml() {
  const p = getPayload();
  const cuisineRow =
    responses.dateType === "dinner"
      ? `<p><strong>Food:</strong> ${responses.cuisine}</p>`
      : "";
  const funRow =
    responses.dateType === "fun"
      ? `<p><strong>Activity:</strong> ${responses.funActivity}</p>`
      : "";

  return `
    <p><strong>When:</strong> ${p.day}</p>
    <p><strong>Time:</strong> ${p.time}</p>
    <p><strong>Plan:</strong> ${p.dateType}</p>
    ${cuisineRow}
    ${funRow}
    <p><strong>Special requests:</strong> ${p.specialRequests}</p>
    <p><strong>Area:</strong> ${p.location}</p>
  `;
}

async function sendResponsesToYou() {
  const payload = getPayload();

  // Always log so you can test locally (F12 → Console)
  console.log("Date invite responses:", { ...responses, formatted: payload });

  if (!FORMSPREE_ENDPOINT) {
    submitStatus.textContent =
      "Her picks are saved on this page. Add your Formspree URL in script.js to get them by email.";
    submitStatus.className = "submit-status warn";
    submitStatus.classList.remove("hidden");
    return;
  }

  const body = new FormData();
  body.append("_subject", "Asal picked a date! 💕");
  Object.entries(payload).forEach(([key, value]) => {
    body.append(key, value);
  });

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body,
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      submitStatus.textContent = "Your picks were sent. Your date coordinator will be in touch shortly!";
      submitStatus.className = "submit-status ok";
    } else {
      throw new Error("Form submit failed");
    }
  } catch {
    submitStatus.textContent =
      "Couldn't send email right now, but her choices are shown below.";
    submitStatus.className = "submit-status warn";
  }

  submitStatus.classList.remove("hidden");
}

function finishAndSubmit() {
  summary.innerHTML = renderSummaryHtml();
  showStep("done");
  sendResponsesToYou();
}

function getUpcomingDays(count = 7) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
      shortDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      iso: d.toISOString().slice(0, 10),
    });
  }
  return days;
}

function renderDayOptions() {
  dayOptions.innerHTML = "";
  getUpcomingDays().forEach((day) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.innerHTML = `
      <span class="day-name">${day.weekday}</span>
      <span class="day-date">${day.shortDate}</span>
    `;
    btn.addEventListener("click", () => {
      responses.day = day;
      selectedDayLabel.textContent = `${day.weekday}, ${day.shortDate}`;
      renderTimeOptions();
      showStep("time");
    });
    dayOptions.appendChild(btn);
  });
}

function renderTimeOptions() {
  timeOptions.innerHTML = "";
  TIME_SLOTS.forEach((slot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.textContent = `${slot.label} — ${slot.time}`;
    btn.addEventListener("click", () => {
      responses.time = slot;
      showStep("type");
    });
    timeOptions.appendChild(btn);
  });
}

function renderCuisineFlag(cuisine) {
  if (cuisine.flagImage) {
    return `<img class="option-flag option-flag--img" src="${cuisine.flagImage}" alt="" width="32" height="18" />`;
  }
  return `<span class="option-flag" aria-hidden="true">${cuisine.flag}</span>`;
}

function renderFoodOptions() {
  foodOptions.innerHTML = "";
  CUISINE_OPTIONS.forEach((cuisine) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn option-btn--with-flag";
    btn.innerHTML = `
      ${renderCuisineFlag(cuisine)}
      <span>${cuisine.label}</span>
    `;
    btn.addEventListener("click", () => {
      responses.cuisine = cuisine.label;
      showStep("requests");
    });
    foodOptions.appendChild(btn);
  });

  const otherBtn = document.createElement("button");
  otherBtn.type = "button";
  otherBtn.className = "option-btn option-btn--with-flag option-btn--other";
  otherBtn.innerHTML = `
    <span class="option-flag" aria-hidden="true">✏️</span>
    <span>Something else…</span>
  `;
  otherBtn.addEventListener("click", () => {
    const isPreset = CUISINE_OPTIONS.some((c) => c.label === responses.cuisine);
    customCuisineInput.value = !isPreset && responses.cuisine ? responses.cuisine : "";
    showStep("food-custom");
  });
  foodOptions.appendChild(otherBtn);
}

function renderFunOptions() {
  funOptions.innerHTML = "";
  FUN_ACTIVITY_OPTIONS.forEach((activity) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.innerHTML = `<span class="day-name">${activity.emoji} ${activity.label}</span>`;
    btn.addEventListener("click", () => {
      responses.funActivity = activity.label;
      responses.location = null;
      updateLocationStepTitle();
      renderLocationOptions();
      showStep("location");
    });
    funOptions.appendChild(btn);
  });
}

function renderLocationOptions() {
  locationOptions.innerHTML = "";
  LOCATION_OPTIONS.forEach((area) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.textContent = area;
    btn.addEventListener("click", () => {
      responses.location = area;
      if (isFunDate()) {
        showStep("requests");
      } else {
        finishAndSubmit();
      }
    });
    locationOptions.appendChild(btn);
  });
}

function goAfterDateType(type) {
  responses.dateType = type;
  responses.cuisine = null;
  responses.funActivity = null;
  responses.location = null;

  if (type === "dinner") {
    renderFoodOptions();
    showStep("food");
  } else if (type === "fun") {
    renderFunOptions();
    showStep("fun");
  } else {
    showStep("requests");
  }
}

function continueFromRequests() {
  responses.specialRequests = specialRequestsInput.value;
  if (isFunDate()) {
    finishAndSubmit();
  } else {
    updateLocationStepTitle();
    renderLocationOptions();
    showStep("location");
  }
}

function getBackStepFromRequests() {
  if (isDinnerDate()) {
    return responses.cuisine && !CUISINE_OPTIONS.some((c) => c.label === responses.cuisine)
      ? "food-custom"
      : "food";
  }
  if (isFunDate()) return "location";
  return "type";
}

function getBackStepFromLocation() {
  if (isFunDate()) return "fun";
  return "requests";
}

function showNoMessage() {
  const msg = NO_MESSAGES[noClickCount % NO_MESSAGES.length];
  noClickCount += 1;
  noMessage.textContent = msg;
  noMessage.classList.remove("hidden");
  void noMessage.offsetWidth;
  noMessage.style.animation = "none";
  void noMessage.offsetWidth;
  noMessage.style.animation = "";
}

function dodgeNoButton() {
  const zone = document.getElementById("no-dodge-zone");
  if (!zone) return;

  const padding = 4;
  const maxX = zone.clientWidth - btnNo.offsetWidth - padding * 2;
  const maxY = zone.clientHeight - btnNo.offsetHeight - padding * 2;

  btnNo.style.position = "absolute";
  btnNo.style.transform = "none";
  btnNo.style.left = `${padding + Math.random() * Math.max(maxX, 0)}px`;
  btnNo.style.top = `${padding + Math.random() * Math.max(maxY, 0)}px`;
}

btnYes.addEventListener("click", () => showStep("yay"));

btnNo.addEventListener("click", (e) => {
  e.preventDefault();
  showNoMessage();
});

btnNo.addEventListener("mouseenter", dodgeNoButton);
btnNo.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodgeNoButton();
  showNoMessage();
}, { passive: false });

document.getElementById("btn-continue-day").addEventListener("click", () => {
  renderDayOptions();
  showStep("day");
});

document.querySelectorAll(".back-btn[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => showStep(btn.dataset.back));
});

document.getElementById("btn-back-requests").addEventListener("click", () => {
  showStep(getBackStepFromRequests());
});

document.getElementById("btn-back-location").addEventListener("click", () => {
  showStep(getBackStepFromLocation());
});

document.querySelectorAll("#type-options .option-card").forEach((card) => {
  card.addEventListener("click", () => goAfterDateType(card.dataset.type));
});

requestsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  continueFromRequests();
});

document.getElementById("btn-skip-requests").addEventListener("click", () => {
  specialRequestsInput.value = "";
  continueFromRequests();
});

foodCustomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = customCuisineInput.value.trim();
  if (!value) return;
  responses.cuisine = value;
  showStep("requests");
});

renderDayOptions();
renderFoodOptions();
renderFunOptions();
renderLocationOptions();
