const BASE_URL = "http://localhost:8004";

document.addEventListener("DOMContentLoaded", () => {
	const uploadForm = document.getElementById("uploadCourseForm");
	const successMsg = document.getElementById("successMsg");
	const uploadedMedia = {
		video: "",
		thumbnail: "",
		slide1: "",
		slide2: "",
		slide3: "",
		slide4: ""
	};
	const uploadJobs = {};

	uploadForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const token = localStorage.getItem("access_token");
		if (!token) {
			alert("Please sign in first.");
			return;
		}

		const desc = document.getElementById("courseDesc").value.trim();
		const skillId = document.getElementById("courseSkills").value;
		const pendingJobs = Object.values(uploadJobs).filter(Boolean);
		if (pendingJobs.length > 0) {
			alert("Please wait for current uploads to finish.");
			return;
		}

		if (!uploadedMedia.thumbnail) {
			alert("Please upload a thumbnail before publishing.");
			return;
		}

		const meetingUUID = crypto.randomUUID();

		try {
			console.log("[publish] payload thumbnail_url:", uploadedMedia.thumbnail);
			const data = await createSession(token, {
				skill_id: skillId,
				session_time: "10:00:00",
				credits_alloted: 10,
				description: desc,
				video_url: uploadedMedia.video || "",
				thumbnail_url: uploadedMedia.thumbnail,
				meeting_id: meetingUUID
			});

			successMsg.style.display = "block";
			successMsg.textContent = `Course uploaded successfully. Meeting ID: ${meetingUUID}`;
			uploadForm.reset();
			Object.keys(uploadedMedia).forEach((key) => {
				uploadedMedia[key] = "";
			});
		} catch (err) {
			console.error(err);
			alert(err.message || "Upload failed");
		}
	});

	async function uploadFile(file, path) {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("path", path);

		const res = await fetch(`${BASE_URL}/upload`, {
			method: "POST",
			body: formData
		});

		const result = await res.json();
		if (!res.ok) {
			throw new Error(result.detail || "File upload failed");
		}

		return result.url;
	}

	async function createSession(token, payload) {
		const res = await fetch(`${BASE_URL}/make_session`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify(payload)
		});

		const result = await res.json();
		if (res.status === 401) {
			throw new Error("Session expired or invalid. Please sign in again.");
		}
		if (!res.ok) {
			throw new Error(result.detail || "Session creation failed");
		}
		console.log("[make_session] success response:", result);

		return result;
	}

	async function loadSkills() {
		const res = await fetch(`${BASE_URL}/skills`);
		const skills = await res.json();

		const select = document.getElementById("courseSkills");
		select.innerHTML = "";

		skills.forEach((skill) => {
			const opt = document.createElement("option");
			opt.value = skill.id;
			opt.textContent = skill.skill_name;
			select.appendChild(opt);
		});
	}

	loadSkills();

	function setupDropZone(zoneId, inputId, previewId, type = "image", mediaKey = "") {
		const zone = document.getElementById(zoneId);
		const input = document.getElementById(inputId);
		const preview = document.getElementById(previewId);

		if (!zone || !input || !preview) return;

		zone.addEventListener("click", () => {
			input.click();
		});

		input.addEventListener("change", (e) => {
			if (e.target.files && e.target.files.length > 0) {
				handleFile(e.target.files[0]);
			}
		});

		zone.addEventListener("dragover", (e) => {
			e.preventDefault();
			zone.classList.add("dragover");
		});

		zone.addEventListener("dragleave", (e) => {
			e.preventDefault();
			zone.classList.remove("dragover");
		});

		zone.addEventListener("drop", (e) => {
			e.preventDefault();
			zone.classList.remove("dragover");
			if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

			const file = e.dataTransfer.files[0];

			if (type === "video" && !file.type.startsWith("video/")) {
				alert("Please drop a valid video file.");
				return;
			}
			if (type === "image" && !file.type.startsWith("image/")) {
				alert("Please drop a valid image file.");
				return;
			}

			const transfer = new DataTransfer();
			transfer.items.add(file);
			input.files = transfer.files;

			handleFile(file);
		});

		function handleFile(file) {
			preview.innerHTML = "";

			if (type === "video") {
				const videoUrl = URL.createObjectURL(file);
				const videoEl = document.createElement("video");
				videoEl.src = videoUrl;
				videoEl.controls = true;
				preview.appendChild(videoEl);
				preview.classList.add("active");
			} else {
				const reader = new FileReader();
				reader.onload = (evt) => {
					const imgEl = document.createElement("img");
					imgEl.src = evt.target.result;
					preview.appendChild(imgEl);
					preview.classList.add("active");
				};
				reader.readAsDataURL(file);
			}

			const statusEl = document.createElement("p");
			statusEl.textContent = "Uploading...";
			statusEl.style.cssText = "margin-top: 6px; font-size: 12px; color: #555;";
			preview.appendChild(statusEl);

			const path = `images/${Date.now()}_${sanitizeName(file.name)}`;

			uploadJobs[mediaKey] = uploadFile(file, path)
				.then((url) => {
					uploadedMedia[mediaKey] = url;
					console.log(`[upload] ${mediaKey} url returned:`, url);
					statusEl.textContent = "Uploaded";
					statusEl.style.color = "#2f7f3f";
				})
				.catch((error) => {
					uploadedMedia[mediaKey] = "";
					statusEl.textContent = "Upload failed";
					statusEl.style.color = "#b42318";
					console.error(error);
					alert(error.message || "File upload failed");
				})
				.finally(() => {
					uploadJobs[mediaKey] = null;
				});

			const delBtn = document.createElement("button");
			delBtn.innerHTML = "&times;";
			delBtn.style.cssText = "position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; z-index: 10; font-size: 16px; display: flex; align-items: center; justify-content: center;";

			delBtn.addEventListener("click", (evt) => {
				evt.stopPropagation();
				preview.innerHTML = "";
				preview.classList.remove("active");
				input.value = "";
				uploadedMedia[mediaKey] = "";
				uploadJobs[mediaKey] = null;
			});
			preview.appendChild(delBtn);
		}
	}

	function sanitizeName(name) {
		return name.replace(/[^a-zA-Z0-9._-]/g, "_");
	}

	setupDropZone("videoDropZone", "videoInput", "videoPreviewContainer", "video", "video");
	setupDropZone("thumbDropZone", "thumbInput", "thumbPreviewContainer", "image", "thumbnail");
	setupDropZone("slideZone1", "slideInput1", "slidePreview1", "image", "slide1");
	setupDropZone("slideZone2", "slideInput2", "slidePreview2", "image", "slide2");
	setupDropZone("slideZone3", "slideInput3", "slidePreview3", "image", "slide3");
	setupDropZone("slideZone4", "slideInput4", "slidePreview4", "image", "slide4");
});
