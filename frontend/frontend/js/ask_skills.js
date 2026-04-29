document.addEventListener('DOMContentLoaded', async () => {

	const BASE_URL = "http://localhost:8004";

	const form = document.getElementById('skillsForm');
	const skillInput = document.getElementById('skillInput');
	const suggestionsList = document.getElementById('suggestionsList');
	const selectedSkillsList = document.getElementById('selectedSkills');
	const dropdownArrow = document.getElementById('dropdownArrow');
	const status = document.getElementById('status');

	const selectedSkills = [];
	let staticSkills = [];

	async function fetchSkills() {
		try {
			const res = await fetch(`${BASE_URL}/skills`);
			if (!res.ok) throw new Error("Failed to fetch skills");
			return await res.json();
		} catch (err) {
			console.error("Error fetching skills:", err);
			return [];
		}
	}

	const data = await fetchSkills();

	staticSkills = data.length > 0 ? data.map(skill => ({
		value: skill.id,
		label: skill.skill_name
	})) : [
		{ value: 'python', label: 'Python' },
		{ value: 'java', label: 'Java' },
		{ value: 'html', label: 'HTML' },
		{ value: 'javascript', label: 'JavaScript' },
		{ value: 'other', label: 'Other' }
	];

	console.log("SKILLS:", staticSkills);

	renderSkills();

	function formatSkill(value) {
		const skill = staticSkills.find(s => s.value === value);
		return skill ? skill.label : value;
	}



	function renderSkills() {
		selectedSkillsList.innerHTML = '';

		if (selectedSkills.length === 0) {
			const emptyItem = document.createElement('li');
			emptyItem.className = 'skill-item-empty';
			emptyItem.textContent = 'No skills selected yet.';
			selectedSkillsList.appendChild(emptyItem);
			return;
		}

		selectedSkills.forEach((skill) => {
			const item = document.createElement('li');
			item.className = 'skill-item';

			const name = document.createElement('span');
			name.textContent = formatSkill(skill);

			const removeBtn = document.createElement('button');
			removeBtn.type = 'button';
			removeBtn.className = 'remove-skill';
			removeBtn.setAttribute('aria-label', `Remove ${formatSkill(skill)}`);
			removeBtn.dataset.skill = skill;
			removeBtn.innerHTML = '&times;'; // use times symbol for the x

			item.appendChild(name);
			item.appendChild(removeBtn);
			selectedSkillsList.appendChild(item);
		});
	}
	
	function renderSuggestions(query) {
		suggestionsList.innerHTML = '';
		
		// If query is empty and we're showing the default dropdown
		if (!query && dropdownArrow.classList.contains('open')) {
			const examples = staticSkills.slice(0, 5); // Show first 5 as examples
			examples.forEach(skill => {
				const li = document.createElement('li');
				li.className = 'suggestion-item';
				li.textContent = skill.label;
				li.dataset.value = skill.value;
				li.addEventListener('click', () => addSkill(skill.value));
				suggestionsList.appendChild(li);
			});
			suggestionsList.hidden = false;
			return;
		}

		if (!query) {
			suggestionsList.hidden = true;
			return;
		}

		const lowerQuery = query.toLowerCase();
		const matches = staticSkills.filter(skill => 
			skill.label.toLowerCase().includes(lowerQuery)
		);

		if (matches.length === 0) {
			const noResults = document.createElement('li');
			noResults.className = 'suggestion-item no-results';
			noResults.textContent = 'No skills found.';
			suggestionsList.appendChild(noResults);
			suggestionsList.hidden = false;
			return;
		}

		matches.forEach(skill => {
			const li = document.createElement('li');
			li.className = 'suggestion-item';
			li.textContent = skill.label;
			li.dataset.value = skill.value;

			li.addEventListener('click', () => {
				addSkill(skill.value);
			});

			suggestionsList.appendChild(li);
		});

		suggestionsList.hidden = false;
	}

	function addSkill(skillValue) {
		status.textContent = '';
		
		if (selectedSkills.includes(skillValue)) {
			status.style.color = '#dc2626';
			status.textContent = 'That skill is already added.';
		} else {
			selectedSkills.push(skillValue);
			renderSkills();
		}
		
		skillInput.value = '';
		suggestionsList.hidden = true;
		skillInput.focus();
	}

	skillInput.addEventListener('input', (e) => {
		dropdownArrow.classList.remove('open');
		renderSuggestions(e.target.value.trim());
	});

	dropdownArrow.addEventListener('click', (e) => {
		e.stopPropagation();
		const isOpen = dropdownArrow.classList.toggle('open');
		if (isOpen) {
			renderSuggestions('');
		} else {
			suggestionsList.hidden = true;
		}
	});

	// Hide suggestions when clicking outside
	document.addEventListener('click', (e) => {
		if (!skillInput.contains(e.target) && !suggestionsList.contains(e.target) && !dropdownArrow.contains(e.target)) {
			suggestionsList.hidden = true;
			dropdownArrow.classList.remove('open');
		}
	});

	// Focus input shows suggestions if not empty
	skillInput.addEventListener('focus', () => {
		if (skillInput.value.trim()) {
			suggestionsList.hidden = false;
		}
	});

	selectedSkillsList.addEventListener('click', (ev) => {
		const target = ev.target;
		if (!(target instanceof HTMLButtonElement)) {
			return;
		}

		if (!target.classList.contains('remove-skill')) {
			return;
		}

		const skill = target.dataset.skill;
		const index = selectedSkills.indexOf(skill);
		if (index >= 0) {
			selectedSkills.splice(index, 1);
			renderSkills();
			status.textContent = '';
		}
	});

	form.addEventListener('submit', (ev) => {
		ev.preventDefault();
		status.textContent = '';

		if (selectedSkills.length === 0) {
			status.style.color = '#dc2626';
			status.textContent = 'Please add at least one skill to continue.';
			return;
		}

		status.style.color = '#16a34a';
		status.textContent = `Skills verified: ${selectedSkills.length} selected.`;

		localStorage.setItem('selectedSkills', JSON.stringify(selectedSkills));
		window.location.href = 'verify_skills.html';
	});

	renderSkills();
});


