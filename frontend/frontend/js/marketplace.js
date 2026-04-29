document.addEventListener('DOMContentLoaded', () => {
	const BASE_URL = 'http://localhost:8004';
	const backBtn = document.getElementById('backBtn');
	const courseSearch = document.getElementById('courseSearch');
	const courseGrid = document.getElementById('courseGrid');
	const emptyState = document.getElementById('emptyState');

	let courses = [];

	function createCourseCard(course) {
		const card = document.createElement('article');
		card.className = 'course-card';

		const thumb = document.createElement('div');
		thumb.className = 'thumb';
		
		const img = document.createElement('img');
		img.src = getThumbnailSrc(course.thumbnail);
		img.alt = course.name;
		thumb.appendChild(img);

		const body = document.createElement('div');
		body.className = 'course-body';

		const name = document.createElement('h2');
		name.className = 'course-name';
		name.textContent = course.name;

		const teacher = document.createElement('p');
		teacher.className = 'meta';
		teacher.textContent = `Teacher: ${course.teacher}`;

		const rating = document.createElement('p');
		rating.className = 'meta';
		rating.textContent = `Rating: ${course.rating} / 5`;

		const duration = document.createElement('p');
		duration.className = 'meta';
		duration.textContent = `Duration: ${course.duration}`;

		const buyRow = document.createElement('div');
		buyRow.className = 'buy-row';

		const cost = document.createElement('span');
		cost.className = 'cost';
		cost.textContent = `${course.credits} credits`;

		const buyBtn = document.createElement('button');
		buyBtn.type = 'button';
		buyBtn.className = 'buy-btn';
		buyBtn.textContent = 'Buy';
		buyBtn.addEventListener('click', () => {
			localStorage.setItem('selectedCourse', JSON.stringify(course));
			window.location.href = 'buy_course.html';
		});

		buyRow.appendChild(cost);
		buyRow.appendChild(buyBtn);

		body.appendChild(name);
		body.appendChild(teacher);
		body.appendChild(rating);
		body.appendChild(duration);
		body.appendChild(buyRow);

		card.appendChild(thumb);
		card.appendChild(body);

		return card;
	}

	function renderCourses(filterText) {
		const q = String(filterText || '').trim().toLowerCase();
		const filtered = courses.filter((course) => {
			if (!q) return true;
			return course.name.toLowerCase().includes(q) || course.teacher.toLowerCase().includes(q);
		});

		courseGrid.innerHTML = '';
		filtered.forEach((course) => {
			courseGrid.appendChild(createCourseCard(course));
		});

		emptyState.hidden = filtered.length !== 0;
	}

	function getThumbnailSrc(thumbnail) {
		const value = String(thumbnail || '').trim();
		if (!value) return '../assets/course_overview.png';
		if (value.startsWith('http://') || value.startsWith('https://')) return value;
		return `../assets/${value}`;
	}

	async function loadCourses() {
		try {
			const res = await fetch(`${BASE_URL}/marketplace_courses`);
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.detail || 'Failed to load courses');
			}

			courses = Array.isArray(data) ? data : [];
			renderCourses(courseSearch.value);
		} catch (error) {
			console.error(error);
			courses = [];
			renderCourses('');
		}
	}

	loadCourses();

	courseSearch.addEventListener('input', () => {
		renderCourses(courseSearch.value);
	});

	backBtn.addEventListener('click', () => {
		window.location.href = 'profile.html';
	});
});


