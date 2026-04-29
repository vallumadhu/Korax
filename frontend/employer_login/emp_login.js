document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('employer-login-form');
    const message = document.getElementById('emp-message');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simple visual feedback for dummy login
        message.textContent = 'Logging in to Employer Portal...';
        message.className = 'message success';
        
        setTimeout(() => {
            // Redirect to dashboard (or employer specific dashboard if you create one)
            window.location.href = '../dashboard/dashboard.html';
        }, 1500);
    });
});
