document.addEventListener("DOMContentLoaded", () => {
  const COMMS_BASE_URL = "http://localhost:8000";
  const backBtn = document.getElementById("backBtn");
  const buyCard = document.getElementById("buyCard");
  const slideTrack = document.getElementById("slideTrack");
  const slideDots = document.getElementById("slideDots");
  const courseName = document.getElementById("courseName");
  const courseMeta = document.getElementById("courseMeta");
  const courseCost = document.getElementById("courseCost");
  const courseDescription = document.getElementById("courseDescription");
  const teacherAvatar = document.getElementById("teacherAvatar");
  const teacherName = document.getElementById("teacherName");
  const teacherTitle = document.getElementById("teacherTitle");
  const teacherRating = document.getElementById("teacherRating");
  const teacherBio = document.getElementById("teacherBio");
  const calendarMonthLabel = document.getElementById("calendarMonthLabel");
  const scheduleGrid = document.getElementById("scheduleGrid");
  const scheduleForm = document.getElementById("scheduleForm");
  const meetTime = document.getElementById("meetTime");
  const meetNote = document.getElementById("meetNote");
  const scheduleStatus = document.getElementById("scheduleStatus");
  const generateMeetBtn = document.getElementById("generateMeetBtn");
  const meetLink = document.getElementById("meetLink");
  const courseChatMessages = document.getElementById("courseChatMessages");
  const courseChatForm = document.getElementById("courseChatForm");
  const courseChatInput = document.getElementById("courseChatInput");
  const feedbackPanel = document.getElementById("feedbackPanel");

  let selectedDateKey = "";
  let selectedSlot = "";
  let currentSlide = 0;

  function getCourse() {
    try {
      const stored = localStorage.getItem("selectedCourse");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  const course = getCourse() || {
    thumbnail: "COURSE",
    name: "Selected Course",
    teacher: "Teacher Name",
    teacherTitle: "Instructor",
    teacherBio: "Teacher profile details will appear here.",
    rating: "0.0",
    duration: "TBD",
    credits: 0,
    description: "Course description is unavailable right now.",
  };

  function resolveImageSrc(value) {
    const src = String(value || "").trim();
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    return `../assets/${src}`;
  }

  const dbSlides = Array.isArray(course.slide_images)
    ? course.slide_images.map(resolveImageSrc).filter(Boolean)
    : [];

  const fallbackSlide = resolveImageSrc(course.thumbnail) || "../assets/course_overview.png";
  const slideSources = dbSlides.length ? dbSlides : [fallbackSlide];

  const slides = slideSources.map((image, idx) => ({
    text: idx === 0
      ? `${course.name.toUpperCase()} OVERVIEW`
      : `${course.name.toUpperCase()} SLIDE ${idx + 1}`,
    image,
  }));

  const themeByKey = {
    python: {
      className: "theme-python",
      palette: ["#d1fae5", "#a7f3d0", "#6ee7b7"],
    },
    "web-dev": {
      className: "theme-web-dev",
      palette: ["#dbeafe", "#bfdbfe", "#93c5fd"],
    },
    dsa: {
      className: "theme-dsa",
      palette: ["#ccfbf1", "#99f6e4", "#5eead4"],
    },
    java: {
      className: "theme-java",
      palette: ["#ffedd5", "#fed7aa", "#fdba74"],
    },
    "ui-ux": {
      className: "theme-ui-ux",
      palette: ["#ede9fe", "#ddd6fe", "#c4b5fd"],
    },
  };

  const themeKey = String(course.thumbnail || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  const activeTheme = themeByKey[themeKey] || {
    className: "theme-python",
    palette: ["#d1fae5", "#a7f3d0", "#6ee7b7"],
  };

  const slotPool = [
    ["10:00", "11:30"],
    ["14:00", "16:00"],
    ["09:30", "13:00"],
    ["15:00", "17:30"],
  ];

  function toDateKey(dateObj) {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
  }

  function teacherSeed(text) {
    return String(text || "")
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  }

  function buildAvailability() {
    const map = new Map();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const seed = teacherSeed(course.teacher);

    for (let day = 1; day <= daysInMonth; day++) {
      if ((day + seed) % 3 !== 0) {
        continue;
      }

      const dateObj = new Date(year, month, day);
      const key = toDateKey(dateObj);
      const slots = slotPool[(day + seed) % slotPool.length];
      map.set(key, slots);
    }

    return map;
  }

  const availability = buildAvailability();

  function renderSlides() {
    slideTrack.innerHTML = "";
    slideDots.innerHTML = "";
    buyCard.classList.add(activeTheme.className);

    slides.forEach((slideData, idx) => {
      const slide = document.createElement("div");
      slide.className = "slide";
      slide.textContent = slideData.text;
      slide.style.backgroundImage = `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.7)), url(${slideData.image})`;
      slide.style.backgroundSize = "cover";
      slide.style.backgroundPosition = "center";
      slide.style.color = "#ffffff";
      slide.style.textShadow = "0 6px 12px rgba(0, 0, 0, 0.5)";
      slideTrack.appendChild(slide);

      const dot = document.createElement("span");
      dot.className = `slide-dot ${idx === 0 ? "active" : ""}`;
      slideDots.appendChild(dot);
    });
  }

  function advanceSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    slideTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    [...slideDots.children].forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentSlide);
    });
  }

  function fillMeetTimes(dateKey) {
    const slots = availability.get(dateKey) || [];
    meetTime.innerHTML = "";

    if (!slots.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No available times";
      meetTime.appendChild(option);
      return;
    }

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a time";
    meetTime.appendChild(defaultOption);

    slots.forEach((slot) => {
      const option = document.createElement("option");
      option.value = slot;
      option.textContent = slot;
      meetTime.appendChild(option);
    });
  }

  function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay();
    const daysInMonth = last.getDate();

    calendarMonthLabel.textContent = now.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    scheduleGrid.innerHTML = "";

    for (let i = 0; i < startWeekday; i++) {
      const empty = document.createElement("div");
      empty.className = "day-cell muted";
      scheduleGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const key = toDateKey(dateObj);
      const slots = availability.get(key) || [];

      const cell = document.createElement("div");
      cell.className = "day-cell";
      if (slots.length) {
        cell.classList.add("has-item");
      }
      if (selectedDateKey === key) {
        cell.classList.add("selected");
      }

      const dayNumber = document.createElement("div");
      dayNumber.className = "day-number";
      dayNumber.textContent = String(d);
      cell.appendChild(dayNumber);

      if (slots.length) {
        const pill = document.createElement("div");
        pill.className = "event-pill";
        pill.textContent = `${slots.length} slots open`;
        cell.appendChild(pill);

        cell.addEventListener("click", () => {
          selectedDateKey = key;
          selectedSlot = "";
          fillMeetTimes(key);
          renderCalendar();
          scheduleStatus.style.color = "#5e6e65";
          scheduleStatus.textContent = `Selected date: ${selectedDateKey}`;
        });
      }

      scheduleGrid.appendChild(cell);
    }
  }

  function addChatMessage(role, text) {
    const msg = document.createElement("div");
    msg.className = `chat-msg ${role}`;
    msg.textContent = text;
    courseChatMessages.appendChild(msg);
    courseChatMessages.scrollTop = courseChatMessages.scrollHeight;
  }

  courseName.textContent = course.name;
  courseMeta.textContent = `${course.teacher} • ${course.rating} / 5 • ${course.duration}`;
  courseCost.textContent = `${course.credits} credits`;
  courseDescription.textContent = course.description;
  teacherAvatar.textContent = String(course.teacher || "T")
    .slice(0, 1)
    .toUpperCase();
  teacherName.textContent = course.teacher;
  teacherTitle.textContent = course.teacherTitle || "Instructor";
  teacherRating.textContent = `Rating: ${course.rating} / 5`;
  teacherBio.textContent =
    course.teacherBio || "Teacher profile details will appear here.";

  renderSlides();
  setInterval(advanceSlide, 2800);
  renderCalendar();
  fillMeetTimes("");
  addChatMessage(
    "bot",
    "Hi, ask anything about course flow, teacher style, or first class prep.",
  );

  meetTime.addEventListener("change", () => {
    selectedSlot = meetTime.value;
  });

  scheduleForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    scheduleStatus.textContent = "";

    if (!selectedDateKey) {
      scheduleStatus.style.color = "#dc2626";
      scheduleStatus.textContent =
        "Please choose an available day from the calendar.";
      return;
    }

    if (!meetTime.value) {
      scheduleStatus.style.color = "#dc2626";
      scheduleStatus.textContent = "Please choose an available time.";
      return;
    }

    selectedSlot = meetTime.value;
    scheduleStatus.style.color = "#16a34a";
    scheduleStatus.textContent = `Meet slot saved: ${selectedDateKey} at ${selectedSlot}${meetNote.value.trim() ? ` (${meetNote.value.trim()})` : ""}.`;
  });

  generateMeetBtn.addEventListener("click", async () => {
    if (!selectedDateKey || !selectedSlot) {
      scheduleStatus.style.color = "#dc2626";
      scheduleStatus.textContent =
        "Save a date and time from the calendar first.";
      return;
    }

    try {
      scheduleStatus.style.color = "#5e6e65";
      scheduleStatus.textContent = "Generating meet link...";

      const res = await fetch(`${COMMS_BASE_URL}/create_meet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${course.name} | ${selectedDateKey} ${selectedSlot}`,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || "Failed to generate meet link");
      }

      meetLink.href = result.meet_link || "#";
      meetLink.textContent = result.meet_link || "Meet link unavailable";
      scheduleStatus.style.color = "#16a34a";
      scheduleStatus.textContent = "Meet link generated successfully.";
      addChatMessage("bot", "Meet link generated from backend.");
      
      // Enable feedback panel once meet link is generated
      if (feedbackPanel) {
        feedbackPanel.classList.remove("disabled-feedback");
      }
    } catch (error) {
      console.error(error);
      scheduleStatus.style.color = "#dc2626";
      scheduleStatus.textContent = error.message || "Meet link generation failed.";
    }
  });

  courseChatForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const question = courseChatInput.value.trim();
    if (!question) {
      return;
    }

    addChatMessage("user", question);
    courseChatInput.value = "";

    setTimeout(() => {
      addChatMessage(
        "bot",
        "Thanks. This is a frontend placeholder chat, backend assistant wiring can be added later.",
      );
    }, 220);
  });

  backBtn.addEventListener("click", () => {
    window.location.href = "marketplace.html";
  });

  // Feedback Component Logic
  const ratingSlider = document.getElementById("ratingSlider");
  const ratingValue = document.getElementById("ratingValue");
  const starsVisual = document.getElementById("starsVisual");
  const feedbackText = document.getElementById("feedbackText");
  const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");

  function renderStars(ratingStr) {
    const r = parseFloat(ratingStr) || 0;
    const starsOutOf5 = r;
    let html = "";
    for (let i = 1; i <= 5; i++) {
        let fillPct = 0;
        if (starsOutOf5 >= i) {
            fillPct = 100;
        } else if (starsOutOf5 > i - 1) {
            fillPct = (starsOutOf5 - (i - 1)) * 100;
        }
        html += `
            <div class="star">
                ★
                <div class="star-fill" style="width: ${fillPct}%;">★</div>
            </div>
        `;
    }
    starsVisual.innerHTML = html;
  }

  if (ratingSlider && ratingValue && starsVisual) {
    ratingSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value).toFixed(1);
        ratingValue.textContent = val;
        renderStars(val);
    });
    // Init empty
    renderStars(ratingSlider.value);
  }

  if (submitFeedbackBtn) {
    submitFeedbackBtn.addEventListener("click", () => {
        const data = {
            rating: parseFloat(ratingSlider.value),
            feedback: feedbackText ? feedbackText.value.trim() : ""
        };
        console.log("Course Feedback Submitted:", data);
        
        // Visual feedback
        const oldText = submitFeedbackBtn.textContent;
        submitFeedbackBtn.textContent = "Submitted ✓";
        submitFeedbackBtn.style.backgroundColor = "#16a34a";
        submitFeedbackBtn.style.color = "#fff";
        submitFeedbackBtn.disabled = true;
        
        setTimeout(() => {
            submitFeedbackBtn.textContent = oldText;
            submitFeedbackBtn.style.backgroundColor = "transparent";
            submitFeedbackBtn.style.color = "#16a34a";
            submitFeedbackBtn.disabled = false;
        }, 2000);
    });
  }
});
