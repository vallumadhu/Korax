let spawnTimer = 0;
let flowStep = 0;
const flowAssets = ["assets/github.png", "assets/python.png", "assets/blender.png", "assets/React.png", "assets/photoshop.png", "assets/excel.png", "assets/integral.png"];
const FLOW_DURATION = 4000;
let logoAssetIndex = 0;
let leftTargetIndex = 0;
let rightSourceIndex = 0;
const centerBurstPattern = [1, 2, 1, 3, 2];
const centerDelayPattern = [0, 140, 40, 230, 90, 180];
const centerDurationScalePattern = [0.82, 1.05, 0.9, 1.12, 0.96, 1.0];
const centerArcPattern = [42, 58, 48, 66, 52, 60];
const centerSidePattern = [-18, 10, 22, -12, 16, -6];
const centerLogoDelayPattern = [30, 180, 90, 220];
const centerLogoXDriftPattern = [-36, 18, -14, 28];
const centerLogoDepthPattern = [86, 104, 94, 112];

const mainTeacher = document.getElementById("main-teacher");
const mainStudent = document.getElementById("main-student");
const studentsLeft = Array.from(document.querySelectorAll(".student-left"));
const teachersRight = Array.from(document.querySelectorAll(".teacher-right"));
const leftSide = document.querySelector(".left-side");
const rightSide = document.querySelector(".right-side");
const teachHeading = document.querySelector(".big-text.teach");
const learnHeading = document.querySelector(".big-text.learn");
const earnText = document.querySelector(".earn-text");
const creditsContainer = document.getElementById("credits-container");
const registerBtn = document.querySelector(".cta-register");
const signInBtn = document.querySelector(".cta-signin");

const leftSidePositions = { main: { x: 0, y: 0 }, subs: [] };
const rightSidePositions = { main: { x: 0, y: 0 }, subs: [] };

window.addEventListener("resize", setStaticPositions);

function setElementPos(el, x, y) {
	el.style.left = `${x}px`;
	el.style.top = `${y}px`;
}

function setStaticPositions() {
	const w = window.innerWidth;
	const h = window.innerHeight;

	leftSidePositions.main = { x: w * 0.25, y: h * 0.5 };
	leftSidePositions.subs = [
		{ x: w * 0.14, y: h * 0.25 },
		{ x: w * 0.21, y: h * 0.15 },
		{ x: w * 0.28, y: h * 0.20 },
		{ x: w * 0.35, y: h * 0.30 },
		{ x: w * 0.10, y: h * 0.42 }
];

	rightSidePositions.main = { x: w * 0.73, y: h * 0.49 };
	rightSidePositions.subs = [
		{ x: w * 0.7, y: h * 0.22 },
		{ x: w * 0.65, y: h * 0.27 },
		{ x: w * 0.85, y: h * 0.38 },
		{ x: w * 0.62, y: h * 0.38 },
		{ x: w * 0.79, y: h * 0.24 }
	];

	setElementPos(mainTeacher, leftSidePositions.main.x, leftSidePositions.main.y);
	studentsLeft.forEach((el, i) => setElementPos(el, leftSidePositions.subs[i].x, leftSidePositions.subs[i].y));
	setElementPos(mainStudent, rightSidePositions.main.x, rightSidePositions.main.y);
	teachersRight.forEach((el, i) => setElementPos(el, rightSidePositions.subs[i].x, rightSidePositions.subs[i].y));
}

function updateLayout() {
	leftSide.style.opacity = 1;
	rightSide.style.opacity = 1;
	earnText.style.opacity = 1;
}

function createLogoCredit(path, delay = 0) {
	const logo = document.createElement("img");
	logo.className = "credit credit-logo";
	logo.src = flowAssets[logoAssetIndex % flowAssets.length];
	logoAssetIndex += 1;
	logo.alt = "skill logo";
	creditsContainer.appendChild(logo);

	animateAlongPath(logo, path, delay);
	setTimeout(() => logo.remove(), FLOW_DURATION + 300 + delay);
}

function createGreenDot(path, delay = 0, durationScale = 1) {
	const dot = document.createElement("div");
	dot.className = "credit credit-dot";
	creditsContainer.appendChild(dot);

	const duration = Math.max(600, FLOW_DURATION * durationScale);
	animateAlongPath(dot, path, delay, true, duration);
	setTimeout(() => dot.remove(), duration + 300 + delay);
}

function animateAlongPath(dot, path, delay, isDot = false, duration = FLOW_DURATION) {
	let start = null;

	function frame(ts) {
		if (start === null) start = ts;
		const elapsed = ts - start - delay;

		if (elapsed < 0) {
			requestAnimationFrame(frame);
			return;
		}

		if (elapsed >= duration) {
			dot.style.opacity = 0;
			return;
		}

		const t = elapsed / duration;
		const p0 = path[0];
		const p1 = path[1];
		const p2 = path[2];
		const it = 1 - t;
		const x = it * it * p0.x + 2 * it * t * p1.x + t * t * p2.x;
		const y = it * it * p0.y + 2 * it * t * p1.y + t * t * p2.y;

		dot.style.left = `${x}px`;
		dot.style.top = `${y}px`;
		dot.style.opacity = t < 0.2 ? t / 0.2 : (t > 0.8 ? (1 - t) / 0.2 : 1);
		const pulse = 0.96 + Math.sin(ts * 0.02) * 0.06;
		dot.style.transform = `translate(-50%, -50%) scale(${pulse})`;
		if (isDot) {
			dot.style.boxShadow = `0 0 ${9 + Math.sin(ts * 0.03) * 4}px #22c55e, 0 0 20px rgba(34,197,94,0.85)`;
		}

		requestAnimationFrame(frame);
	}

	requestAnimationFrame(frame);
}

function buildControlPoint(start, end, arcLift, sideOffset) {
	const mx = (start.x + end.x) / 2;
	const my = (start.y + end.y) / 2;
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const len = Math.hypot(dx, dy) || 1;

	// Unit perpendicular for side separation between streams.
	const px = -dy / len;
	const py = dx / len;

	return {
		x: mx + px * sideOffset,
		y: my - arcLift + py * sideOffset
	};
}

function getElementCenter(el) {
	const rect = el.getBoundingClientRect();
	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2
	};
}

function spawnCredits() {
	spawnTimer += 1;
	if (spawnTimer < 20) return;
	spawnTimer = 0;

	if (flowStep % 2 === 0) {
		// Left teacher sends to left students
		const idx = leftTargetIndex % leftSidePositions.subs.length;
		leftTargetIndex += 1;
		const teacher = leftSidePositions.main;
		const student = leftSidePositions.subs[idx];

		// Logos: teacher -> student
		const logoControl = buildControlPoint(teacher, student, 96, 44);
		createLogoCredit([teacher, logoControl, student]);

		// Green dots: student -> teacher
		const dotControl = buildControlPoint(student, teacher, 10, -44);
		createGreenDot([student, dotControl, teacher], 150);
	} else {
		// Right teachers send to main student
		const idx = rightSourceIndex % rightSidePositions.subs.length;
		rightSourceIndex += 1;
		const teacher = rightSidePositions.subs[idx];
		const student = rightSidePositions.main;

		// Logos: teacher -> student
		const logoControl = buildControlPoint(teacher, student, 96, -44);
		createLogoCredit([teacher, logoControl, student]);

		// Green dots: student -> teacher
		const dotControl = buildControlPoint(student, teacher, 1, 44);
		createGreenDot([student, dotControl, teacher], 150);
	}

	// Center stream: Teach heading -> Learn heading
	if (teachHeading && learnHeading) {
		const teachCenter = getElementCenter(teachHeading);
		const learnCenter = getElementCenter(learnHeading);

		// Make center stream 10% shorter by pulling endpoints toward midpoint.
		const mid = {
			x: (teachCenter.x + learnCenter.x) / 2,
			y: (teachCenter.y + learnCenter.y) / 2
		};
		const shrink = 0.7;
		const centerStart = {
			x: mid.x + (teachCenter.x - mid.x) * shrink,
			y: mid.y + (teachCenter.y - mid.y) * shrink
		};
		const centerEnd = {
			x: mid.x + (learnCenter.x - mid.x) * shrink,
			y: mid.y + (learnCenter.y - mid.y) * shrink
		};

		const burstCount = centerBurstPattern[flowStep % centerBurstPattern.length];
		for (let i = 0; i < burstCount; i++) {
			const idx = (flowStep + i) % centerDelayPattern.length;
			const headingControl = buildControlPoint(
				centerStart,
				centerEnd,
				centerArcPattern[idx],
				centerSidePattern[idx]
			);
			createGreenDot(
				[centerStart, headingControl, centerEnd],
				centerDelayPattern[idx],
				centerDurationScalePattern[idx]
			);
		}

		// Reverse logo stream: Learn -> Teach on a separate lane.
		const logoIdx = flowStep % centerLogoDelayPattern.length;
		const earnCenter = getElementCenter(earnText);
		const reverseLogoControl = {
			x: earnCenter.x + centerLogoXDriftPattern[logoIdx],
			y: earnCenter.y + centerLogoDepthPattern[logoIdx]
		};
		createLogoCredit(
			[centerEnd, reverseLogoControl, centerStart],
			centerLogoDelayPattern[logoIdx]
		);
	}

	flowStep += 1;
}

function animate() {
	updateLayout();
	spawnCredits();
	requestAnimationFrame(animate);
}

setStaticPositions();
animate();

const revealItems = Array.from(document.querySelectorAll(".reveal"));
if ("IntersectionObserver" in window) {
	const revealObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
				}
			});
		},
		{ threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
	);

	revealItems.forEach((item, index) => {
		item.style.transitionDelay = `${index * 70}ms`;
		revealObserver.observe(item);
	});
} else {
	revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (registerBtn) {
	registerBtn.addEventListener("click", () => {
		window.location.href = "pages/register.html";
	});
}

if (signInBtn) {
	signInBtn.addEventListener("click", () => {
		window.location.href = "pages/sign_in.html";
	});
}




