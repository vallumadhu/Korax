  const avatar = document.getElementById('avatar');
  const fullName = document.getElementById('fullName');
  const emailAddr = document.getElementById('emailAddr');
  const ageEl = document.getElementById('age');
  const qualEl = document.getElementById('qualification');
  const descEl = document.getElementById('description');
  const teachSkillsList = document.getElementById('teachSkillsList');
  const learnedSkillsList = document.getElementById('learnedSkillsList');
  const calendarMonthLabel = document.getElementById('calendarMonthLabel');
  const scheduleGrid = document.getElementById('scheduleGrid');
  const logoutBtn = document.getElementById('logoutBtn');
  const BASE_URL = "http://localhost:8004";

  async function getProfile() {
      const token = localStorage.getItem("access_token");

      if (!token) {
          throw new Error("No session found");
      }

      const res = await fetch(`${BASE_URL}/profile`, {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`,
          },
      });

      const data = await res.json();

      if (!res.ok) {
          throw new Error(data.detail || "Failed to fetch profile");
      }

      return data;
  }


  document.addEventListener("DOMContentLoaded", async () => {
      try {
          const profile = await getProfile();
          console.log("PROFILE:", profile);

          fullName.textContent = profile.full_name;
          emailAddr.textContent = profile.email;
          ageEl.textContent = profile.age ?? "-";
          qualEl.textContent = profile.qualification ?? "-";
          descEl.textContent = profile.short_ds ?? "-";

          avatar.textContent =
              (profile.email?.[0] || profile.full_name?.[0] || 'U').toUpperCase();

      } catch (err) {
          console.error(err);
      }
  });
  

  function loadCurrent(){
    try{ return JSON.parse(localStorage.getItem('currentUser')||'null'); }
    catch { return null; }
  }

  function loadUsers(){
    try{ return JSON.parse(localStorage.getItem('users')||'[]'); }
    catch { return []; }
  }

  function normalizeList(value){
    if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
    if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
    return [];
  }

  function renderChips(container, list, emptyText){
    container.innerHTML = '';
    const items = list.length ? list : [emptyText];
    items.forEach((text, idx) => {
      const chip = document.createElement('span');
      chip.className = idx === 0 && !list.length ? 'chip empty' : 'chip';
      chip.textContent = text;
      container.appendChild(chip);
    });
  }

  function normalizeSchedule(raw){
    const list = Array.isArray(raw) ? raw : [];
    return list
      .map((item) => {
        const date = item?.date || item?.day || item?.when || '';
        const title = item?.title || item?.topic || 'Session';
        const type = item?.type || item?.mode || 'Planned';
        const withWhom = item?.with || item?.partner || item?.withWhom || '';
        const parsed = new Date(date);
        return {
          date,
          parsed,
          title,
          type,
          withWhom,
          valid: !Number.isNaN(parsed.getTime())
        };
      })
      .filter(item => item.valid)
      .sort((a, b) => a.parsed - b.parsed);
  }

  function renderSchedule(schedule){
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay();
    const daysInMonth = last.getDate();

    calendarMonthLabel.textContent = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    scheduleGrid.innerHTML = '';

    const byDay = new Map();
    schedule.forEach((item) => {
      if (item.parsed.getFullYear() === year && item.parsed.getMonth() === month) {
        const day = item.parsed.getDate();
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day).push(item);
      }
    });

    for (let i = 0; i < startWeekday; i++) {
      const empty = document.createElement('div');
      empty.className = 'day-cell muted';
      scheduleGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      if (byDay.has(d)) cell.classList.add('has-item');

      const dayNumber = document.createElement('div');
      dayNumber.className = 'day-number';
      dayNumber.textContent = String(d);
      cell.appendChild(dayNumber);

      if (byDay.has(d)) {
        const dayItems = byDay.get(d);
        dayItems.slice(0, 2).forEach((item) => {
          const pill = document.createElement('div');
          pill.className = 'event-pill';
          pill.title = `${item.title} - ${item.type}`;
          pill.textContent = `${item.type}: ${item.title}`;
          cell.appendChild(pill);
        });

        if (dayItems.length > 2) {
          const more = document.createElement('div');
          more.className = 'event-more';
          more.textContent = `+${dayItems.length - 2} more`;
          cell.appendChild(more);
        }
      }

      scheduleGrid.appendChild(cell);
    }
  }

  function showProfile(user){
    fullName.textContent = user.name || user.username || user.email || 'User';
    emailAddr.textContent = user.email || 'user@example.com';
    ageEl.textContent = user.age || '-';
    qualEl.textContent = user.qualification || user.Qualification || '-';
    descEl.textContent = user.description || '-';
    avatar.textContent = (user.email || user.name || user.username || 'U').slice(0,1).toUpperCase();

    let teachSkills = normalizeList(user.teachSkills || user.skillsTeach || user.canTeach);
    let learnedSkills = normalizeList(user.learnedSkills || user.skillsLearned || user.learningSkills || user.skillsLearning);
    let schedule = normalizeSchedule(user.schedule || user.sessions || user.plannedLectures);

    if (!teachSkills.length) {
      teachSkills = ['Python Basics', 'Web Development', 'Data Structures'];
    }
    if (!learnedSkills.length) {
      learnedSkills = ['JavaScript', 'UI Design', 'Linear Algebra'];
    }
    if (!schedule.length) {
      const now = new Date();
      schedule = normalizeSchedule([
        { date: new Date(now.getFullYear(), now.getMonth(), 4).toISOString(), title: 'Python Basics', type: 'Class' },
        { date: new Date(now.getFullYear(), now.getMonth(), 11).toISOString(), title: 'React UI', type: 'Mentoring' },
        { date: new Date(now.getFullYear(), now.getMonth(), 15).toISOString(), title: 'System Design', type: 'Interview' },
        { date: new Date(now.getFullYear(), now.getMonth(), 22).toISOString(), title: 'Database Optimization', type: 'Workshop' },
        { date: new Date(now.getFullYear(), now.getMonth(), 28).toISOString(), title: 'Mock Algorithms', type: 'Session' }
      ]);
    }

    renderChips(teachSkillsList, teachSkills, 'No teach skills added');
    renderChips(learnedSkillsList, learnedSkills, 'No learned skills recorded');
    renderSchedule(schedule);
  }

  const current = loadCurrent() || {};
  const users = loadUsers();
  const user = users.find(u => (u.id && current.id && u.id === current.id) || (u.email && u.email.toLowerCase() === (current.email||'').toLowerCase()));
  showProfile(user || current);

  logoutBtn.addEventListener('click', ()=>{
    localStorage.removeItem('currentUser');
    showProfile({});
  });

  const calendarToggleBtn = document.getElementById('calendarToggleBtn');
  const calendarModal = document.getElementById('calendarModal');
  const closeCalendarBtn = document.getElementById('closeCalendarBtn');

  if (calendarToggleBtn && calendarModal) {
    calendarToggleBtn.addEventListener('click', () => {
      calendarModal.classList.toggle('hidden');
    });
  }

  if (closeCalendarBtn && calendarModal) {
    closeCalendarBtn.addEventListener('click', () => {
      calendarModal.classList.add('hidden');
    });
  }

  (async () => {
      const avatar = document.getElementById("avatar");
      const fullName = document.getElementById("fullName");
      const emailAddr = document.getElementById("emailAddr");
      const ageEl = document.getElementById("age");
      const qualEl = document.getElementById("qualification");
      const descEl = document.getElementById("description");
      const logoutBtn = document.getElementById("logoutBtn");

      try {
          const fetchedUser = await getProfile();

          // Fill UI
          fullName.textContent = fetchedUser.full_name || "User";
          emailAddr.textContent = fetchedUser.email || "user@example.com";
          ageEl.textContent = fetchedUser.age || "-";
          qualEl.textContent = fetchedUser.qualification || "-";
          descEl.textContent = fetchedUser.short_ds || "-";

          avatar.textContent =
              (fetchedUser.email || fetchedUser.full_name || 'U')[0].toUpperCase();

      } catch (err) {
          console.error(err);

          // alert("Session expired. Please login again.");
          localStorage.removeItem("access_token");
          // window.location.href = "sign_in.html";
      }

      // Logout
      logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("access_token");
          window.location.href = "sign_in.html";
      });
  })();


