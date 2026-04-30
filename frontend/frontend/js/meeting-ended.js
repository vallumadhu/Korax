const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

// Rejoin button
document.getElementById("rejoinBtn").onclick = () => {
  if (roomId) {
    window.location.href = `../pages/player.html?room=${roomId}`;
  } else {
    window.history.back();
  }
};

// Join new meeting
document.getElementById("newBtn").onclick = () => {
  window.location.href = `../pages/player.html`;
};