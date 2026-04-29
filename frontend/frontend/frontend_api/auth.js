const BASE_URL = "http://localhost:8002"; // change if deployed

// SIGNUP API
export async function signupUser(data) {
    try {
        const res = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.detail || "Signup failed");
        }

        return result;
    } catch (err) {
        throw err;
    }
}


// LOGIN API
export async function loginUser(data) {
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.detail || "Login failed");
        }

        return result;
    } catch (err) {
        throw err;
    }
}