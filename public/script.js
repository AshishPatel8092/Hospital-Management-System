/* ==================================
   USER LOGIN STATUS
================================== */

// false = guest
// true = logged in

let isLoggedIn = true;

/*
After real login:

isLoggedIn = true;

*/

function updateMenuView() {
  const userSection = document.getElementById("userSection");

  if (isLoggedIn) {
    userSection.style.display = "block";
  } else {
    userSection.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", updateMenuView);

// Hamburger Menu

function toggleMenu() {
  const menu = document.getElementById("menu");
  const overlay = document.getElementById("overlay");
  const opening = !menu.classList.contains("show");
  menu.classList.toggle("show");
  overlay.classList.toggle("show");
  document.body.style.overflow = opening ? "hidden" : "";
}

function closeMenu() {
  const menu = document.getElementById("menu");
  const overlay = document.getElementById("overlay");
  menu.classList.remove("show");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

document.addEventListener("click", function (event) {
  const menu = document.getElementById("menu");
  const hamburger = document.querySelector(".hamburger");
  const overlay = document.getElementById("overlay");

  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove("show");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
  }
});
document.getElementById("overlay").addEventListener("click", function () {
  document.getElementById("menu").classList.remove("show");
  document.getElementById("overlay").classList.remove("show");
  document.body.style.overflow = "";
});

// Close the hamburger menu whenever a real navigation/action link inside it
// is clicked (page links, anchor jumps like #doctors, register/appointment
// links, logout, etc). The "expandable" cards (Doctors/Patients/Appointments
// toggles) are excluded since clicking them should only expand/collapse.
document.querySelectorAll("#menu a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Search Bar

function toggleSearch() {
  document.getElementById("searchContainer").classList.toggle("active");
  if (document.getElementById("searchContainer").classList.contains("active")) {
    document.getElementById("siteSearchInput").focus();
  }
}

// Close search bar when clicking outside

document.addEventListener("click", function (e) {
  const search = document.getElementById("searchContainer");

  if (!search.contains(e.target)) {
    search.classList.remove("active");
  }
});

// ----- Site FAQ search -----
// Small, deterministic keyword-matched FAQ - no external API needed.
// Each entry's `action` either scrolls to a section on this page
// (type: "scroll") or sends the visitor to another page (type: "link").
const SITE_FAQ = [
  {
    keywords: [
      "book appointment",
      "book a doctor",
      "how to book",
      "make appointment",
      "make an appointment",
      "schedule appointment",
      "schedule a doctor visit",
      "see a doctor",
      "get an appointment",
      "need an appointment",
      "want an appointment",
      "take an appointment",
      "doctor appointment",
      "appointment booking",
      "book now",
      "book doctor appointment",
      "i want to book an appointment",
      "book a visit",
      "visit a doctor",
    ],
    question: "How do I book an appointment?",
    answer:
      "Go to the Doctors section, pick a doctor, and click Book Now - or use the Book Appointment page directly to choose from every doctor.",
    action: {
      type: "link",
      href: "appointment.html",
      label: "Go to Book Appointment",
    },
  },
  {
    keywords: [
      "doctor section",
      "where are doctors",
      "find doctors",
      "our doctors",
      "list of doctors",
      "see doctors",
      "meet our doctors",
    ],
    question: "Where is the doctors section?",
    answer:
      'Scroll down to "Our Expert Doctors", or click Doctors in the top menu.',
    action: { type: "scroll", target: "#doctors", label: "Take me there" },
  },
  {
    keywords: [
      "register patient",
      "sign up patient",
      "create patient account",
      "patient account",
      "new patient",
      "become a patient",
    ],
    question: "How do I register as a patient?",
    answer:
      "Open the patient registration page and fill in your details - you'll be logged in automatically once you're done.",
    action: {
      type: "link",
      href: "register-p.html",
      label: "Go to Patient Registration",
    },
  },
  {
    keywords: [
      "register doctor",
      "sign up doctor",
      "join as doctor",
      "doctor account",
      "create doctor account",
      "become a doctor",
    ],
    question: "How do I register as a doctor?",
    answer:
      "Open the doctor registration page - you'll need your department, specialization, and consultation fee.",
    action: {
      type: "link",
      href: "register.html",
      label: "Go to Doctor Registration",
    },
  },
  {
    keywords: [
      "log in",
      "login",
      "sign in",
      "already have account",
      "access my account",
    ],
    question: "How do I log in?",
    answer:
      "Use the Sign In page with the email and password you registered with. Patients and doctors are redirected to their own dashboard automatically.",
    action: { type: "link", href: "login.html", label: "Go to Sign In" },
  },
  {
    keywords: [
      "contact",
      "support",
      "help",
      "reach you",
      "get in touch",
      "customer service",
      "talk to someone",
    ],
    question: "How do I contact support?",
    answer:
      "Use the Contact Us page to send a message - we'll get back to you within 24 hours. You can also see our phone, email, and address there.",
    action: { type: "link", href: "contact.html", label: "Go to Contact Us" },
  },
  {
    keywords: [
      "demo",
      "request demo",
      "not sure which doctor",
      "what do i need",
      "match me with a doctor",
      "which doctor should i see",
      "symptom",
    ],
    question: 'What is "Request a Demo"?',
    answer:
      "Describe your symptom or need and we'll match you with a real doctor from the right department, with a suggested date and time.",
    action: {
      type: "link",
      href: "request-demo.html",
      label: "Go to Request a Demo",
    },
  },
  {
    keywords: [
      "payment",
      "pay",
      "how to pay",
      "payment method",
      "upi",
      "card payment",
      "cash payment",
      "online payment",
      "how do i pay",
    ],
    question: "What payment methods are supported?",
    answer:
      "You can pay cash at the hospital during your visit, or pay online (UPI/Card, simulated for this project) right when you book.",
  },
  {
    keywords: [
      "bill",
      "bills",
      "invoice",
      "how much does it cost",
      "consultation fee amount",
      "billing",
      "my bills",
      "unpaid bill",
      "pending bill",
    ],
    question: "Where do I see my bills?",
    answer:
      'Log in and open your Patient Dashboard - the "Payments & Bills" card shows every bill and lets you pay any that are still pending.',
    action: { type: "link", href: "patient.html", label: "Go to my dashboard" },
  },
  {
    keywords: [
      "prescription",
      "medication",
      "medicine",
      "what did the doctor prescribe",
      "my medicines",
    ],
    question: "Where do I see my prescriptions?",
    answer:
      'Your Patient Dashboard has a "Recent Prescriptions" card listing everything a doctor has prescribed you.',
    action: { type: "link", href: "patient.html", label: "Go to my dashboard" },
  },
  {
    // Deliberately specific phrasing here (not bare "my appointment", which
    // is genuinely ambiguous with booking intent) - these only fire for
    // someone clearly asking about an appointment they already have.
    keywords: [
      "my upcoming appointment",
      "when is my appointment",
      "check my appointment status",
      "see my booked appointment",
      "status of my appointment",
      "my appointment history",
    ],
    question: "How do I see my upcoming appointments?",
    answer:
      "Your Patient Dashboard highlights your next appointment at the top, with the full list below it.",
    action: { type: "link", href: "patient.html", label: "Go to my dashboard" },
  },
  {
    keywords: ["emergency", "urgent", "ambulance", "emergency contact"],
    question: "What if it's an emergency?",
    answer:
      "Use the Emergency page for urgent situations and emergency contact details.",
    action: { type: "link", href: "emergency.html", label: "Go to Emergency" },
  },
  {
    keywords: [
      "cancel appointment",
      "reschedule",
      "change appointment",
      "cancel my booking",
    ],
    question: "Can I cancel or reschedule an appointment?",
    answer:
      "This isn't self-service yet - contact us and we'll help you reschedule or cancel.",
    action: { type: "link", href: "contact.html", label: "Go to Contact Us" },
  },
  {
    keywords: [
      "department",
      "specialization",
      "specialist",
      "cardiologist",
      "dermatologist",
      "which doctor department",
      "find a specialist",
    ],
    question: "How do I find a doctor in a specific department?",
    answer:
      "On the Book Appointment page, every real doctor is listed with their department - or describe your need on Request a Demo and we'll match you automatically.",
    action: {
      type: "link",
      href: "appointment.html",
      label: "Go to Book Appointment",
    },
  },
];

const SEARCH_STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "i",
  "to",
  "is",
  "do",
  "does",
  "my",
  "me",
  "you",
  "your",
  "of",
  "for",
  "in",
  "on",
  "at",
  "with",
  "and",
  "or",
  "please",
  "can",
  "how",
  "what",
  "where",
  "when",
  "want",
  "need",
  "would",
  "like",
  "it",
  "its",
  "im",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !SEARCH_STOPWORDS.has(w));
}

// Precompute a token set per entry once, from every keyword + the question
// itself, so matching isn't limited to exact keyword phrases.
SITE_FAQ.forEach((entry) => {
  const allText = entry.keywords.join(" ") + " " + entry.question;
  entry._tokens = new Set(tokenize(allText));
});

function searchFAQ(query) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];

  const scored = SITE_FAQ.map((entry) => {
    let score = 0;
    queryTokens.forEach((qt) => {
      if (entry._tokens.has(qt)) {
        score += 3; // whole word matches
      } else {
        // partial credit for a token the user is still mid-typing
        // (e.g. "appoint" while typing "appointment")
        for (const et of entry._tokens) {
          if (
            et.length >= 4 &&
            qt.length >= 4 &&
            (et.startsWith(qt) || qt.startsWith(et))
          ) {
            score += 1.5;
            break;
          }
        }
      }
    });
    // Small bonus the closer the match covers the whole query, so a
    // 2-word exact phrase match outranks a 1-word partial overlap.
    if (score > 0) score += (score / queryTokens.length) * 0.1;
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => s.entry);
}

function runFAQAction(action) {
  if (!action) return;
  if (action.type === "link") {
    window.location.href = action.href;
  } else if (action.type === "scroll") {
    document.getElementById("searchContainer").classList.remove("active");
    document
      .querySelector(action.target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderSearchResults(results) {
  const box = document.getElementById("searchResults");
  if (!results.length) {
    box.innerHTML =
      '<div class="search-result-empty">No answer found - try "book appointment", "doctors", or "contact".</div>';
    box.classList.add("has-results");
    return;
  }
  box.innerHTML = results
    .map(
      (r, i) => `
      <div class="search-result-item" data-idx="${i}">
        <div class="sr-question">${r.question}</div>
        <div class="sr-answer">${r.answer}</div>
        ${r.action ? `<div class="sr-action">${r.action.label} →</div>` : ""}
      </div>`,
    )
    .join("");
  box.classList.add("has-results");

  box.querySelectorAll(".search-result-item").forEach((el) => {
    el.addEventListener("click", () =>
      runFAQAction(results[Number(el.dataset.idx)].action),
    );
  });
}

const siteSearchInput = document.getElementById("siteSearchInput");
if (siteSearchInput) {
  let searchDebounceTimer = null;

  siteSearchInput.addEventListener("input", () => {
    clearTimeout(searchDebounceTimer);
    const value = siteSearchInput.value;
    if (!value.trim()) {
      document.getElementById("searchResults").classList.remove("has-results");
      return;
    }
    // Wait for a short pause in typing before showing results, instead of
    // re-searching on every single keystroke.
    searchDebounceTimer = setTimeout(() => {
      renderSearchResults(searchFAQ(value));
    }, 350);
  });

  siteSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      clearTimeout(searchDebounceTimer);
      const results = searchFAQ(siteSearchInput.value);
      if (results.length) runFAQAction(results[0].action);
    }
  });
}

// const accordions = document.querySelectorAll(".accordion");

// accordions.forEach((accordion) => {
//   accordion.addEventListener("click", () => {
//     accordion.classList.toggle("active");

//     const panel = accordion.nextElementSibling;

//     if (panel.style.maxHeight) {
//       panel.style.maxHeight = null;
//     } else {
//       panel.style.maxHeight = panel.scrollHeight + "px";
//     }
//   });
// });
// solution section
const cards = document.querySelectorAll(".solution-card");

cards.forEach((card) => {
  const btn = card.querySelector(".accordion");
  const panel = card.querySelector(".panel");
  cards.forEach((card) => {
    const btn = card.querySelector(".accordion");
    const panel = card.querySelector(".panel");
    const closeBtn = panel.querySelector(".panel-close");

    btn.addEventListener("click", () => {
      const isActive = btn.classList.contains("active");

      cards.forEach((c) => {
        const b = c.querySelector(".accordion");
        const p = c.querySelector(".panel");
        b.classList.remove("active");
        p.classList.remove("open");
        p.style.maxHeight = null;
        c.classList.remove("expanded");
      });

      if (!isActive) {
        btn.classList.add("active");
        panel.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        card.classList.add("expanded");
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        btn.classList.remove("active");
        panel.classList.remove("open");
        panel.style.maxHeight = null;
        card.classList.remove("expanded");
      });
    }
  });

  btn.addEventListener("click", () => {
    const isActive = btn.classList.contains("active");

    // Close every card first
    cards.forEach((c) => {
      const b = c.querySelector(".accordion");
      const p = c.querySelector(".panel");
      b.classList.remove("active");
      p.classList.remove("open");
      p.style.maxHeight = null;
      c.classList.remove("expanded");
    });

    // Reopen the clicked one only if it wasn't already open
    if (!isActive) {
      btn.classList.add("active");
      panel.classList.add("open");
      panel.style.maxHeight = panel.scrollHeight + "px";
      card.classList.add("expanded");
    }
  });
});
// service section
// ----- Booking Modal -----
const serviceData = {
  "Full Body Checkup": {
    subtitle: "Comprehensive Health Screening Package",
    includes: [
      "Blood Tests",
      "Urine Analysis",
      "ECG & X-Ray",
      "Doctor Consultation",
    ],
    packages: ["Basic Checkup", "Standard Checkup", "Premium Checkup"],
    about:
      "A comprehensive screening covering blood work, imaging, and a full consultation to give a complete picture of your overall health.",
    price: 1500,
    instructions: [
      "Fast for 8-10 hours before the test.",
      "Drink plenty of water beforehand.",
      "Wear comfortable clothing.",
    ],
  },
  "Imaging and Radiology": {
    subtitle: "Advanced Diagnostic Imaging Services",
    includes: ["X-Ray", "MRI Scan", "CT Scan", "Radiologist Report"],
    packages: ["X-Ray Package", "MRI Package", "CT Scan Package"],
    about:
      "High-resolution imaging services to help diagnose internal conditions with detailed radiologist review.",
    price: 2200,
    instructions: [
      "Remove metal jewelry and accessories.",
      "Inform staff of any implants beforehand.",
    ],
  },
  "Heart Related": {
    subtitle: "Complete Cardiac Care Package",
    includes: [
      "ECG",
      "Echo Cardiogram",
      "Lipid Profile",
      "Cardiologist Consultation",
    ],
    packages: ["Basic Cardiac Checkup", "Advanced Cardiac Package"],
    about:
      "Screens for cardiovascular conditions through ECG, echo imaging, and a full lipid profile review.",
    price: 1800,
    instructions: [
      "Avoid caffeine 1 hour before.",
      "Relax for 10 minutes before the test.",
    ],
  },
  "Brain Related": {
    subtitle: "Neurological Health Screening",
    includes: [
      "MRI Brain",
      "EEG",
      "Neurologist Consultation",
      "Cognitive Assessment",
    ],
    packages: ["Basic Neuro Package", "Advanced Neuro Package"],
    about:
      "Evaluates brain and nervous system health through imaging and cognitive assessment.",
    price: 2500,
    instructions: [
      "Get a full night's sleep before the test.",
      "Avoid alcohol for 24 hours prior.",
    ],
  },
  "Stomach Related": {
    subtitle: "Digestive Health Screening",
    includes: [
      "Endoscopy",
      "Ultrasound Abdomen",
      "Liver Function Test",
      "Gastroenterologist Consultation",
    ],
    packages: ["Basic Gastro Package", "Advanced Gastro Package"],
    about:
      "Assesses digestive tract and liver health through endoscopy and imaging.",
    price: 2000,
    instructions: [
      "Fast for 6 hours before the test.",
      "Avoid heavy meals the night before.",
    ],
  },
  "Surgical Services": {
    subtitle: "Pre & Post Surgical Care Package",
    includes: [
      "Pre-Op Assessment",
      "Surgeon Consultation",
      "Anesthesia Review",
      "Post-Op Care Plan",
    ],
    packages: ["Minor Surgery Package", "Major Surgery Package"],
    about:
      "Comprehensive pre- and post-operative care coordinated with your surgical team.",
    price: 3000,
    instructions: [
      "Bring prior medical records.",
      "Arrange for someone to accompany you.",
    ],
  },
  "Eye Related": {
    subtitle: "Complete Eye Care Package",
    includes: [
      "Vision Test",
      "Retina Scan",
      "Eye Pressure Test",
      "Ophthalmologist Consultation",
    ],
    packages: ["Basic Eye Checkup", "Advanced Eye Package"],
    about:
      "Full eye examination covering vision clarity, retina health, and eye pressure screening.",
    price: 900,
    instructions: [
      "Avoid wearing contact lenses on the test day.",
      "Bring sunglasses for after your visit.",
    ],
  },
};

let currentServiceKey = "";

// (keep your existing bookingOverlay, bookingClose, bookingServiceName, etc. references)
const bookingCard = document.querySelector(".booking-card");
const bookingSummary = document.getElementById("bookingSummary");
const summaryClose = document.getElementById("summaryClose");
const confirmBookingBtn = document.getElementById("confirmBookingBtn");
const editDetailsBtn = document.getElementById("editDetailsBtn");

document.querySelectorAll(".service-card").forEach((card) => {
  const btn = card.querySelector("button");
  const title = card.querySelector("h3").textContent.trim();

  btn.addEventListener("click", () => {
    const data = serviceData[title];
    if (!data) return;

    currentServiceKey = title;

    bookingServiceName.textContent = title;
    bookingSubtitle.textContent = data.subtitle;

    bookingIncludesList.innerHTML = data.includes
      .map(
        (item) =>
          `<li><span class="material-symbols-outlined">check_circle</span> ${item}</li>`,
      )
      .join("");

    bookingPackageSelect.innerHTML =
      `<option value="" disabled selected>Select Package</option>` +
      data.packages.map((pkg) => `<option>${pkg}</option>`).join("");

    bookingCard.style.display = "grid";
    bookingSummary.classList.remove("active");
    bookingOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });
});

// Form submit → show summary instead of alert
let lastServiceBooking = null;
bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = serviceData[currentServiceKey];

  const name = document.getElementById("fieldName").value.trim();
  const phone = document.getElementById("fieldPhone").value.trim();
  const email = document.getElementById("fieldEmail").value.trim();
  const age = document.getElementById("fieldAge").value.trim();
  const gender = document.getElementById("fieldGender").value;
  const date = document.getElementById("fieldDate").value;
  const time = document.getElementById("fieldTime").value;

  lastServiceBooking = { name, phone, email, date, time };

  document.getElementById("summaryServiceName").textContent = currentServiceKey;
  document.getElementById("summaryAbout").textContent = data.about;
  document.getElementById("summaryPrice").textContent = `₹ ${data.price}`;

  document.getElementById("summaryInstructions").innerHTML = data.instructions
    .map((i) => `<li>${i}</li>`)
    .join("");

  document.getElementById("sumName").textContent = name || "Not filled";
  document.getElementById("sumMobile").textContent = phone || "Not filled";
  document.getElementById("sumAge").textContent = age || "Not filled";
  document.getElementById("sumGender").textContent = gender || "Not filled";
  document.getElementById("sumDate").textContent = date || "Not filled";
  document.getElementById("sumTime").textContent = time || "Not selected";
  document.getElementById("sumPriceText").textContent = `₹${data.price}`;

  bookingCard.style.display = "none";
  bookingSummary.classList.add("active");
});

editDetailsBtn.addEventListener("click", () => {
  bookingSummary.classList.remove("active");
  bookingCard.style.display = "grid";
});

confirmBookingBtn.addEventListener("click", () => {
  // This modal books a service package rather than a specific doctor, and
  // the cards here are marketing content, not records from the database.
  // Payment happens on the dedicated UPI/QR payment page, which also
  // checks (and reserves) the date+time slot so two people can't book the
  // same service at the same date and time.
  const data = serviceData[currentServiceKey];
  const amount = data ? data.price : 0;
  closeBooking();
  const params = new URLSearchParams();
  params.set("mode", "service");
  params.set("item", currentServiceKey);
  params.set("amount", amount);
  if (lastServiceBooking) {
    params.set("date", lastServiceBooking.date);
    params.set("time", lastServiceBooking.time);
    params.set("guestName", lastServiceBooking.name);
    params.set("guestPhone", lastServiceBooking.phone);
    params.set("guestEmail", lastServiceBooking.email);
  }
  window.location.href = "payment.html?" + params.toString();
});

function closeBooking() {
  bookingOverlay.classList.remove("active");
  bookingCard.style.display = "grid";
  bookingSummary.classList.remove("active");
  document.body.style.overflow = "";
}

bookingClose.addEventListener("click", closeBooking);
summaryClose.addEventListener("click", closeBooking);
const doctorTrack = document.getElementById("doctorTrack");
let doctorCards = doctorTrack
  ? doctorTrack.querySelectorAll(".doctor-card")
  : [];

let totalCards = doctorCards.length;
let currentIndex = 0;

// Re-reads the current .doctor-card elements from the DOM. Needed because
// the cards are no longer static HTML - they're rendered at runtime from
// real doctor records (see loadRealDoctors below), so the slider's
// bookkeeping has to be refreshed once that render happens.
function refreshDoctorCardsCache() {
  doctorCards = doctorTrack ? doctorTrack.querySelectorAll(".doctor-card") : [];
  totalCards = doctorCards.length;
  currentIndex = 0;
}

function getSliderMetrics() {
  const wrapper = document.querySelector(".slider-wrapper");
  const firstCard = doctorCards[0];

  if (!wrapper || !firstCard) {
    return { step: 0, visibleCards: 1 };
  }

  const gap = parseFloat(window.getComputedStyle(doctorTrack).gap) || 0;
  const cardWidth = firstCard.getBoundingClientRect().width;
  const visibleCards = Math.max(
    1,
    Math.floor((wrapper.clientWidth + gap) / (cardWidth + gap)),
  );

  return {
    step: cardWidth + gap,
    visibleCards,
  };
}

function applySliderPosition() {
  const { step } = getSliderMetrics();
  doctorTrack.style.transform = `translate3d(-${currentIndex * step}px, 0, 0)`;
}

function moveRight() {
  if (!doctorTrack) return;

  const { visibleCards } = getSliderMetrics();
  const maxIndex = Math.max(0, totalCards - visibleCards);

  currentIndex = Math.min(currentIndex + 1, maxIndex);
  applySliderPosition();
}

function moveLeft() {
  if (!doctorTrack) return;

  currentIndex = Math.max(currentIndex - 1, 0);
  applySliderPosition();
}

window.addEventListener("resize", () => {
  if (!doctorTrack) return;

  const { visibleCards } = getSliderMetrics();
  currentIndex = Math.min(currentIndex, Math.max(0, totalCards - visibleCards));

  applySliderPosition();
});

// Re-clamp and reposition on resize so the slider never overflows
window.addEventListener("resize", () => {
  if (!doctorTrack) return;
  const { visibleCards } = getSliderMetrics();
  const maxIndex = Math.max(0, totalCards - visibleCards);

  if (currentIndex > maxIndex) {
    currentIndex = maxIndex;
  }
  applySliderPosition();
});

// ----- Doctor Profile / Appointment Page -----
// Real doctor data is fetched from the backend (see loadRealDoctors below)
// and attached directly to each card, so there's no lookup table of fake
// marketing stats here anymore.

const doctorProfileOverlay = document.getElementById("doctorProfileOverlay");
// const doctorBackBtn = document.getElementById("doctorBackBtn");
doctorBackBtn.addEventListener("click", () => {
  doctorProfileOverlay.classList.remove("active");
  document.body.style.overflow = "";

  document.getElementById("doctors").scrollIntoView({ behavior: "smooth" });
});
const datePills = document.getElementById("datePills");
const timeSlotsMsg = document.getElementById("timeSlotsMsg");
const timeSlotsContainer = document.getElementById("timeSlotsContainer");
const confirmDoctorBookingBtn = document.getElementById(
  "confirmDoctorBookingBtn",
);

let selectedDate = null;
let selectedTime = null;
let currentDoctorName = "";
let currentDoctorFee = 0;
let currentDoctorId = null;

function getUpcomingDates(count) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dates = [];
  let offset = 1;
  while (dates.length < count) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    dates.push({
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()],
      label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    });
    offset += 2;
  }
  return dates;
}

function renderDatePills() {
  const dates = getUpcomingDates(5);
  datePills.innerHTML = dates
    .map(
      (d) =>
        `<div class="date-pill" data-label="${d.label}">
          <span>${d.dayName}</span><strong>${d.dayNum}</strong><span>${d.month}</span>
        </div>`,
    )
    .join("");

  datePills.querySelectorAll(".date-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      datePills
        .querySelectorAll(".date-pill")
        .forEach((p) => p.classList.remove("selected"));
      pill.classList.add("selected");
      selectedDate = pill.dataset.label;
      document.getElementById("sumSelectedDate").textContent = selectedDate;
      renderTimeSlots();
    });
  });
}

async function renderTimeSlots() {
  const slots = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];
  timeSlotsMsg.style.display = "none";
  selectedTime = null;
  document.getElementById("sumSelectedTime").textContent = "Not selected";

  timeSlotsContainer.innerHTML = slots
    .map(
      (t) =>
        `<button type="button" class="time-slot-btn" data-time="${t}">${t}</button>`,
    )
    .join("");

  // Grey out slots that are already booked for this doctor on this date,
  // so a person can see it's taken before even trying to pick it.
  let bookedSlots = [];
  if (currentDoctorId && selectedDate) {
    try {
      const result = await getBookedDoctorSlots(currentDoctorId, selectedDate);
      bookedSlots = result.data || [];
    } catch (e) {
      // If the availability check fails, don't block the person from
      // trying - the booking itself is still protected server-side.
    }
  }

  timeSlotsContainer.querySelectorAll(".time-slot-btn").forEach((btn) => {
    if (bookedSlots.includes(btn.dataset.time)) {
      btn.classList.add("slot-taken");
      btn.disabled = true;
      btn.title = "Already booked - please choose another time";
      return;
    }
    btn.addEventListener("click", () => {
      timeSlotsContainer
        .querySelectorAll(".time-slot-btn")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedTime = btn.dataset.time;
      document.getElementById("sumSelectedTime").textContent = selectedTime;
    });
  });
}

function openDoctorProfile(doctor) {
  currentDoctorName = doctor.name;
  currentDoctorFee = doctor.fee;
  currentDoctorId = doctor.id;

  document.getElementById("docImage").src = doctor.image;
  document.getElementById("docName").textContent = doctor.name;
  document.getElementById("docSpeciality").textContent = doctor.speciality;
  document.getElementById("docQualifications").textContent =
    doctor.qualifications;
  document.getElementById("docLocation").textContent = doctor.location;
  document.getElementById("docFee").textContent = doctor.fee
    ? `₹${doctor.fee}`
    : "Contact for pricing";
  document.getElementById("docAvailability").textContent = "Available";
  document.getElementById("docSuccess").textContent = doctor.department;
  document.getElementById("docExperience").textContent = doctor.experience;
  document.getElementById("docPatients").textContent = doctor.patients;
  document.getElementById("docAbout").textContent = doctor.about;

  document.getElementById("sumDoctorName").textContent = doctor.name;
  document.getElementById("sumDoctorSpeciality").textContent =
    doctor.speciality;
  document.getElementById("sumSelectedDate").textContent = "Not selected";
  document.getElementById("sumSelectedTime").textContent = "Not selected";
  document.getElementById("sumFee").textContent = doctor.fee
    ? `₹${doctor.fee}`
    : "Contact for pricing";

  selectedDate = null;
  selectedTime = null;

  document.getElementById("patName").value = "";
  document.getElementById("patAge").value = "";
  document.getElementById("patMobile").value = "";
  document.getElementById("patGender").value = "";
  document.getElementById("patEmail").value = "";

  timeSlotsMsg.style.display = "block";
  timeSlotsContainer.innerHTML = "";

  renderDatePills();

  doctorProfileOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
  window.scrollTo(0, 0);
}

function renderDoctorCard(doctor) {
  return `
    <div class="doctor-card">
      <img src="${doctor.image}" alt="" />
      <h3>${doctor.name}</h3>
      <p class="speciality">${doctor.speciality}</p>
      <div class="experience">${doctor.experience}</div>
      <button class="book-btn" data-doctor-id="${doctor.id}">Book Now</button>
    </div>`;
}

// Fetches real doctors from the backend and renders them into the
// homepage carousel, replacing the "Loading doctors…" placeholder.
async function loadRealDoctors() {
  if (!doctorTrack) return;
  try {
    const result = await listDoctors();
    const doctors = result.data.map((d) => ({
      id: d.doctor_id,
      name: "Dr. " + d.first_name + " " + d.last_name,
      speciality: d.specialization || d.department || "General Medicine",
      department: d.department || "General Medicine",
      experience: d.experience_years
        ? `${d.experience_years} Years Experience`
        : "Experience not specified",
      qualifications: d.qualifications || "Not specified",
      location: d.clinic_location || "Casto Healthcare",
      fee: d.consultation_fee || null,
      patients: d.patients_treated || 0,
      about:
        d.bio ||
        `${"Dr. " + d.first_name} sees patients for ${d.department || "general"} care at Casto Healthcare.`,
      image: `https://randomuser.me/api/portraits/${d.gender === "Female" ? "women" : "men"}/${(d.doctor_id % 90) + 1}.jpg`,
    }));

    if (!doctors.length) {
      doctorTrack.innerHTML =
        '<p style="padding: 20px; color: #888;">No doctors registered yet.</p>';
      return;
    }

    doctorTrack.innerHTML = doctors.map(renderDoctorCard).join("");
    refreshDoctorCardsCache();

    doctorTrack.querySelectorAll(".book-btn").forEach((btn) => {
      const doctor = doctors.find((d) => String(d.id) === btn.dataset.doctorId);
      btn.addEventListener("click", () => openDoctorProfile(doctor));
    });
  } catch (err) {
    console.error("Could not load doctors:", err.message);
    doctorTrack.innerHTML =
      '<p style="padding: 20px; color: #888;">Could not load doctors right now.</p>';
  }
}

loadRealDoctors();

doctorBackBtn.addEventListener("click", () => {
  doctorProfileOverlay.classList.remove("active");
  document.body.style.overflow = "";
});

// Payment method is now chosen on the dedicated UPI/QR payment page
// (payment.html), not in this preview overlay.

confirmDoctorBookingBtn.addEventListener("click", () => {
  // Payment now happens on a dedicated UPI/QR payment page, which also
  // makes the real booking call once the person confirms they've paid -
  // so this just hands off doctor + date + time to that page.
  if (!selectedDate || !selectedTime) {
    alert("Please select a date and time slot first.");
    return;
  }

  doctorProfileOverlay.classList.remove("active");
  document.body.style.overflow = "";

  const dateObj = new Date(selectedDate + "T00:00:00");
  const dateLabel = dateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const params = new URLSearchParams();
  params.set("mode", "doctor");
  if (currentDoctorId) params.set("doctorId", currentDoctorId);
  params.set("doctorName", currentDoctorName || "");
  params.set(
    "speciality",
    document.getElementById("docSpeciality")?.textContent || "",
  );
  params.set("fee", currentDoctorFee || "");
  params.set("date", selectedDate);
  params.set("dateLabel", dateLabel);
  params.set("time", selectedTime);
  window.location.href = "payment.html?" + params.toString();
});

// Duplicate badges for seamless infinite scroll
const badgeTrack = document.getElementById("scrollTrack");

if (badgeTrack) {
  const original = badgeTrack.innerHTML;
  badgeTrack.innerHTML = original + original;
}

// Back to top button
const backToTopBtn = document.getElementById("backToTop");

if (backToTopBtn) {
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal , .reveal2");

  function reveal() {
    reveals.forEach((element, index) => {
      if (element.classList.contains("active")) return;

      const windowHeight = window.innerHeight;
      const elementTop = element.getBoundingClientRect().top;

      if (elementTop < windowHeight - 50) {
        setTimeout(() => {
          element.classList.add("active");
        }, index * 150);
      }
    });
  }

  window.addEventListener("scroll", reveal);
  reveal();
});
function toggleCard(element) {
  const content = element.nextElementSibling;
  content.classList.toggle("active");
}

//  Diagnose AI widget functions
// Emergency situations this tool should recognize and respond to
// immediately with real guidance, instead of running the regular
// (keyword-matched, non-diagnostic) symptom flow below.
const EMERGENCY_PATTERNS = [
  {
    keywords: [
      "cpr",
      "not breathing",
      "stopped breathing",
      "no pulse",
      "cardiac arrest",
      "unresponsive",
      "unconscious and not breathing",
    ],
    title: "This sounds like it could be cardiac arrest",
    steps: [
      "Call emergency services (112) right now, or have someone else call while you help.",
      "Check responsiveness - tap firmly and shout. Check if they're breathing normally.",
      "If not breathing normally: lay them on their back on a firm, flat surface.",
      "Kneel beside them, place the heel of one hand on the center of the chest, other hand on top.",
      "Push hard and fast - about 5-6 cm deep, at 100-120 compressions per minute.",
      "Let the chest fully rise between compressions. Continue until help arrives or an AED is available.",
    ],
  },
  {
    keywords: [
      "choking",
      "can't breathe",
      "something stuck in throat",
      "swallowed wrong",
    ],
    title: "This sounds like choking",
    steps: [
      "If they can cough or speak, encourage them to keep coughing - don't intervene yet.",
      "If they can't breathe, cough, or speak: call emergency services (112) immediately.",
      "Stand behind them, lean them forward, and give 5 firm back blows between the shoulder blades.",
      "If that doesn't work, give 5 abdominal thrusts (Heimlich maneuver): fist above the navel, grasp with your other hand, pull sharply inward and upward.",
      "Alternate 5 back blows and 5 abdominal thrusts until the object is dislodged or help arrives.",
    ],
  },
  {
    keywords: [
      "heart attack",
      "chest pain radiating",
      "crushing chest pain",
      "chest pain and arm",
    ],
    title: "This could be a heart attack",
    steps: [
      "Call emergency services (112) immediately - don't try to drive yourself.",
      "Have the person sit down, stay calm, and loosen tight clothing.",
      "Do not give food or drink.",
      "If they have prescribed nitroglycerin, help them take it as directed.",
      "Stay with them and be ready to start CPR if they become unresponsive and stop breathing normally.",
    ],
  },
  {
    keywords: [
      "stroke",
      "face drooping",
      "slurred speech",
      "sudden numbness",
      "sudden confusion one side",
    ],
    title: "This could be a stroke - remember FAST",
    steps: [
      "Face: ask them to smile - does one side droop?",
      "Arms: ask them to raise both arms - does one drift downward?",
      "Speech: ask them to repeat a phrase - is it slurred or strange?",
      "Time: if you see any of these signs, call emergency services (112) immediately and note when symptoms started.",
      "Do not give food, drink, or medication while waiting for help.",
    ],
  },
  {
    keywords: [
      "severe bleeding",
      "won't stop bleeding",
      "bleeding heavily",
      "deep cut bleeding",
    ],
    title: "This sounds like severe bleeding",
    steps: [
      "Call emergency services (112) if bleeding is heavy or won't stop.",
      "Apply firm, direct pressure on the wound with a clean cloth.",
      "Keep the wound elevated above heart level if possible.",
      "Don't remove the cloth if it soaks through - add more on top and keep pressing.",
      "Keep the person warm and still until help arrives.",
    ],
  },
  {
    keywords: [
      "appendix",
      "appendicitis",
      "lower right abdomen",
      "right side stomach pain and fever",
      "pain moved to lower right",
    ],
    title: "This could be appendicitis - a surgical emergency",
    steps: [
      "Call emergency services (112) or go to the nearest emergency room now - this isn't something to wait out at home.",
      "Don't eat, drink, take a painkiller, laxative, or antacid - it can hide symptoms and complicate diagnosis.",
      "Note when the pain started and whether it has moved from around the belly button to the lower right side of the abdomen.",
      "Mention to the doctor if the pain gets worse when you cough, walk, or press on that area, or if you also have fever or vomiting.",
      "This usually needs same-day evaluation and often surgery - home remedies or OTC medicine won't treat it.",
    ],
  },
  {
    keywords: [
      "blood in vomit",
      "vomiting blood",
      "black stool",
      "blood in stool",
      "tarry stool",
      "coughing up blood",
    ],
    title: "This could be internal bleeding - seek emergency care now",
    steps: [
      "Call emergency services (112) or go to the nearest emergency room immediately.",
      "Don't eat or drink anything until you've been seen.",
      "Lie down and stay as still as possible.",
      "If you feel faint, dizzy, or notice your heart racing, that can mean significant blood loss - tell responders right away.",
      "Bring a list of any medicines you take, especially blood thinners, aspirin, or NSAIDs like ibuprofen, to show the doctor.",
    ],
  },
];

const CRISIS_KEYWORDS = [
  "suicide",
  "want to die",
  "kill myself",
  "end my life",
  "self harm",
  "hurt myself",
];

// ---------------------------------------------------------------------
// Rule-based symptom -> condition matching, ordered most-specific-first.
// Each profile only fires on a distinct combination of symptom keywords,
// so different descriptions of "stomach pain" land on different, more
// useful answers instead of one generic result. Medicines are named the
// way you'd actually find them on an Indian pharmacy shelf or on
// 1mg/PharmEasy/Netmeds - brand name first, with the generic in
// brackets. Anything that legally needs a doctor's prescription in
// India (antibiotics, prescription-strength eye drops, etc.) is called
// out as such instead of a self-medicating dose.
// ---------------------------------------------------------------------
const DISEASE_PROFILES = [
  // ---------------- Respiratory ----------------
  {
    name: "Acute Bronchospasm / Asthma Flare-up",
    match: (l) =>
      l.includes("wheeze") ||
      l.includes("wheezing") ||
      l.includes("whistling") ||
      l.includes("chest tight") ||
      (l.includes("breath") && (l.includes("short") || l.includes("difficult") || l.includes("hard to"))),
    doctor: "Pulmonologist",
    urgency: "Moderate - see a doctor within 2-3 days, sooner if it's getting worse",
    medicines: [
      { name: "Asthalin Inhaler (Salbutamol/Albuterol) - Cipla", use: "2 puffs via inhaler when breathless, repeat after 4-6 hrs if needed" },
      { name: "Foracort / Duolin (if already prescribed before)", use: "Only continue if a doctor has prescribed this to you previously" },
    ],
    eat: ["Warm fluids like turmeric milk or ginger tea", "Light, easily digestible meals", "Foods rich in Vitamin C (amla, citrus fruits)"],
    avoid: ["Cold drinks and ice cream", "Dust, smoke, strong perfumes, and other known triggers", "Overexertion until breathing settles"],
    note: "If lips or fingertips turn bluish, or the inhaler isn't helping, treat this as an emergency and go to a hospital immediately.",
  },
  {
    name: "Migraine with Aura",
    match: (l) =>
      l.includes("headache") && (l.includes("light") || l.includes("aura") || l.includes("nausea") || l.includes("vomit") || l.includes("throb")),
    doctor: "Neurologist",
    urgency: "Routine - book within a week, sooner if this is your worst-ever headache",
    medicines: [
      { name: "Suminat (Sumatriptan) 50mg", use: "One tablet at the very first sign of aura/headache - prescription medicine, needs a doctor to confirm migraine first" },
      { name: "Naproxen (Naprosyn) or Ibuprofen (Combiflam)", use: "For milder attacks, as directed on the pack" },
    ],
    eat: ["Stay hydrated with plain water or ORS", "Small, regular meals - don't skip meals", "Foods rich in magnesium like bananas and nuts"],
    avoid: ["Bright screens/lights and loud noise during an attack", "Caffeine withdrawal or excess caffeine", "Common triggers: chocolate, aged cheese, alcohol, poor sleep"],
    note: "A sudden 'worst headache of your life', or a headache with fever and neck stiffness, needs emergency evaluation - don't self-treat that.",
  },
  {
    name: "Tension-type Headache",
    match: (l) => l.includes("headache") || l.includes("head pain") || l.includes("head ache"),
    doctor: "General Physician",
    urgency: "Routine - usually settles with rest and OTC medicine",
    medicines: [
      { name: "Dolo 650 / Crocin (Paracetamol 650mg)", use: "One tablet every 6-8 hours as needed, max 3-4 tablets/day" },
      { name: "Saridon (if Dolo doesn't help)", use: "As per pack instructions, don't combine with other painkillers" },
    ],
    eat: ["Plenty of water - dehydration is a common trigger", "Regular meals, don't skip breakfast", "A short nap or good night's sleep"],
    avoid: ["Excess screen time without breaks", "Skipping meals or poor sleep", "Overusing painkillers more than 2-3 days a week"],
  },
  {
    name: "Viral Fever / Influenza",
    match: (l) => l.includes("fever") && (l.includes("body ache") || l.includes("cough") || l.includes("chills") || l.includes("fatigue") || l.includes("weak")),
    doctor: "General Physician",
    urgency: "Routine home care, see a doctor if it doesn't improve in 3 days",
    medicines: [
      { name: "Dolo 650 / Crocin (Paracetamol)", use: "500-650mg every 6-8 hours for fever/body ache" },
      { name: "Electral / ORS", use: "1 sachet in water through the day to stay hydrated" },
    ],
    eat: ["Warm soups, khichdi, and easily digestible food", "Plenty of fluids - water, coconut water, ORS", "Rest as much as possible"],
    avoid: ["Cold food/drinks", "Skipping fluids", "Going to work/school while contagious"],
    note: "See a doctor promptly if fever crosses 103°F, lasts beyond 3 days, or you have breathing difficulty, chest pain, or a rash.",
  },
  {
    name: "Common Cold",
    match: (l) => (l.includes("runny nose") || l.includes("blocked nose") || l.includes("sneez") || l.includes("stuffy nose")) && !l.includes("fever"),
    doctor: "General Physician (usually self-care)",
    urgency: "Mild - typically clears in 5-7 days on its own",
    medicines: [
      { name: "Cetirizine (Cetzine / Alerid) 10mg", use: "One tablet at night for runny nose/sneezing" },
      { name: "Vicks Vaporub / Vicks Inhaler", use: "Apply on chest/under nose, or steam inhalation twice a day" },
    ],
    eat: ["Warm fluids - ginger tea, soup, turmeric milk", "Vitamin C rich fruits", "Honey with warm water (not for infants)"],
    avoid: ["Cold drinks, ice cream, and AC drafts directly on you", "Smoking or smoky environments"],
  },
  {
    name: "Sore Throat / Tonsillitis",
    match: (l) => (l.includes("sore throat") || l.includes("throat pain") || l.includes("difficulty swallowing") || l.includes("scratchy throat")),
    doctor: "ENT Specialist / General Physician",
    urgency: "Routine, see a doctor if white patches/pus or high fever appear",
    medicines: [
      { name: "Strepsils / Vicks lozenges", use: "Suck one lozenge every 3-4 hours for relief" },
      { name: "Warm salt-water gargle", use: "3-4 times a day - genuinely effective, not just a home remedy myth" },
      { name: "Paracetamol (Dolo 650)", use: "For pain/fever, as needed" },
    ],
    eat: ["Warm soups and liquids", "Honey in warm water"],
    avoid: ["Cold or spicy food", "Smoking, shouting, or straining the voice"],
    note: "White/yellow patches on the tonsils or a fever over 101°F can mean a bacterial infection needing prescription antibiotics (like Augmentin) - that requires a doctor's visit, not self-medication.",
  },
  {
    name: "Sinusitis",
    match: (l) => l.includes("sinus") || (l.includes("facial pain") || l.includes("face pain")) || (l.includes("nose") && (l.includes("thick") || l.includes("yellow") || l.includes("green"))),
    doctor: "ENT Specialist",
    urgency: "Routine - see a doctor if it lasts beyond 10 days",
    medicines: [
      { name: "Sinarest / Cheston Cold", use: "As per pack directions for congestion and facial pain" },
      { name: "Otrivin nasal drops", use: "Only for 3-5 days max - longer use can worsen congestion (rebound effect)" },
    ],
    eat: ["Steam inhalation with a few drops of eucalyptus oil, twice daily", "Warm fluids"],
    avoid: ["Using decongestant nasal drops for more than 5 days straight", "Cold, dusty environments"],
  },

  // ---------------- Stomach & Digestive (distinct, not one bucket) ----------------
  {
    name: "Irritable Bowel Syndrome (IBS)",
    match: (l) => l.includes("ibs") || (l.includes("stress") && (l.includes("stomach") || l.includes("bowel") || l.includes("gut"))),
    doctor: "Gastroenterologist",
    urgency: "Routine - a proper diagnosis needs a doctor visit, symptoms are manageable",
    medicines: [
      { name: "Meftal Spas (Mefenamic acid + Dicyclomine)", use: "For cramping pain, as directed - don't use long-term without a doctor's advice" },
      { name: "Probiotics (Sporlac / VSL#3)", use: "Daily, can help regulate bowel patterns over a few weeks" },
    ],
    eat: ["A food diary to identify your personal trigger foods", "Regular meal timings", "Adequate water and gentle physical activity"],
    avoid: ["Caffeine, alcohol, and very spicy/fried food", "Sudden large meals", "High stress without any outlet - this genuinely worsens IBS"],
  },
  {
    name: "Food Poisoning / Acute Gastroenteritis",
    match: (l) =>
      l.includes("food poisoning") ||
      l.includes("street food") ||
      l.includes("outside food") ||
      (l.includes("junk food") && (l.includes("vomit") || l.includes("stomach") || l.includes("nause"))) ||
      l.includes("loose motion") ||
      l.includes("diarrhea") ||
      l.includes("diarrhoea") ||
      l.includes("vomit") ||
      l.includes("throwing up"),
    doctor: "Gastroenterologist / General Physician",
    urgency: "Moderate - most settle in 24-48 hrs with home care, but dehydration can escalate fast",
    medicines: [
      { name: "Electral / ORS-L", use: "Sip through the day to replace lost fluids - the single most important thing to do" },
      { name: "Domstal (Domperidone 10mg)", use: "For nausea/vomiting, before meals as directed" },
      { name: "Sporlac / Enterogermina (probiotic)", use: "Helps restore gut bacteria after diarrhea" },
      { name: "Eldoperm (Loperamide)", use: "Only for diarrhea WITHOUT fever or blood in stool - skip this if either is present" },
    ],
    eat: ["BRAT diet: banana, rice (rice water/kanji), applesauce, toast", "Buttermilk (chaas) with a pinch of salt and roasted cumin", "Small, frequent sips of ORS/water"],
    avoid: ["Dairy (except curd/buttermilk), oily and spicy food", "Outside/street food until fully recovered", "Anti-diarrheal medicine if there's fever or blood in stool"],
    note: "See a doctor the same day if: fever above 101°F, blood in vomit/stool, signs of dehydration (very little urine, dizziness, dry mouth), or symptoms lasting beyond 2 days.",
  },
  {
    name: "Bloating / Gas / Indigestion",
    match: (l) =>
      l.includes("bloat") ||
      l.includes("balloon") ||
      /\bgas\b/.test(l) ||
      l.includes("distend") ||
      l.includes("belch") ||
      l.includes("flatulence") ||
      l.includes("full feeling") ||
      l.includes("indigestion"),
    doctor: "General Physician (Gastroenterologist if it keeps recurring)",
    urgency: "Mild - usually settles within hours with an antacid",
    medicines: [
      { name: "Eno / Digene", use: "One sachet/2 tablets in water after meals for quick relief" },
      { name: "Pudin Hara (peppermint oil capsules)", use: "1-2 capsules after meals for gas and bloating" },
      { name: "Cyclopam (if crampy pain is present)", use: "One tablet for spasms, as directed" },
    ],
    eat: ["Ajwain (carom seeds) with warm water - a genuinely effective home remedy", "Smaller, more frequent meals eaten slowly", "Curd/buttermilk with meals"],
    avoid: ["Carbonated drinks and chewing gum (both add swallowed air)", "Beans, cabbage, fried and heavy food in large portions", "Eating too fast or lying down right after meals"],
  },
  {
    name: "Acidity / Heartburn (GERD)",
    match: (l) => l.includes("acid") || l.includes("heartburn") || l.includes("sour") || (l.includes("burning") && (l.includes("chest") || l.includes("stomach") || l.includes("throat"))),
    doctor: "Gastroenterologist (if it happens more than twice a week)",
    urgency: "Mild to moderate - manageable with medicine and diet changes",
    medicines: [
      { name: "Pan-D / Pantocid (Pantoprazole 40mg)", use: "One tablet in the morning, empty stomach, for 5-7 days" },
      { name: "Gelusil / Digene antacid gel", use: "1-2 tsp after meals and at bedtime for quick relief" },
    ],
    eat: ["Smaller meals, eaten slowly", "Cold milk (not for everyone, but helps many)", "Banana, oatmeal, and non-citrus fruits"],
    avoid: ["Spicy, oily, and fried food", "Tea/coffee on an empty stomach", "Lying down within 2 hours of eating", "Late-night heavy meals"],
    note: "Burning pain on an empty stomach that improves after eating, or black/tarry stools, can mean an ulcer - that needs a doctor's evaluation, not just antacids.",
  },
  {
    name: "Constipation",
    match: (l) => l.includes("constipat") || l.includes("hard stool") || l.includes("can't pass stool") || l.includes("straining") || l.includes("not passing stool"),
    doctor: "General Physician",
    urgency: "Mild - usually improves with diet + a mild laxative in a day or two",
    medicines: [
      { name: "Isabgol (psyllium husk)", use: "1-2 tsp in a glass of water or milk at night" },
      { name: "Cremaffin / Duphalac (lactulose) syrup", use: "As per pack dosage, if Isabgol alone isn't enough" },
    ],
    eat: ["More fibre - fruits (papaya, guava), vegetables, whole grains", "Plenty of water through the day", "Warm water first thing in the morning"],
    avoid: ["Excess dairy/cheese and processed food", "Sitting for long hours without any movement/walk"],
    note: "If constipation comes with blood in stool, severe pain, or unexplained weight loss, see a doctor rather than self-treating.",
  },
  {
    name: "General Stomach Pain",
    match: (l) => (l.includes("stomach") || l.includes("abdomen") || l.includes("abdominal") || l.includes("belly") || l.includes("tummy")) && (l.includes("pain") || l.includes("ache") || l.includes("hurt") || l.includes("cramp")),
    doctor: "General Physician",
    urgency: "Mild - most simple stomach pain is indigestion or gas and settles within a day",
    medicines: [
      { name: "Eno / Digene", use: "For pain linked to gas or a heavy meal" },
      { name: "Cyclopam", use: "For crampy pain, one tablet as directed" },
    ],
    eat: ["Light, warm, home-cooked food", "Ajwain water or plain warm water"],
    avoid: ["Oily, spicy, or heavy food until it settles", "Self-medicating repeatedly without figuring out the cause"],
    note: "This is a general answer because \"stomach pain\" alone can mean a lot of things. For a sharper match, tell us more: is there vomiting, fever, diarrhea, bloating, or does it come after eating a specific kind of food? Each of those points to a different, more specific cause.",
  },

  // ---------------- Musculoskeletal ----------------
  {
    name: "Muscular Back Pain / Strain",
    match: (l) => l.includes("back pain") || l.includes("backache") || (l.includes("muscle") && l.includes("pain")) || l.includes("sprain") || l.includes("strain"),
    doctor: "Orthopedist (if it persists beyond a week)",
    urgency: "Mild - usually improves with rest and topical relief in a few days",
    medicines: [
      { name: "Combiflam (Ibuprofen + Paracetamol)", use: "One tablet after food, twice a day if needed, for 2-3 days max" },
      { name: "Volini / Moov gel", use: "Apply to the affected area 2-3 times a day" },
    ],
    eat: ["Balanced meals with enough protein for muscle repair", "Stay hydrated"],
    avoid: ["Heavy lifting or sudden twisting movements", "Prolonged bed rest - gentle movement usually helps more"],
    note: "Back pain with numbness, tingling down a leg, or loss of bladder/bowel control needs urgent medical attention.",
  },

  // ---------------- Skin ----------------
  {
    name: "Fungal Skin Infection (Ringworm)",
    match: (l) => l.includes("ringworm") || l.includes("fungal") || (l.includes("itchy") && (l.includes("patch") || l.includes("ring") || l.includes("skin"))),
    doctor: "Dermatologist",
    urgency: "Mild - usually clears in 2-4 weeks with a topical antifungal",
    medicines: [
      { name: "Candid Cream (Clotrimazole) / Cutimol", use: "Apply twice daily on and just around the patch for 2-4 weeks - continue for a week after it looks gone" },
    ],
    eat: ["No specific diet, but keeping the area clean and dry helps a lot"],
    avoid: ["Sharing towels/clothes", "Tight, non-breathable clothing", "Stopping the cream as soon as it looks better - restart properly if it recurs"],
    note: "See a dermatologist if it's spreading, not improving after 2 weeks of cream, or keeps coming back - it may need an oral antifungal (prescription only).",
  },
  {
    name: "Allergic Rash / Hives",
    match: (l) => l.includes("rash") || l.includes("hives") || (l.includes("itchy") && (l.includes("bump") || l.includes("skin") || l.includes("allerg"))),
    doctor: "Dermatologist / Allergist (if recurring)",
    urgency: "Mild, but seek urgent care if breathing becomes difficult or the face/throat swells",
    medicines: [
      { name: "Cetirizine (Cetzine/Alerid) or Levocetirizine (Xyzal)", use: "One tablet at night" },
      { name: "Calamine lotion", use: "Apply to itchy areas for relief" },
    ],
    eat: ["No specific diet, but note down what you ate/touched before it started"],
    avoid: ["The suspected trigger (food, soap, detergent, jewellery, etc.)", "Scratching, which can break skin and cause infection"],
    note: "If the rash comes with facial swelling, throat tightness, or difficulty breathing, that's a medical emergency - go to the ER immediately.",
  },

  // ---------------- Other common single-visit conditions ----------------
  {
    name: "Urinary Tract Infection (UTI)",
    match: (l) => l.includes("uti") || (l.includes("urin") && (l.includes("burn") || l.includes("frequent") || l.includes("pain"))),
    doctor: "General Physician / Urologist / Gynecologist",
    urgency: "See a doctor within a day or two - this needs a prescription antibiotic",
    medicines: [
      { name: "Prescription antibiotic (e.g., Nitrofurantoin or Ciprofloxacin)", use: "Only after a doctor confirms UTI - don't self-medicate with antibiotics" },
      { name: "Cranberry juice / plenty of water", use: "Supportive care alongside treatment, not a replacement for it" },
    ],
    eat: ["Plenty of water through the day", "Cranberry juice (unsweetened, if available)"],
    avoid: ["Holding urine for long periods", "Caffeine and alcohol until it clears"],
    note: "UTIs usually clear up completely after one short course of the right antibiotic from a doctor - this is exactly the kind of thing worth a single quick visit rather than guessing at home.",
  },
  {
    name: "Conjunctivitis (Pink Eye)",
    match: (l) => l.includes("conjunctivitis") || l.includes("pink eye") || (l.includes("eye") && (l.includes("red") || l.includes("itchy") || l.includes("discharge"))),
    doctor: "Ophthalmologist",
    urgency: "See a doctor within a day or two - it's contagious and eye drops need a prescription",
    medicines: [
      { name: "Moxicip / Moxifloxacin eye drops", use: "Prescription only - a doctor needs to confirm it's bacterial, not viral or allergic, first" },
      { name: "Cold compress", use: "Apply a clean, cold cloth over closed eyes for comfort" },
    ],
    eat: ["No specific diet"],
    avoid: ["Touching/rubbing the eyes", "Sharing towels, pillows, or eye makeup", "Wearing contact lenses until it clears"],
  },
  {
    name: "Toothache / Dental Pain",
    match: (l) => l.includes("tooth") || l.includes("teeth pain") || l.includes("gum pain") || l.includes("gum ache"),
    doctor: "Dentist",
    urgency: "See a dentist within a couple of days - usually resolved in a single visit",
    medicines: [
      { name: "Combiflam (Ibuprofen + Paracetamol)", use: "One tablet after food for pain relief until you see a dentist" },
      { name: "Clove oil", use: "Dab a little on the painful tooth/gum for temporary relief - a genuinely useful home remedy" },
    ],
    eat: ["Soft, lukewarm food, avoiding the painful side"],
    avoid: ["Very hot, cold, or sugary food/drinks", "Ignoring it - untreated tooth pain rarely resolves on its own"],
    note: "Facial swelling along with tooth pain, or fever, means the infection may be spreading - see a dentist urgently, don't wait.",
  },
];

function matchDiseaseProfile(input) {
  const l = input.toLowerCase();
  for (const profile of DISEASE_PROFILES) {
    if (profile.match(l)) return profile;
  }
  return null;
}

function checkForEmergency(input) {
  const lower = input.toLowerCase();
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.keywords.some((kw) => lower.includes(kw))) return pattern;
  }
  return null;
}

function renderEmergencyCard(resultBox, pattern) {
  resultBox.innerHTML = `
    <div class="ai-result-card" style="border-left: 4px solid #dc2626;">
      <span class="ai-badge" style="background: #dc2626;">⚠️ Emergency Guidance</span>
      <h3 style="color: #dc2626;">${pattern.title}</h3>
      <div class="ai-section-box" style="border-left-color: #dc2626; background: #fef2f2;">
        <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
          ${pattern.steps.map((s) => `<li>${s}</li>`).join("")}
        </ol>
      </div>
      <p style="font-size: 12.5px; color: #888; margin-top: 10px;">
        This is general guidance, not medical training or a diagnosis. If this is happening right now, call emergency services first - don't wait on this tool.
      </p>
      <a href="emergency.html" class="ai-book-doctor-btn" style="display: inline-block; text-decoration: none; text-align: center;">See full emergency guide</a>
    </div>
  `;
}

function renderCrisisCard(resultBox) {
  resultBox.innerHTML = `
    <div class="ai-result-card" style="border-left: 4px solid #dc2626;">
      <h3 style="color: #dc2626;">You matter, and support is available</h3>
      <p>If you're going through a difficult time, please reach out to someone who can help right now:</p>
      <div class="ai-section-box" style="border-left-color: #dc2626; background: #fef2f2;">
        <p><strong>iCall (India):</strong> 9152987821</p>
        <p><strong>Vandrevala Foundation:</strong> 1860-2662-345</p>
        <p><strong>Emergency services:</strong> 112</p>
      </div>
      <p style="font-size: 12.5px; color: #888;">This tool can't provide the support you need right now, but a real person can.</p>
    </div>
  `;
}

function setPreset(text) {
  const input = document.getElementById("aiSymptomInput");
  if (input) input.value = text;
}

function runAiDiagnosis() {
  const inputEl = document.getElementById("aiSymptomInput");
  const resultBox = document.getElementById("aiResultBox");
  if (!inputEl || !resultBox) return;

  const input = inputEl.value.trim();
  if (!input) {
    alert("Please describe how you are feeling first.");
    return;
  }

  const lowerInput = input.toLowerCase();
  if (CRISIS_KEYWORDS.some((kw) => lowerInput.includes(kw))) {
    renderCrisisCard(resultBox);
    return;
  }
  const emergency = checkForEmergency(input);
  if (emergency) {
    renderEmergencyCard(resultBox, emergency);
    return;
  }

  resultBox.innerHTML = `
          <div class="ai-loading">
            <span class="material-symbols-outlined ai-spin" style="font-size: 36px; color: #1a7a8a;">progress_activity</span>
            <p>Looking at what you described...</p>
          </div>
        `;

  setTimeout(() => {
    const profile = matchDiseaseProfile(input);

    if (!profile) {
      // Genuinely unmatched input - be honest about that instead of
      // guessing a random condition (the old version always fell back
      // to "Asthma" for anything it didn't recognize, which was
      // actively misleading).
      resultBox.innerHTML = `
        <div class="ai-result-card">
          <span class="ai-badge" style="background: #64748b;">Couldn't confidently match this</span>
          <h3>We need a bit more detail</h3>
          <p>We couldn't match that description to something specific yet. Try adding details like: where exactly it hurts, since when, whether there's fever/vomiting/rash, and anything that makes it better or worse.</p>
          <div class="ai-section-box">
            <h4>🩺 In the meantime</h4>
            <p>For anything that isn't going away or is worrying you, a <strong>General Physician</strong> visit is always a safe starting point - they can point you to a specialist if needed.</p>
          </div>
          <p style="font-size: 12px; color: #888;">This is a simple keyword-matching demo tool for this project, not a real medical AI - it's not a diagnosis. Please see a doctor for anything you're actually concerned about.</p>
          <button class="ai-book-doctor-btn" onclick="alert('Consultation request sent to General Physician!')">Book Consultation</button>
        </div>
      `;
      return;
    }

    const medicinesHtml = profile.medicines
      .map((m) => `<p style="margin-bottom: 8px;"><strong>${m.name}</strong><br>${m.use}</p>`)
      .join("");
    const eatHtml = profile.eat.map((item) => `<li>${item}</li>`).join("");
    const avoidHtml = profile.avoid.map((item) => `<li>${item}</li>`).join("");
    const noteHtml = profile.note
      ? `<div class="ai-section-box" style="border-left-color: #d97706; background: #fffbeb;">
           <h4 style="color: #b45309;">⚠️ When to Actually See a Doctor</h4>
           <p>${profile.note}</p>
         </div>`
      : "";

    resultBox.innerHTML = `
            <div class="ai-result-card">
              <span class="ai-badge">Possible match (not a diagnosis)</span>
              <h3>${profile.name}</h3>
              <p class="ai-urgency"><strong>Urgency:</strong> ${profile.urgency}</p>

              <div class="ai-section-box">
                <h4>💊 Medicine Sometimes Used For This (India)</h4>
                ${medicinesHtml}
                <p style="font-size: 12px; color: #888; margin-top: 6px;">Available at any Indian pharmacy or on 1mg/PharmEasy/Netmeds - confirm with a doctor or pharmacist before taking anything, especially if you're on other medication or pregnant.</p>
              </div>

              <div class="ai-section-box">
                <h4>🩺 Recommended Doctor Specialty</h4>
                <p><strong>${profile.doctor}</strong><br>Recommended to book a consultation for a proper evaluation.</p>
              </div>

              <div class="ai-section-box" style="border-left-color: #16a34a; background: #f0fdf4;">
                <h4 style="color: #16a34a;">🥗 What to Eat & Do</h4>
                <ul style="margin: 6px 0 0; padding-left: 20px; line-height: 1.7;">${eatHtml}</ul>
              </div>

              <div class="ai-section-box" style="border-left-color: #dc2626; background: #fef2f2;">
                <h4 style="color: #dc2626;">🚫 What NOT to Do & Avoid</h4>
                <ul style="margin: 6px 0 0; padding-left: 20px; line-height: 1.7;">${avoidHtml}</ul>
              </div>

              ${noteHtml}

              <p style="font-size: 12px; color: #888;">This is a simple keyword-matching demo tool for this project, not a real medical AI - it's not a diagnosis. Please see a doctor for anything you're actually concerned about.</p>

              <button class="ai-book-doctor-btn" onclick="alert('Consultation request sent to ${profile.doctor}!')">Book Consultation</button>
            </div>
          `;
  }, 700);
}
// hamburger cross button
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  const overlay = document.getElementById("overlay");
  const closeButton = document.getElementById("menuCloseButton");

  function closeHamburgerMenu() {
    menu.classList.remove("show");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeHamburgerMenu);
  }

  // Optional: pressing Escape also closes the menu on desktop.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeHamburgerMenu();
    }
  });
});

// ----- Hamburger menu: real logged-in profile -----
// Shows the actual logged-in patient/doctor at the top of the side menu
// (the CSS already hides/shows .logged-in-only based on body.logged-in),
// and routes a click on the profile card to that person's own dashboard.
(async function loadMenuProfile() {
  try {
    const me = await getCurrentUser();
    const session = me.data;

    document.body.classList.add("logged-in");
    document.getElementById("menuProfileName").textContent = session.fullName;
    const initials = session.fullName
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const avatarEl = document.getElementById("menuProfileAvatar");
    if (avatarEl) avatarEl.textContent = initials || "?";

    const roleLabel =
      session.role === "PATIENT"
        ? "Patient"
        : session.role === "DOCTOR"
          ? "Doctor"
          : session.role === "ADMIN"
            ? "Administrator"
            : session.role === "NURSE"
              ? "Front Desk"
              : session.role;
    document.getElementById("menuProfileRole").textContent = roleLabel;

    const dashboardFor = { PATIENT: "patient.html", DOCTOR: "doctor.html" };
    const destination = dashboardFor[session.role];

    const gotoEl = document.getElementById("menuProfileGoto");
    if (destination) {
      gotoEl.textContent = "Tap to go to my dashboard →";
      document
        .getElementById("menuProfileCard")
        .addEventListener("click", () => {
          window.location.href = destination;
        });
    } else {
      gotoEl.textContent = "";
      document.getElementById("menuProfileCard").style.cursor = "default";
    }
  } catch (e) {
    // not logged in - body stays without the "logged-in" class, so the
    // CSS keeps the profile card hidden and only the public menu shows.
  }
})();

const menuLogoutBtn = document.getElementById("menuLogoutBtn");
if (menuLogoutBtn) {
  menuLogoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    confirmLogout(async () => {
      await logout();
      window.location.reload();
    });
  });
}

// ----- Footer feedback form -----
const FEEDBACK_QUESTIONS = [
  { key: "q1_navigation", text: "How easy was it to navigate the website?" },
  {
    key: "q2_booking",
    text: "How would you rate the appointment booking process?",
  },
  {
    key: "q3_doctor_info",
    text: "How clear was the information about doctors and services?",
  },
  {
    key: "q4_registration",
    text: "How satisfied are you with the registration process?",
  },
  {
    key: "q5_design",
    text: "How would you rate the overall design and visual appeal?",
  },
  { key: "q6_speed", text: "How fast/responsive did the website feel?" },
  {
    key: "q7_findability",
    text: "How easy was it to find what you were looking for?",
  },
  {
    key: "q8_recommend",
    text: "How likely are you to recommend this website to others?",
  },
  {
    key: "q9_billing",
    text: "How would you rate the billing and payment experience?",
  },
  {
    key: "q10_overall",
    text: "Overall, how satisfied are you with the website?",
  },
];

function renderFeedbackQuestions() {
  const container = document.getElementById("feedbackQuestions");
  if (!container || container.dataset.rendered) return;
  container.dataset.rendered = "true";
  container.innerHTML = FEEDBACK_QUESTIONS.map(
    (q, i) => `
    <div style="margin-bottom: 14px;">
      <label style="font-size: 13.5px; font-weight: 600; display: block; margin-bottom: 6px;">
        ${i + 1}. ${q.text}
      </label>
      <div style="display: flex; gap: 6px;" data-question="${q.key}">
        ${[1, 2, 3, 4, 5]
          .map(
            (n) => `
          <button type="button" class="feedback-scale-btn" data-value="${n}"
            style="flex: 1; padding: 8px 0; border: 1px solid #ddd; background: #fff;
                   border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;">
            ${n}
          </button>`,
          )
          .join("")}
      </div>
    </div>`,
  ).join("");

  container.querySelectorAll(".feedback-scale-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.closest("[data-question]");
      group.querySelectorAll(".feedback-scale-btn").forEach((b) => {
        b.style.background = "#fff";
        b.style.color = "#000";
        b.style.borderColor = "#ddd";
      });
      btn.style.background = "#16a085";
      btn.style.color = "#fff";
      btn.style.borderColor = "#16a085";
      group.dataset.selected = btn.dataset.value;
    });
  });
}

function openFeedbackModal() {
  renderFeedbackQuestions();
  document.getElementById("feedbackModal").style.display = "flex";
  document.body.style.overflow = "hidden";
}
function closeFeedbackModal() {
  document.getElementById("feedbackModal").style.display = "none";
  document.body.style.overflow = "";
}

const openFeedbackBtn = document.getElementById("openFeedbackBtn");
if (openFeedbackBtn)
  openFeedbackBtn.addEventListener("click", openFeedbackModal);

const feedbackCancelBtn = document.getElementById("feedbackCancelBtn");
if (feedbackCancelBtn)
  feedbackCancelBtn.addEventListener("click", closeFeedbackModal);

const feedbackCloseBtn = document.getElementById("feedbackCloseBtn");
if (feedbackCloseBtn)
  feedbackCloseBtn.addEventListener("click", closeFeedbackModal);

const feedbackComments = document.getElementById("feedbackComments");
if (feedbackComments) {
  feedbackComments.addEventListener("input", () => {
    const words = feedbackComments.value.trim().split(/\s+/).filter(Boolean);
    const countEl = document.getElementById("feedbackWordCount");
    if (words.length > 100) {
      feedbackComments.value = words.slice(0, 100).join(" ");
    }
    const finalCount = feedbackComments.value
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    countEl.textContent = `${finalCount} / 100 words`;
    countEl.style.color = finalCount >= 100 ? "#d33" : "#999";
  });
}

const feedbackSubmitBtn = document.getElementById("feedbackSubmitBtn");
if (feedbackSubmitBtn) {
  feedbackSubmitBtn.addEventListener("click", async () => {
    const errorEl = document.getElementById("feedbackError");
    errorEl.style.display = "none";

    const answers = {};
    let allAnswered = true;
    document
      .querySelectorAll("#feedbackQuestions [data-question]")
      .forEach((group) => {
        if (!group.dataset.selected) allAnswered = false;
        answers[group.dataset.question] = Number(group.dataset.selected);
      });

    if (!allAnswered) {
      errorEl.textContent = "Please answer all 10 questions before submitting.";
      errorEl.style.display = "block";
      return;
    }

    feedbackSubmitBtn.disabled = true;
    feedbackSubmitBtn.textContent = "Submitting…";
    try {
      await submitFeedback({
        ...answers,
        comments: feedbackComments.value.trim(),
      });
      closeFeedbackModal();
      alert("Thanks for your feedback! It really helps us improve.");
      document
        .querySelectorAll("#feedbackQuestions [data-question]")
        .forEach((group) => {
          delete group.dataset.selected;
          group.querySelectorAll(".feedback-scale-btn").forEach((b) => {
            b.style.background = "#fff";
            b.style.color = "#000";
            b.style.borderColor = "#ddd";
          });
        });
      feedbackComments.value = "";
      document.getElementById("feedbackWordCount").textContent =
        "0 / 100 words";
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = "block";
    } finally {
      feedbackSubmitBtn.disabled = false;
      feedbackSubmitBtn.textContent = "Submit";
    }
  });
}
// FAQ
function toggleFAQ(button) {
  const item = button.parentElement;
  const answer = button.nextElementSibling;

  document.querySelectorAll(".faq-item").forEach((otherItem) => {
    if (otherItem !== item) {
      otherItem.classList.remove("active");
      otherItem.querySelector(".faq-answer").style.maxHeight = null;
    }
  });

  item.classList.toggle("active");

  if (item.classList.contains("active")) {
    answer.style.maxHeight = answer.scrollHeight + "px";
  } else {
    answer.style.maxHeight = null;
  }
}
