const nameInput = document.getElementById("username");

document.getElementById("connect-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (name) createClient(name);
});

document.getElementById("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const targetId = document.getElementById("targetId").value.trim();
  if (targetId) createChat(targetId);
});

document.getElementById("message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.getElementById("messageInput").value;
  if (client && message && active_chat) {
    const msg = new Paho.MQTT.Message(
      JSON.stringify({
        type: "message",
        from: id,
        timestamp: new Date().getTime(),
        message: message,
      })
    );
    msg.destinationName = active_chat;
    msg.qos = 2;
    msg.retained = true;
    client.send(msg);
    document.getElementById("messageInput").value = "";
  }
});

function receiveMessage(data) {
  document.getElementById("messages").innerHTML += `<p><strong>${
    data.from !== id ? data.from : "Você"
  }:</strong> ${data.message}</p>`;
}
