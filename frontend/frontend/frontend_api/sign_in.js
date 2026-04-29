import { loginUser } from "./auth.js";

const form = document.getElementById("loginForm");
const errorEl = document.getElementById("error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorEl.textContent = "";

    const data = {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
    };

    try {
        const res = await loginUser(data);

        // Save token and email
        localStorage.setItem("access_token", res.access_token);
        localStorage.setItem("user_email", data.email);

        window.location.href = "./profile.html";

    } catch (err) {
        errorEl.textContent = err.message;
    }
});


// Toggle password
document.getElementById("togglePwd").addEventListener("click", () => {
    const pwd = document.getElementById("password");
    pwd.type = pwd.type === "password" ? "text" : "password";
});