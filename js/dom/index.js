const nameInput = document.getElementById("username");

document.getElementById("connectBtn").addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name) createClient(name);
});

document.getElementById("chatBtn").addEventListener("click", () => {
  const targetId = document.getElementById("targetId").value.trim();
  if (targetId) createChat(targetId);
});
