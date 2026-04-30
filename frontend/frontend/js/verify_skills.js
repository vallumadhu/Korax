document.addEventListener('DOMContentLoaded', () => {
    let currentModule = 1;
    const totalModules = 5;

    const moduleItems = document.querySelectorAll('.module-item');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercent = document.getElementById('progress-percent');
    const completeBtn = document.getElementById('complete-btn');
    const moduleDisplay = document.getElementById('module-display');
    const finalSuccess = document.getElementById('final-success');
    
    // UI Elements to update
    const currentModuleTitle = document.getElementById('current-module-title');
    const moduleDescription = document.getElementById('module-description');
    const skillTitle = document.getElementById('skill-title');
    
    // Quiz & Code elements
    const quizQuestion = document.getElementById('quiz-question');
    const quizAnswerInput = document.getElementById('quiz-answer-input');
    const quizFeedback = document.getElementById('quiz-feedback');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    
    const codeInstruction = document.getElementById('code-instruction');
    const codeInput = document.getElementById('code-input');
    const codeFeedback = document.getElementById('code-feedback');
    const codeResults = document.getElementById('code-results');
    const runCodeBtn = document.getElementById('run-code-btn');
    const testCodeBtn = document.getElementById('test-code-btn');

    const video = document.getElementById("video");
    const canvas = document.getElementById("overlay");
    const ctx = canvas.getContext("2d");
    const gazeInfo = document.getElementById("gaze-info");

    let cheatingScore = 0;
    let lastAwayTime = null;

    let quizVerified = false;
    let codeVerified = false;

    // Get skill from local storage
    const selectedSkill = localStorage.getItem('selectedSkill') || 'Web Development';
    skillTitle.textContent = `${selectedSkill} Mastery`;

    const loadingScreen = document.getElementById("loading-screen");
    const loadingMessage = document.getElementById("loading-message");

    const BASE_URL = "http://localhost:8000";
    let subtopics = [];
    let moduleData = [];
    let questionPromises = [];

    // Helpers to format and escape output for display
    function escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatValue(val) {
        if (val === null) return 'null';
        if (val === undefined) return '';
        if (typeof val === 'string') return escapeHtml(val);
        try {
            return escapeHtml(JSON.stringify(val, null, 2));
        } catch (e) {
            return escapeHtml(String(val));
        }
    }

    function normalizeQuestionData(payload, subtopic) {
        const data = Array.isArray(payload) ? payload[0] : payload;

        if (!data || typeof data !== 'object') {
            return {
                title: subtopic,
                desc: `Practice ${subtopic}.`,
                quiz: {
                    question: `Explain ${subtopic} in your own words.`,
                    placeholder: 'Type your explanation here...',
                    expected_points: []
                },
                code: {
                    instruction: `Write code related to ${subtopic}.`
                },
                test_cases: []
            };
        }

        return {
            title: data.title || subtopic,
            desc: data.desc || data.description || `Practice ${subtopic}.`,
            quiz: {
                question: data.question || data.quiz?.question || `Explain ${subtopic} in your own words.`,
                placeholder: data.placeholder || data.quiz?.placeholder || 'Type your explanation here...',
                expected_points: data.expected_points || data.quiz?.expected_points || []
            },
            code: {
                instruction: data.code?.instruction || data.instruction || `Write code related to ${subtopic}.`
            },
            test_cases: data.test_cases || data.tests || []
        };
    }

    function createPlaceholderModule(subtopic) {
        return {
            title: subtopic,
            desc: `Practice ${subtopic}.`,
            quiz: {
                question: 'Loading question...',
                placeholder: 'Loading question...',
                expected_points: []
            },
            code: {
                instruction: 'Loading challenge...'
            },
            test_cases: [],
            loaded: false
        };
    }

    async function fetchSubtopics(skill) {
        console.log('[verify_skills] fetching subtopics for', skill);
        const res = await fetch(`${BASE_URL}/get_5_subtopics`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: `Give 5 subtopics for ${skill}`
            })
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch subtopics: ${res.status}`);
        }

        return await res.json();
    }

    async function fetchQuestions(skill, subtopic) {
        console.log('[verify_skills] fetching questions for', skill, subtopic);
        const res = await fetch(`${BASE_URL}/get_questions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                topic: skill,
                subtopic: subtopic
            })
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch questions for ${subtopic}: ${res.status}`);
        }

        return await res.json();
    }

    async function ensureModuleLoaded(moduleIndex) {
        const moduleItem = moduleData[moduleIndex];
        if (!moduleItem || moduleItem.loaded) {
            return moduleItem;
        }

        if (!questionPromises[moduleIndex]) {
            const subtopic = subtopics[moduleIndex - 1];
            questionPromises[moduleIndex] = fetchQuestions(selectedSkill, subtopic)
                .then((payload) => {
                    const normalized = normalizeQuestionData(payload, subtopic);
                    moduleData[moduleIndex] = {
                        ...normalized,
                        loaded: true
                    };
                    return moduleData[moduleIndex];
                })
                .catch((error) => {
                    console.error('[verify_skills] failed to load module question', moduleIndex, error);
                    const fallback = normalizeQuestionData({}, subtopic);
                    moduleData[moduleIndex] = {
                        ...fallback,
                        loaded: true
                    };
                    return moduleData[moduleIndex];
                });
        }

        return questionPromises[moduleIndex];
    }

    navigator.mediaDevices.getUserMedia({ 
        video: { width: 200, height: 150 } 
    })
        .then(stream => {
            video.srcObject = stream;
        });

    
    const captureCanvas = document.createElement("canvas");
    const captureCtx = captureCanvas.getContext("2d");

    async function sendFrame() {
        if (!video.videoWidth) {
            requestAnimationFrame(sendFrame);
            return;
        }

        captureCanvas.width = 200;
        captureCanvas.height = 150;

        canvas.width = 200;
        canvas.height = 150;

        captureCtx.drawImage(video, 0, 0);

        captureCanvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append("frame", blob, "frame.jpg");

            try {
                const res = await fetch("http://127.0.0.1:8000/track-eyes", {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (data.status === "ok") {
                    gazeInfo.innerText = "Gaze: " + data.gaze;

                    handleGaze(data.gaze);

                } else {
                    gazeInfo.innerText = "No face detected";
                    cheatingScore += 1; // suspicious
                }

            } catch (err) {
                console.error(err);
            }
        }, "image/jpeg", 0.6);

        setTimeout(sendFrame, 150); // 6-7 FPS
    }
    function handleGaze(gaze) {
        if (gaze === "center") {
            lastAwayTime = null;
            gazeInfo.style.color = "white";
            return;
        }

        if (!lastAwayTime) {
            lastAwayTime = Date.now();
        }

        const awayDuration = Date.now() - lastAwayTime;

        if (awayDuration > 2000) { // 2 sec looking away
            cheatingScore += 1;
            lastAwayTime = Date.now();
            gazeInfo.style.color = "red";
            gazeInfo.innerText = "⚠️ LOOK AT SCREEN";
            console.log("⚠️ Suspicious behavior");
        }
    }
    video.onloadedmetadata = () => {
        sendFrame();
    };
    function updateUI() {
        // Update modules sidebar
        moduleItems.forEach((item, index) => {
            const mNum = index + 1;
            item.classList.remove('active', 'locked', 'completed');
            
            if (mNum === currentModule) {
                item.classList.add('active');
                item.querySelector('.status-icon').textContent = '○';
            } else if (mNum < currentModule) {
                item.classList.add('completed');
                item.querySelector('.status-icon').textContent = '✓';
            } else {
                item.classList.add('locked');
                item.querySelector('.status-icon').textContent = '🔒';
            }
        });

        // Update progress
        const progress = ((currentModule - 1) / totalModules) * 100;
        progressBarFill.style.width = `${progress}%`;
        progressPercent.textContent = `${Math.round(progress)}%`;

        // Update Content
        if (currentModule <= totalModules) {
            const currentData = moduleData[currentModule] || moduleData[currentModule - 1];
            currentModuleTitle.textContent = currentData.title;
            moduleDescription.textContent = currentData.desc;
            completeBtn.textContent = currentModule === totalModules ? "Finish Verification" : "Complete & Next Module";
            const isLoaded = Boolean(currentData.loaded);
            submitQuizBtn.disabled = !isLoaded;
            runCodeBtn.disabled = !isLoaded;
            completeBtn.disabled = !isLoaded;
            
            // Update Quiz
            quizQuestion.textContent = currentData.quiz.question;
            quizAnswerInput.value = '';
            quizAnswerInput.placeholder = currentData.quiz.placeholder;
            quizFeedback.className = 'feedback-msg hidden';
            quizVerified = false;

            // Update Code
            codeInstruction.textContent = currentData.code.instruction;
            codeInput.value = '';
            codeFeedback.className = 'feedback-msg hidden';
            codeVerified = false;

            if (!isLoaded) {
                ensureModuleLoaded(currentModule).then(() => {
                    if (currentModule <= totalModules) {
                        updateUI();
                    }
                });
            }

        } else {
            // Show Success
            moduleDisplay.classList.add('hidden');
            finalSuccess.classList.remove('hidden');
            progressBarFill.style.width = '100%';
            progressPercent.textContent = '100%';
        }
    }

    submitQuizBtn.addEventListener('click', () => {
        const answer = quizAnswerInput.value.trim();
        if (!answer) {
            quizFeedback.textContent = "Enter your answer first.";
            quizFeedback.className = "feedback-msg error";
            quizVerified = false;
            return;
        }

        const currentModuleData = moduleData[currentModule] || moduleData[currentModule - 1] || {};

        quizFeedback.textContent = "Evaluating answer...";
        quizFeedback.className = "feedback-msg";

        fetch(`${BASE_URL}/submit_answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: currentModuleData.quiz?.question || quizQuestion.textContent,
                expected_points: currentModuleData.quiz?.expected_points || [],
                answer: answer
            })
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('[verify_skills] submit_answer response', data);

                const isPass = data.pass === true || data.pass === 'true' || (typeof data.score === 'number' && data.score >= 7);
                const scoreText = typeof data.score !== 'undefined' ? `Score: ${data.score}` : '';
                const reasonText = data.reason ? `Reason: ${data.reason}` : '';
                const message = [scoreText, reasonText].filter(Boolean).join(' | ');

                if (isPass) {
                    quizFeedback.textContent = message || "Answer accepted.";
                    quizFeedback.className = "feedback-msg success";
                    quizVerified = true;
                } else {
                    quizFeedback.textContent = message || "Answer did not meet the required standard.";
                    quizFeedback.className = "feedback-msg error";
                    quizVerified = false;
                }
            })
            .catch((error) => {
                console.error('[verify_skills] submit_answer failed', error);
                quizFeedback.textContent = "Could not evaluate answer.";
                quizFeedback.className = "feedback-msg error";
                quizVerified = false;
            });
    });

    // RUN (execute once, show output — does not mark test pass)
    runCodeBtn.addEventListener('click', async () => {
        const code = codeInput.value;

        console.log("RUN CODE CLICKED");

        if (!code.trim()) {
            codeFeedback.textContent = "Enter code.";
            codeFeedback.className = "feedback-msg error";
            codeResults.classList.add('hidden');
            codeResults.innerHTML = '';
            return;
        }

        const currentModuleData = moduleData[currentModule] || moduleData[currentModule - 1] || {};

        codeFeedback.textContent = "Running code...";
        codeFeedback.className = "feedback-msg";
        codeResults.classList.add('hidden');
        codeResults.innerHTML = '';

        // For a simple run, send a single dummy test so backend executes the code and returns output
        const runTestCases = [{ input: "", expected: "" }];

        console.log("Sending (run):", { code: code, test_cases: runTestCases });

        const res = await fetch(`${BASE_URL}/run_code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code, test_cases: runTestCases })
        });

        const data = await res.json();
        console.log("Response (run):", data);

        const results = Array.isArray(data.results) ? data.results : [];

        if (results.length > 0) {
            codeResults.classList.remove('hidden');
            codeResults.innerHTML = results.map((result, idx) => {
                const statusClass = result.passed ? 'result-pass' : 'result-fail';
                const title = result.passed ? 'Passed' : 'Output';
                const out = formatValue(result.output);
                const err = result.error ? formatValue(result.error) : '';
                return `
                    <div class="result-block ${statusClass}">
                        <div class="result-title"><strong>${title}</strong> ${results.length > 1 ? `#${idx+1}` : ''}</div>
                        <pre class="code-output">${out}${err ? `\n\nError:\n${err}` : ''}</pre>
                    </div>
                `;
            }).join('<hr style="border:0;border-top:1px solid #e2e8f0;margin:10px 0;">');
        }

        // Running alone does not mark tests as passed
        codeVerified = false;
    });

    // TEST (run against module test cases and mark pass/fail)
    testCodeBtn.addEventListener('click', async () => {
        const code = codeInput.value;

        console.log("TEST CODE CLICKED");

        if (!code.trim()) {
            codeFeedback.textContent = "Enter code.";
            codeFeedback.className = "feedback-msg error";
            codeResults.classList.add('hidden');
            codeResults.innerHTML = '';
            return;
        }

        const currentModuleData = moduleData[currentModule] || moduleData[currentModule - 1] || {};

        if (!currentModuleData.test_cases || currentModuleData.test_cases.length === 0) {
            codeFeedback.textContent = "No test cases available.";
            codeFeedback.className = "feedback-msg error";
            codeResults.classList.add('hidden');
            codeResults.innerHTML = '';
            return;
        }

        codeFeedback.textContent = "Running tests...";
        codeFeedback.className = "feedback-msg";
        codeResults.classList.add('hidden');
        codeResults.innerHTML = '';

        console.log("Sending (test):", { code: code, test_cases: currentModuleData.test_cases });

        const res = await fetch(`${BASE_URL}/run_code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code, test_cases: currentModuleData.test_cases || [] })
        });

        const data = await res.json();
        console.log("Response (test):", data);

        const results = Array.isArray(data.results) ? data.results : [];
        const score = typeof data.score === 'string' ? data.score : null;

        if (results.length > 0) {
            codeResults.classList.remove('hidden');
            codeResults.innerHTML = results.map((result, idx) => {
                const statusClass = result.passed ? 'result-pass' : 'result-fail';
                const statusText = result.passed ? 'Passed' : 'Failed';
                const input = formatValue(result.input);
                const expected = formatValue(result.expected);
                const output = formatValue(result.output);
                const err = result.error ? formatValue(result.error) : '';
                return `
                    <div class="result-block ${statusClass}">
                        <div class="result-title"><strong>${statusText}</strong> ${results.length > 1 ? `#${idx+1}` : ''}</div>
                        <div class="result-meta">Input:</div>
                        <pre class="code-output">${input}</pre>
                        <div class="result-meta">Expected:</div>
                        <pre class="code-output">${expected}</pre>
                        <div class="result-meta">Output:</div>
                        <pre class="code-output">${output}${err ? `\n\nError:\n${err}` : ''}</pre>
                    </div>
                `;
            }).join('<hr style="border:0;border-top:1px solid #e2e8f0;margin:10px 0;">');
        }

        if (score && score.includes("/")) {
            codeFeedback.textContent = `Score: ${score}`;
            codeFeedback.className = "feedback-msg success";
            codeVerified = results.length > 0 && results.every((result) => result.passed);
        } else {
            codeFeedback.textContent = data.message || "Failed.";
            codeFeedback.className = "feedback-msg error";
            codeVerified = false;
        }
    });

    completeBtn.addEventListener('click', () => {
        if (cheatingScore > 5) {
            alert("Too many suspicious movements detected. Test invalid.");
            return;
        }
        // Basic validation
        if (!quizVerified) {
            alert("Please submit your theoretical answer first.");
            return;
        }

        if (!codeVerified) {
            alert("Please run your code and pass the challenge first.");
            return;
        }

        // Mocking module completion
        currentModule++;
        updateUI();
        
        // Scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initialize with loading screen
    async function init() {
        if (loadingScreen) loadingScreen.style.display = 'flex';

        try {
            if (loadingMessage) loadingMessage.textContent = `Loading ${selectedSkill} subtopics...`;
            const subtopicData = await fetchSubtopics(selectedSkill);
            subtopics = subtopicData.subtopics || [];

            moduleData = [null, ...subtopics.map((subtopic) => createPlaceholderModule(subtopic))];
            questionPromises = [];

            console.log('[verify_skills] loaded subtopics', subtopics);
            console.log('[verify_skills] question loading deferred until module is opened');
        } catch (error) {
            console.error('[verify_skills] failed to load quiz data', error);
            if (loadingMessage) loadingMessage.textContent = 'Falling back to local test data...';
            subtopics = ['Fundamentals', 'Advanced Concepts', 'Practical Application', 'Troubleshooting', 'Final Assessment'];
            moduleData = [null, ...subtopics.map((subtopic) => createPlaceholderModule(subtopic))];
            questionPromises = [];
        }

        if (loadingScreen) loadingScreen.style.display = 'none';

        updateUI();
    }

    init();
});
