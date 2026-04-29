import { signupUser } from "./auth.js";

const form = document.getElementById("signupForm");
const errorEl = document.getElementById("error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorEl.textContent = "";

    const data = {
        full_name: document.getElementById("name").value.trim(),
        age: parseInt(document.getElementById("age").value),
        qualification: document.getElementById("qualification").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        short_ds: document.getElementById("description").value.trim(),
    };

    try {
        const res = await signupUser(data);

        // Save token (VERY IMPORTANT)
        localStorage.setItem("access_token", res.access_token);

        // redirect
        window.location.href = "sign_in.html";

    } catch (err) {
        errorEl.textContent = err.message;
    }
});


// Toggle password
document.getElementById("togglePwd").addEventListener("click", () => {
    const pwd = document.getElementById("password");
    pwd.type = pwd.type === "password" ? "text" : "password";
});