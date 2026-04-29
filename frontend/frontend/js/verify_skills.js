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
    const runCodeBtn = document.getElementById('run-code-btn');

    let quizVerified = false;
    let codeVerified = false;

    // Get skill from URL or local storage
    const selectedSkill = localStorage.getItem('lastSelectedSkill') || 'Web Development';
    skillTitle.textContent = `${selectedSkill} Mastery`;

    const moduleData = {
        1: { 
            title: "Module 1: Fundamentals", 
            desc: "Understanding the basic syntax, core principles, and the environment setup required for mastery.",
            quiz: {
                question: "Explain the primary purpose of this skill's fundamental syntax in 1-2 sentences.",
                placeholder: "e.g., It defines how data is structured and processed..."
            },
            code: {
                instruction: "Declare a variable named 'result' and assign it the value of 10.",
                solution: "result = 10"
            }
        },
        2: { 
            title: "Module 2: Advanced Concepts", 
            desc: "Diving deeper into complex data structures, logic patterns, and efficient workflow management.",
            quiz: {
                question: "How do advanced patterns improve workflow efficiency compared to basic approaches?",
                placeholder: "e.g., They reduce redundancy and allow for better scaling..."
            },
            code: {
                instruction: "Create a function named 'calculate' that returns true.",
                solution: "function calculate() { return true; }"
            }
        },
        3: { 
            title: "Module 3: Practical Application", 
            desc: "Building a real-world project component using everything learned in the previous modules.",
            quiz: {
                question: "What are the key considerations when initializing a project component for deployment?",
                placeholder: "e.g., ensuring compatibility and setting up dependencies..."
            },
            code: {
                instruction: "Write a condition that checks if 'status' is equal to 'active'.",
                solution: "if (status === 'active')"
            }
        },
        4: { 
            title: "Module 4: Troubleshooting", 
            desc: "Learning how to identify bottlenecks, debug complex issues, and optimize for performance.",
            quiz: {
                question: "Describe the process of identifying a performance bottleneck in a complex system.",
                placeholder: "e.g., profiling the execution time of different modules..."
            },
            code: {
                instruction: "Try/catch blocks are used for...?",
                solution: "error handling"
            }
        },
        5: { 
            title: "Module 5: Final Assessment", 
            desc: "The final test of your capabilities. Complete this to earn your verified badge.",
            quiz: {
                question: "In your own words, what does it mean to have a 'verified' skill in this domain?",
                placeholder: "e.g., it means demonstrating competence through practical testing..."
            },
            code: {
                instruction: "Print 'Verified' to the console.",
                solution: "console.log('Verified')"
            }
        }
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
            const currentData = moduleData[currentModule];
            currentModuleTitle.textContent = currentData.title;
            moduleDescription.textContent = currentData.desc;
            completeBtn.textContent = currentModule === totalModules ? "Finish Verification" : "Complete & Next Module";
            
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

        } else {
            // Show Success
            moduleDisplay.classList.add('hidden');
            finalSuccess.classList.remove('hidden');
            progressBarFill.style.width = '100%';
            progressPercent.textContent = '100%';
        }
    }

    submitQuizBtn.addEventListener('click', () => {
        if (quizAnswerInput.value.trim().length < 10) {
            quizFeedback.textContent = "Please provide a more detailed answer (min 10 characters).";
            quizFeedback.className = "feedback-msg error";
            quizVerified = false;
        } else {
            quizFeedback.textContent = "Concept verified successfully!";
            quizFeedback.className = "feedback-msg success";
            quizVerified = true;
        }
    });

    runCodeBtn.addEventListener('click', () => {
        if (codeInput.value.trim() === "") {
            codeFeedback.textContent = "Please enter some code to run.";
            codeFeedback.className = "feedback-msg error";
            codeVerified = false;
        } else {
            codeFeedback.textContent = "Code executed and requirements met!";
            codeFeedback.className = "feedback-msg success";
            codeVerified = true;
        }
    });

    completeBtn.addEventListener('click', () => {
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

    // Initialize
    updateUI();
});
