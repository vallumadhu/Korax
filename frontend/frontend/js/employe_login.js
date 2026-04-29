document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('employer-login-form');
    const message = document.getElementById('emp-message');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Visual feedback
        message.textContent = 'Authenticating with Employer Network...';
        message.className = 'message success';
        
        // Simulating backend check
        setTimeout(() => {
            // Redirect back to welcome or a potential employer dashboard
            window.location.href = '../index.html'; 
        }, 1500);
    });
});
