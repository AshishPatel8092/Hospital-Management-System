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
}

// Close search bar when clicking outside

document.addEventListener("click", function (e) {
  const search = document.getElementById("searchContainer");

  if (!search.contains(e.target)) {
    search.classList.remove("active");
  }
});

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
