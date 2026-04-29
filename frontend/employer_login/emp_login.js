// emp_login.js
// Simple interaction and validation for the employer login page.
document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('emp-login-form');
  const msg = document.getElementById('emp-message');

  function showMessage(text, isError){
    if(!msg) return;
    msg.textContent = text;
    msg.classList.remove('success','error');
    msg.classList.add(isError? 'error' : 'success');
    if(!isError){
      setTimeout(()=>{ msg.textContent = ''; msg.classList.remove('success') }, 3000);
    }
  }

  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const data = new FormData(form);
      const company = (data.get('company') || '').toString().trim();
      const code = (data.get('company_code') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const password = (data.get('password') || '').toString();

      if(!company || !code || !email || !password){
        showMessage('Please fill all fields', true);
        return;
      }
      if(password.length < 6){
        showMessage('Password must be at least 6 characters', true);
        return;
      }

      // TODO: Replace with real API call for employer authentication
      showMessage('Signed in as employer — redirecting...', false);
      // Redirect to dashboard after sign in
      setTimeout(()=>{
        window.location.href = '../dashboard/dashboard.html';
      }, 700);
      form.reset();
    });
  }
});
