import { signupUser } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("name");
  const ageEl = document.getElementById("age");
  const qualEl = document.getElementById("qualification");
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");

  function validate() {
    const name = nameEl.value.trim();
    const age = Number(ageEl.value);
    const qual = qualEl.value.trim();
    const email = emailEl.value.trim();
    const pwd = passwordEl.value;

    if (!name) return "Name is required.";
    if (!age || age < 1 || age > 120) return "Enter a valid age.";
    if (!qual) return "Qualification is required.";

    const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!re.test(email)) return "Enter a valid email.";

    if (!pwd || pwd.length < 6)
      return "Password must be at least 6 characters.";

    return "";
  }

  // ✅ ADD THIS BLOCK
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorEl.textContent = "";

    const error = validate();
    if (error) {
      errorEl.textContent = error;
      return;
    }

    const data = {
      full_name: nameEl.value.trim(),
      age: Number(ageEl.value),
      qualification: qualEl.value.trim(),
      email: emailEl.value.trim(),
      password: passwordEl.value,
      short_ds: descEl.value.trim()
    };

    try {
      const res = await signupUser(data);

      localStorage.setItem("access_token", res.access_token);
      window.location.href = "./profile.html";

    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

});
