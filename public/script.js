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
  // function closeMenu() {
  //   document.getElementById("menu").classList.remove("show");
  //   document.getElementById("overlay").classList.remove("show");
  // }
  document.getElementById("menu").classList.toggle("show");

  document.getElementById("overlay").classList.toggle("show");
}
document.addEventListener("click", function (event) {
  const menu = document.getElementById("menu");
  const hamburger = document.querySelector(".hamburger");
  const overlay = document.getElementById("overlay");

  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove("show");
    overlay.classList.remove("show");
  }
});
document.getElementById("overlay").addEventListener("click", function () {
  document.getElementById("menu").classList.remove("show");

  document.getElementById("overlay").classList.remove("show");
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
      "book appointment", "book a doctor", "how to book", "make appointment", "make an appointment",
      "schedule appointment", "schedule a doctor visit", "see a doctor", "get an appointment",
      "need an appointment", "want an appointment", "take an appointment", "doctor appointment",
      "appointment booking", "book now", "book doctor appointment", "i want to book an appointment",
      "book a visit", "visit a doctor",
    ],
    question: "How do I book an appointment?",
    answer: "Go to the Doctors section, pick a doctor, and click Book Now - or use the Book Appointment page directly to choose from every doctor.",
    action: { type: "link", href: "appointment.html", label: "Go to Book Appointment" },
  },
  {
    keywords: ["doctor section", "where are doctors", "find doctors", "our doctors", "list of doctors", "see doctors", "meet our doctors"],
    question: "Where is the doctors section?",
    answer: "Scroll down to \"Our Expert Doctors\", or click Doctors in the top menu.",
    action: { type: "scroll", target: "#doctors", label: "Take me there" },
  },
  {
    keywords: ["register patient", "sign up patient", "create patient account", "patient account", "new patient", "become a patient"],
    question: "How do I register as a patient?",
    answer: "Open the patient registration page and fill in your details - you'll be logged in automatically once you're done.",
    action: { type: "link", href: "register-p.html", label: "Go to Patient Registration" },
  },
  {
    keywords: ["register doctor", "sign up doctor", "join as doctor", "doctor account", "create doctor account", "become a doctor"],
    question: "How do I register as a doctor?",
    answer: "Open the doctor registration page - you'll need your department, specialization, and consultation fee.",
    action: { type: "link", href: "register.html", label: "Go to Doctor Registration" },
  },
  {
    keywords: ["log in", "login", "sign in", "already have account", "access my account"],
    question: "How do I log in?",
    answer: "Use the Sign In page with the email and password you registered with. Patients and doctors are redirected to their own dashboard automatically.",
    action: { type: "link", href: "login.html", label: "Go to Sign In" },
  },
  {
    keywords: ["contact", "support", "help", "reach you", "get in touch", "customer service", "talk to someone"],
    question: "How do I contact support?",
    answer: "Use the Contact Us page to send a message - we'll get back to you within 24 hours. You can also see our phone, email, and address there.",
    action: { type: "link", href: "contact.html", label: "Go to Contact Us" },
  },
  {
    keywords: ["demo", "request demo", "not sure which doctor", "what do i need", "match me with a doctor", "which doctor should i see", "symptom"],
    question: "What is \"Request a Demo\"?",
    answer: "Describe your symptom or need and we'll match you with a real doctor from the right department, with a suggested date and time.",
    action: { type: "link", href: "request-demo.html", label: "Go to Request a Demo" },
  },
  {
    keywords: ["payment", "pay", "how to pay", "payment method", "upi", "card payment", "cash payment", "online payment", "how do i pay"],
    question: "What payment methods are supported?",
    answer: "You can pay cash at the hospital during your visit, or pay online (UPI/Card, simulated for this project) right when you book.",
  },
  {
    keywords: ["bill", "bills", "invoice", "how much does it cost", "consultation fee amount", "billing", "my bills", "unpaid bill", "pending bill"],
    question: "Where do I see my bills?",
    answer: "Log in and open your Patient Dashboard - the \"Payments & Bills\" card shows every bill and lets you pay any that are still pending.",
    action: { type: "link", href: "register-p.html", label: "Go to my dashboard" },
  },
  {
    keywords: ["prescription", "medication", "medicine", "what did the doctor prescribe", "my medicines"],
    question: "Where do I see my prescriptions?",
    answer: "Your Patient Dashboard has a \"Recent Prescriptions\" card listing everything a doctor has prescribed you.",
    action: { type: "link", href: "register-p.html", label: "Go to my dashboard" },
  },
  {
    // Deliberately specific phrasing here (not bare "my appointment", which
    // is genuinely ambiguous with booking intent) - these only fire for
    // someone clearly asking about an appointment they already have.
    keywords: [
      "my upcoming appointment", "when is my appointment", "check my appointment status",
      "see my booked appointment", "status of my appointment", "my appointment history",
    ],
    question: "How do I see my upcoming appointments?",
    answer: "Your Patient Dashboard highlights your next appointment at the top, with the full list below it.",
    action: { type: "link", href: "register-p.html", label: "Go to my dashboard" },
  },
  {
    keywords: ["emergency", "urgent", "ambulance", "emergency contact"],
    question: "What if it's an emergency?",
    answer: "Use the Emergency page for urgent situations and emergency contact details.",
    action: { type: "link", href: "emergency.html", label: "Go to Emergency" },
  },
  {
    keywords: ["cancel appointment", "reschedule", "change appointment", "cancel my booking"],
    question: "Can I cancel or reschedule an appointment?",
    answer: "This isn't self-service yet - contact us and we'll help you reschedule or cancel.",
    action: { type: "link", href: "contact.html", label: "Go to Contact Us" },
  },
  {
    keywords: ["department", "specialization", "specialist", "cardiologist", "dermatologist", "which doctor department", "find a specialist"],
    question: "How do I find a doctor in a specific department?",
    answer: "On the Book Appointment page, every real doctor is listed with their department - or describe your need on Request a Demo and we'll match you automatically.",
    action: { type: "link", href: "appointment.html", label: "Go to Book Appointment" },
  },
];

const SEARCH_STOPWORDS = new Set([
  "a", "an", "the", "i", "to", "is", "do", "does", "my", "me", "you", "your",
  "of", "for", "in", "on", "at", "with", "and", "or", "please", "can", "how",
  "what", "where", "when", "want", "need", "would", "like", "it", "its", "im",
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
          if (et.length >= 4 && qt.length >= 4 && (et.startsWith(qt) || qt.startsWith(et))) {
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
    document.querySelector(action.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderSearchResults(results) {
  const box = document.getElementById("searchResults");
  if (!results.length) {
    box.innerHTML = '<div class="search-result-empty">No answer found - try "book appointment", "doctors", or "contact".</div>';
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
      </div>`
    )
    .join("");
  box.classList.add("has-results");

  box.querySelectorAll(".search-result-item").forEach((el) => {
    el.addEventListener("click", () => runFAQAction(results[Number(el.dataset.idx)].action));
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
bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = serviceData[currentServiceKey];

  const name = document.getElementById("fieldName").value.trim();
  const phone = document.getElementById("fieldPhone").value.trim();
  const age = document.getElementById("fieldAge").value.trim();
  const gender = document.getElementById("fieldGender").value;
  const date = document.getElementById("fieldDate").value;
  const time = document.getElementById("fieldTime").value;

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
  // Real bookings go through appointment.html, which talks to the backend.
  closeBooking();
  window.location.href = "appointment.html";
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
const payCashBtn = document.getElementById("payCashBtn");
const payOnlineBtn = document.getElementById("payOnlineBtn");
const confirmDoctorBookingBtn = document.getElementById(
  "confirmDoctorBookingBtn",
);

let selectedDate = null;
let selectedTime = null;
let selectedPayment = "Cash";
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

function renderTimeSlots() {
  const slots = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];
  timeSlotsMsg.style.display = "none";
  timeSlotsContainer.innerHTML = slots
    .map(
      (t) =>
        `<button type="button" class="time-slot-btn" data-time="${t}">${t}</button>`,
    )
    .join("");

  timeSlotsContainer.querySelectorAll(".time-slot-btn").forEach((btn) => {
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
  document.getElementById("docQualifications").textContent = doctor.qualifications;
  document.getElementById("docLocation").textContent = doctor.location;
  document.getElementById("docFee").textContent = doctor.fee ? `₹${doctor.fee}` : "Contact for pricing";
  document.getElementById("docAvailability").textContent = "Available";
  document.getElementById("docSuccess").textContent = doctor.department;
  document.getElementById("docExperience").textContent = doctor.experience;
  document.getElementById("docPatients").textContent = doctor.patients;
  document.getElementById("docAbout").textContent = doctor.about;

  document.getElementById("sumDoctorName").textContent = doctor.name;
  document.getElementById("sumDoctorSpeciality").textContent = doctor.speciality;
  document.getElementById("sumSelectedDate").textContent = "Not selected";
  document.getElementById("sumSelectedTime").textContent = "Not selected";
  document.getElementById("sumFee").textContent = doctor.fee ? `₹${doctor.fee}` : "Contact for pricing";

  selectedDate = null;
  selectedTime = null;
  selectedPayment = "Cash";
  payCashBtn.classList.add("active");
  payOnlineBtn.classList.remove("active");

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
      experience: d.experience_years ? `${d.experience_years} Years Experience` : "Experience not specified",
      qualifications: d.qualifications || "Not specified",
      location: d.clinic_location || "Casto Healthcare",
      fee: d.consultation_fee || null,
      patients: d.patients_treated || 0,
      about: d.bio || `${"Dr. " + d.first_name} sees patients for ${d.department || "general"} care at Casto Healthcare.`,
      image: `https://randomuser.me/api/portraits/${d.gender === "Female" ? "women" : "men"}/${(d.doctor_id % 90) + 1}.jpg`,
    }));

    if (!doctors.length) {
      doctorTrack.innerHTML = '<p style="padding: 20px; color: #888;">No doctors registered yet.</p>';
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
    doctorTrack.innerHTML = '<p style="padding: 20px; color: #888;">Could not load doctors right now.</p>';
  }
}

loadRealDoctors();

doctorBackBtn.addEventListener("click", () => {
  doctorProfileOverlay.classList.remove("active");
  document.body.style.overflow = "";
});

payCashBtn.addEventListener("click", () => {
  selectedPayment = "Cash";
  payCashBtn.classList.add("active");
  payOnlineBtn.classList.remove("active");
});
payOnlineBtn.addEventListener("click", () => {
  selectedPayment = "Online";
  payOnlineBtn.classList.add("active");
  payCashBtn.classList.remove("active");
});

confirmDoctorBookingBtn.addEventListener("click", () => {
  // The overlay is a browsing/preview experience; the actual booking (and
  // the doctor's dashboard being updated) happens on appointment.html,
  // which talks to the real backend. Passing doctorId + the payment choice
  // already made here carries both into that real booking flow.
  doctorProfileOverlay.classList.remove("active");
  document.body.style.overflow = "";
  const params = new URLSearchParams();
  if (currentDoctorId) params.set("doctorId", currentDoctorId);
  params.set("payment", selectedPayment === "Online" ? "Online" : "Cash");
  window.location.href = "appointment.html?" + params.toString();
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

  resultBox.innerHTML = `
          <div class="ai-loading">
            <span class="material-symbols-outlined ai-spin" style="font-size: 36px; color: #1a7a8a;">progress_activity</span>
            <p>Analyzing clinical symptom patterns...</p>
          </div>
        `;

  setTimeout(() => {
    let diagnosis = "Acute Bronchospasm / Asthma Exacerbation";
    let medName = "Albuterol HFA Inhaler";
    let dosage = "2 puffs every 4-6 hours as needed";
    let doctor = "Pulmonologist";
    let urgency = "Moderate - Prompt Evaluation within 3 days";

    const lower = input.toLowerCase();
    if (
      lower.includes("headache") ||
      lower.includes("nausea") ||
      lower.includes("light")
    ) {
      diagnosis = "Migraine with Aura / Tension Headache";
      medName = "Sumatriptan (Imitrex) & Naproxen";
      dosage = "50mg tablet at onset of aura";
      doctor = "Neurologist";
      urgency = "Routine / Urgent Neurology Consult";
    } else if (lower.includes("cough") || lower.includes("fever")) {
      diagnosis = "Acute Viral Upper Respiratory Infection / Influenza";
      medName = "Acetaminophen (Tylenol) & Cough Syrup";
      dosage = "500mg every 6 hours as needed for fever";
      doctor = "Primary Care Physician / Urgent Care";
      urgency = "Routine Home Care & Hydration";
    }

    resultBox.innerHTML = `
            <div class="ai-result-card">
              <span class="ai-badge">AI Confidence: 91%</span>
              <h3>${diagnosis}</h3>
              <p class="ai-urgency"><strong>Urgency:</strong> ${urgency}</p>
              
              <div class="ai-section-box">
                <h4>💊 Recommended Medicine</h4>
                <p><strong>${medName}</strong><br>Dosage: ${dosage}</p>
              </div>

              <div class="ai-section-box">
                <h4>🩺 Recommended Doctor Specialty</h4>
                <p><strong>${doctor}</strong><br>Recommended to book a consultation for physical evaluation.</p>
              </div>

              <div class="ai-section-box" style="border-left-color: #16a34a; background: #f0fdf4;">
                <h4 style="color: #16a34a;">🥗 What to Eat & Do (Precautions)</h4>
                <p><strong>Do:</strong> Stay well-hydrated with warm fluids, rest in a humidified room, and eat light nutritious broths or fruits.</p>
                <p><strong>Eat:</strong> Ginger tea, honey, leafy greens, and Vitamin C-rich foods.</p>
              </div>

              <div class="ai-section-box" style="border-left-color: #dc2626; background: #fef2f2;">
                <h4 style="color: #dc2626;">🚫 What NOT to Do & Avoid</h4>
                <p><strong>Avoid:</strong> Cold beverages, processed sugars, dairy if congested, and heavy strenuous physical exertion.</p>
                <p><strong>Don't:</strong> Self-medicate with high-dose painkillers without checking with your physician.</p>
              </div>

              <button class="ai-book-doctor-btn" onclick="alert('Consultation request sent to ${doctor}!')">Book Consultation</button>
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

    const roleLabel = session.role === "PATIENT" ? "Patient"
      : session.role === "DOCTOR" ? "Doctor"
      : session.role === "ADMIN" ? "Administrator"
      : session.role === "NURSE" ? "Front Desk"
      : session.role;
    document.getElementById("menuProfileRole").textContent = roleLabel;

    const dashboardFor = { PATIENT: "register-p.html", DOCTOR: "register.html" };
    const destination = dashboardFor[session.role];

    const gotoEl = document.getElementById("menuProfileGoto");
    if (destination) {
      gotoEl.textContent = "Tap to go to my dashboard →";
      document.getElementById("menuProfileCard").addEventListener("click", () => {
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
  menuLogoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await logout();
    window.location.reload();
  });
}
