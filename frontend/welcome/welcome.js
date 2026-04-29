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

  /* ---- Intersection Observer for Info Blocks ---- */
  const observerOptions = {
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.info-block').forEach(block => {
    observer.observe(block);
  });

  /* ---- Three.js Background Effect ---- */
  initThreeBackground();
});

function initThreeBackground() {
  const container = document.getElementById('three-canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Create a particle system
  const particlesCount = 1500;
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  
  const greenColor = new THREE.Color('#16a34a');

  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    if (i % 3 === 0) colors[i] = greenColor.r;
    if (i % 3 === 1) colors[i] = greenColor.g;
    if (i % 3 === 2) colors[i] = greenColor.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.015,
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  camera.position.z = 3;

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);
    
    // Smooth rotation
    points.rotation.y += 0.001;
    points.rotation.x += 0.0005;

    // React to mouse
    points.rotation.y += mouseX * 0.05;
    points.rotation.x += mouseY * 0.05;

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}
