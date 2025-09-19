const nameInput = document.getElementById("username");

document.getElementById("connectBtn").addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name) createClient(name);
});

document.getElementById("chatBtn").addEventListener("click", () => {
  const targetId = document.getElementById("targetId").value.trim();
  if (targetId) createChat(targetId);
});

function sendMessage() {
  console.log(active_chat);
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

    document.getElementById(
      "messages"
    ).innerHTML += `<p><strong>Você:</strong> ${message}</p>`;
    document.getElementById("messageInput").value = "";
  }
}

function receiveMessage(data) {
  console.log(active_chat);
  document.getElementById(
    "messages"
  ).innerHTML += `<p><strong>${data.from}:</strong> ${data.message}</p>`;
}
