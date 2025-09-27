let client = undefined;
let id = undefined;
let chats = [];
let history = {};
let active_chat = undefined;
let chatReq = undefined;

function createClient(name) {
  id = name;
  const userTopic = "clientId_" + name;

  let statusInterval = undefined;

  client = new Paho.MQTT.Client("localhost", 9001, userTopic);

  client.onConnectionLost = (res) => {
    if (statusInterval) clearInterval(statusInterval);
    if (res.errorCode !== 0) {
      showToast("❌ Conexão perdida", res.errorMessage, "error");
    }
  };

  client.onMessageArrived = messageHandler;

  chats = getChatLinks(id);
  history = getChatHistory(id);
  renderChats();
  setUserData(id);

  client.connect({
    onSuccess: () => {
      updateConnectionStatus();
      showToast("Conectado!", `Bem-vindo, ${id}!`, "success");

      client.subscribe(userTopic, { qos: 2 });
      client.subscribe("usersStatus", { qos: 2 });

      statusInterval = setInterval(() => {
        const status = new Paho.MQTT.Message(
          JSON.stringify({
            type: "status",
            from: id,
            timestamp: new Date().getTime(),
          })
        );
        status.destinationName = "usersStatus";
        status.qos = 0;
        client.send(status);
      }, 5000);
    },
    cleanSession: false,
  });
}

function createChat(targetId) {
  if (targetId === id) {
    showToast(
      `Erro`,
      `Você não pode enviar um convite para você mesmo`,
      "error"
    );
    return;
  }

  const existingChat = chats.find(
    (c) => c.type === "chat" && c.members.includes(targetId)
  );

  if (existingChat) {
    client.subscribe(existingChat.chatTopic, { qos: 2 });
    showToast(`🟢 Chat aceito!`, `Tópico ${existingChat.topic}`, "success");
    renderChats();
    return;
  }

  if (pendingInvites[targetId]) {
    showToast("Chat", `📤 Convite já enviado para ${targetId}`, "warning");
    return;
  }

  const invite = new Paho.MQTT.Message(
    JSON.stringify({
      type: "invite",
      from: id,
      to: targetId,
      timestamp: new Date().getTime(),
    })
  );
  invite.destinationName = "clientId_" + targetId;
  invite.qos = 2;
  client.send(invite);

  showToast("Chat", `📤 Convite enviado para ${targetId}`, "success");

  pendingInvites[targetId] = setTimeout(() => {
    showToast("Chat", `⌛ Convite para ${targetId} expirou`, "error");

    clearTimeout(pendingInvites[targetId]);
    delete pendingInvites[targetId];
  }, 60000);
}

window.addEventListener("load", () => {
  id = getUserData();

  if (!id) {
    localStorage.clear();
    return;
  }

  elements.username.value = id;
  handleConnect();
});
