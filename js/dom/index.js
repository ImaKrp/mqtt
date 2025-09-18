document.getElementById("connectBtn").addEventListener("click", () => {
  const name = document.getElementById("username").value.trim();
  if (name) createClient(name);
});

document.getElementById("chatBtn").addEventListener("click", () => {
  const targetId = document.getElementById("targetId").value.trim();
  if (targetId) createChat(targetId);
});
