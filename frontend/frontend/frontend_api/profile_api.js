const BASE_URL = "http://localhost:8004";

export async function getProfile() {
	const token = localStorage.getItem("access_token");

	if (!token) {
		throw new Error("No session found");
	}

	try {
		const res = await fetch(`${BASE_URL}/profile`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`,
			},
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.detail || "Failed to fetch profile");
		}

		return data;

	} catch (err) {
		throw err;
	}
}


