document.addEventListener('DOMContentLoaded', () => {
	const header = document.createElement('header');
	header.className = 'global-hero-nav';

	const currentPath = window.location.pathname;

	const links = [

		{ name: 'Profile', url: 'profile.html' },
		{ name: 'Select Skills', url: 'ask_skills.html' },
		{ name: 'Marketplace', url: 'marketplace.html' },
		{ name: 'Upload Course', url: 'upload_course.html' }
	];

	let credits = 500; // Mock credits for the hero
	let userEmail = '';
	try {
			const stored = localStorage.getItem('currentUser');
			if (stored) {
					const user = JSON.parse(stored);
					if (user.credits !== undefined) credits = user.credits;
					if (user.email) userEmail = user.email;
			}
	} catch (e) {}

	// Try localStorage user_email (saved during login)
	if (!userEmail) {
		userEmail = localStorage.getItem('user_email') || '';
	}

	// Try to extract email from JWT token if still not found
	if (!userEmail) {
		try {
			const token = localStorage.getItem('access_token');
			if (token) {
				const payload = JSON.parse(atob(token.split('.')[1]));
				if (payload.sub) userEmail = payload.sub;
				else if (payload.email) userEmail = payload.email;
			}
		} catch (e) {}
	}

	const avatarLetter = userEmail ? userEmail[0].toUpperCase() : 'U';

	let linksHtml = links.map(link => {
		const isActive = currentPath.includes(link.url) ? 'active' : '';
		return `<a href="${link.url}" class="${isActive}">${link.name}</a>`;
	}).join('');

	let homeLink = '../index.html';
	if (currentPath.includes('index.html') || currentPath === '/') {
		homeLink = 'index.html';
	}

	header.innerHTML = `
		<a href="profile.html" class="brand">Korax</a>
		<div class="nav-links">
			${linksHtml}
		</div>
		<div class="user-info">
			<span class="credits">${credits} Credits</span>
			<a href="profile.html" class="nav-avatar" title="Profile">${avatarLetter}</a>
			<button id="globalLogoutBtn" class="logout-btn">Logout</button>
		</div>
	`;

	document.body.prepend(header);

	const logoutBtn = document.getElementById('globalLogoutBtn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', () => {
			localStorage.clear();
			window.location.href = homeLink;
		});
	}
});
