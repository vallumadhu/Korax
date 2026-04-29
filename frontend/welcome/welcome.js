// welcome.js
// Simple interactions and placeholders for the Korax welcome page.
// Add more behavior as your app grows (analytics, modals, fetching dynamic content, etc.)

document.addEventListener('DOMContentLoaded', function(){
	// Set current year in footer
	const yearEl = document.getElementById('year');
	if(yearEl) yearEl.textContent = new Date().getFullYear();

	// CTA: navigate to the login/signup page. Replace with SPA navigation if used.
	const cta = document.getElementById('cta-get-started');
	if(cta){
		cta.addEventListener('click', function(){
			// If you use a router, call router.navigate('/login') instead
			window.location.href = '../login_signup/login.html';
		});
	}

	// Employer CTA: navigate to employer login page
	const ctaEmployer = document.getElementById('cta-employer');
	if(ctaEmployer){
		ctaEmployer.addEventListener('click', function(){
			window.location.href = '../employer_login/emp_login.html';
		});
	}

	// Example: wire nav links to open login/signup quickly
	const navLogin = document.getElementById('nav-login');
	const navSignup = document.getElementById('nav-signup');
	if(navLogin) navLogin.addEventListener('click', ()=>{/* default link handles navigation */});
	if(navSignup) navSignup.addEventListener('click', ()=>{/* default link handles navigation */});
	const navEmployer = document.getElementById('nav-employer');
	if(navEmployer) navEmployer.addEventListener('click', ()=>{/* default link handles navigation */});
	// Developer note: add event listeners for analytics or feature toggles here.

	/* ---- Interactive features for welcome page ---- */
	// Smooth scroll for Learn more link
	const learnLink = document.querySelector('a[href="#features"]');
	if(learnLink){
		learnLink.addEventListener('click', function(e){
			e.preventDefault();
			const target = document.getElementById('features');
			if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
		});
	}

	// Reveal features when they enter the viewport
	const features = document.querySelectorAll('.feature');
	if('IntersectionObserver' in window && features.length){
		const obs = new IntersectionObserver((entries, o)=>{
			entries.forEach(e => {
				if(e.isIntersecting) {
					e.target.classList.add('visible');
					o.unobserve(e.target);
				}
			});
		},{threshold:0.15});
		features.forEach(f => obs.observe(f));
	} else {
		// fallback: make features visible immediately
		features.forEach(f => f.classList.add('visible'));
	}

	// Click to expand feature card for more details (placeholder)
	features.forEach(f => {
		f.addEventListener('click', ()=>{
			const expanded = f.classList.contains('expanded');
			// collapse any other expanded
			features.forEach(x => x.classList.remove('expanded'));
			if(!expanded) f.classList.add('expanded');
		});
	});

	// subtle media animation on load
	const media = document.querySelector('.media-box');
	if(media){
		media.style.transform = 'scale(.98)';
		media.style.transition = 'transform .5s ease';
		requestAnimationFrame(()=> media.style.transform = 'scale(1)');
	}
});

