// --- ROOM HANDLING ---
function createRoomId() {
  return crypto.randomUUID();
}

function getRoomId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("room");
}

let roomId = getRoomId();

if (!roomId) {
  const newId = createRoomId();
  window.location.replace(`player.html?room=${newId}`);
} else {
  start();
}

// --- MAIN ---
function start() {
  const socket = new WebSocket(`ws://localhost:3000/ws/${roomId}`);

  const localVideo = document.getElementById("localVideo");
  const remoteVideo = document.getElementById("remoteVideo");

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  let pendingCandidates = [];
  let localStream;
  let recorder;
  let recordedChunks = [];

  function send(data) {
    socket.send(JSON.stringify(data));
  }

  // --- INIT ---
  async function init() {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    localVideo.srcObject = localStream;

    // --- RECORDING (STORE ONLY, NO UPLOAD YET) ---
    recorder = new MediaRecorder(localStream, {
      mimeType: "video/webm;codecs=vp8,opus"
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    // collect chunks periodically (memory only)
    recorder.start(5000);
  }

  // --- SOCKET EVENTS ---
  socket.onopen = () => {
    init();
  };

  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    const type = data.type;

    if (type === "user-joined") {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      send({ type: "offer", offer });
    }

    if (type === "offer") {
      const { offer } = data;
      if (!offer?.type || !offer?.sdp) return;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      for (const c of pendingCandidates) await pc.addIceCandidate(c);
      pendingCandidates = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      send({ type: "answer", answer });
    }

    if (type === "answer") {
      const { answer } = data;

      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      for (const c of pendingCandidates) await pc.addIceCandidate(c);
      pendingCandidates = [];
    }

    if (type === "ice") {
      const ice = new RTCIceCandidate(data.candidate);

      if (pc.remoteDescription) {
        await pc.addIceCandidate(ice);
      } else {
        pendingCandidates.push(ice);
      }
    }
  };

  socket.onclose = () => {
    console.log("Socket closed");
  };

  // --- ICE ---
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      send({ type: "ice", candidate: e.candidate });
    }
  };

  // --- REMOTE STREAM ---
  pc.ontrack = (e) => {
    if (!remoteVideo.srcObject) {
      remoteVideo.srcObject = e.streams[0];
    }
  };

  // --- UI CONTROLS ---
  const audioBtn = document.getElementById("toggleAudio");
  const videoBtn = document.getElementById("toggleVideo");
  const endBtn = document.getElementById("endCall");

  const audioIcon = document.getElementById("audioIcon");
  const videoIcon = document.getElementById("videoIcon");

  audioBtn.onclick = () => {
    const track = localStream?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;

    audioIcon.src = track.enabled
      ? "../assets/icons/microphone-solid-full.svg"
      : "../assets/icons/microphone-slash-solid-full.svg";
  };

  videoBtn.onclick = () => {
    const track = localStream?.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;

    videoIcon.src = track.enabled
      ? "../assets/icons/video-solid-full.svg"
      : "../assets/icons/video-slash-solid-full.svg";
  };

  // --- END CALL (UPLOAD EVERYTHING HERE) ---
  endBtn.onclick = async () => {
    try {
      // force last chunk
      recorder.requestData();
    } catch {}

    recorder.stop();

    setTimeout(async () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });

      const form = new FormData();
      form.append("file", blob, `recording-${roomId}.webm`);
      form.append("roomId", roomId);

      await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: form
      });

      localStream?.getTracks().forEach(t => t.stop());
      pc.close();
      socket.close();

      window.location.href = "../pages/meeting-ended.html?room=" + roomId;
    }, 1000);
  };
}