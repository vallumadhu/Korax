document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const errorEl = document.getElementById("error");
  const toggle = document.getElementById("togglePwd");

  toggle.addEventListener("click", () => {
    if (password.type === "password") {
      password.type = "text";
      toggle.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none">
        <path d="M1 1l22 22"/>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7"/>
      </svg>
    `;
    } else {
      password.type = "password";
      toggle.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none">
        <path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6-11-6-11-6z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;
    }
  });
	function validate() {
		const e = email.value.trim();
		const p = password.value;
		if (!e) return 'Email is required.';
		const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
		if (!re.test(e)) return 'Enter a valid email.';
		if (!p || p.length < 6) return 'Password must be at least 6 characters.';
		return '';
	}
});
