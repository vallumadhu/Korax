// dashboard.js
// Handles the dashboard interactions: marketplace navigation, add-skill modal,
// skill chip rendering and simple persistence using localStorage.

document.addEventListener('DOMContentLoaded', () => {
  const skillsKey = 'korax:skills';
  const skillsList = document.getElementById('skills-list');
  const openAddSkill = document.getElementById('open-add-skill');
  const addSkillModal = document.getElementById('addSkillModal');
  const closeModal = document.getElementById('closeModal');
  const addSkillForm = document.getElementById('addSkillForm');
  const cancelAdd = document.getElementById('cancelAdd');
  const openMarketplace = document.getElementById('open-marketplace');
  const exportBtn = document.getElementById('export-skills');

  // Load skills from localStorage
  function loadSkills(){
    try{
      const raw = localStorage.getItem(skillsKey) || '[]';
      return JSON.parse(raw);
    }catch(e){
      return [];
    }
  }

  // Save skills
  function saveSkills(skills){
    localStorage.setItem(skillsKey, JSON.stringify(skills));
  }

  // Render skill chips
  function renderSkills(){
    const skills = loadSkills();
    skillsList.innerHTML = '';
    if(skills.length === 0){
      const empty = document.createElement('div');
      empty.className = 'chip empty';
      empty.textContent = 'No skills yet — add one';
      skillsList.appendChild(empty);
      return;
    }
    skills.forEach((s, idx) => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.tabIndex = 0;
      chip.title = 'Click to remove';
      chip.textContent = s.name + (s.level? ' — ' + s.level : '');
      // click to remove
      chip.addEventListener('click', ()=>{
        if(!confirm(`Remove skill: ${s.name}?`)) return;
        const all = loadSkills();
        all.splice(idx,1);
        saveSkills(all);
        renderSkills();
      });
      skillsList.appendChild(chip);
    });
  }

  // Modal helpers
  function openModal(){ addSkillModal.classList.remove('hidden'); }
  function closeModalFn(){ addSkillModal.classList.add('hidden'); }

  // Wire buttons
  if(openAddSkill) openAddSkill.addEventListener('click', openModal);
  if(closeModal) closeModal.addEventListener('click', closeModalFn);
  if(cancelAdd) cancelAdd.addEventListener('click', closeModalFn);

  // Add skill form submit
  if(addSkillForm){
    addSkillForm.addEventListener('submit', function(e){
      e.preventDefault();
      const nameEl = document.getElementById('skillName');
      const levelEl = document.getElementById('skillLevel');
      const name = (nameEl.value || '').trim();
      const level = (levelEl.value || '').trim();
      if(!name){
        alert('Please enter a skill name');
        return;
      }
      const skills = loadSkills();
      skills.push({name, level});
      saveSkills(skills);
      renderSkills();
      addSkillForm.reset();
      closeModalFn();
    });
  }

  // Marketplace action: replace with real navigation
  if(openMarketplace){
    openMarketplace.addEventListener('click', function(){
      // For now we'll open a placeholder — update to your marketplace route
      window.alert('Opening marketplace (placeholder)');
      // window.location.href = '/marketplace.html';
    });
  }

  // Export skills as JSON file
  if(exportBtn){
    exportBtn.addEventListener('click', ()=>{
      const skills = loadSkills();
      const blob = new Blob([JSON.stringify(skills, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'korax-skills.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  // close modal on outside click
  if(addSkillModal){
    addSkillModal.addEventListener('click', (e)=>{
      if(e.target === addSkillModal) closeModalFn();
    });
  }

  // initial render
  renderSkills();
});
