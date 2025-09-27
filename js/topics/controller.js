let pending = {};
let chatModalTimeout = undefined;
let groupModalTimeout = undefined;

function onlineStatus(data) {
  users_status[data.from] = data.timestamp;

  setChatLinks(chats);
  renderChats();
}

function handleConnect() {
  elements.username.disabled = true;

  document.querySelector(".user-input label").style.display = "none";

  if (!username) {
    showToast("Erro", "Digite seu nome para conectar", "error");
    return;
  }
}

function handleDisconnect() {
  id = undefined;
  active_chat = undefined;
  chats = [];
  renderChats();
  if (client.isConnected()) client.disconnect();
  updateConnectionStatus();
  showWelcomeScreen();
  elements.username.disabled = false;

  document.querySelector(".user-input label").style.display = "inline";
  showToast("❌ Desconectado", undefined, "error");
}

function handleSendMessage() {
  const messageText = elements.messageInput.value.trim();
  if (!messageText || !active_chat || !id) return;

  let chat = chats.find((c) => c.chatTopic === active_chat);

  if (active_chat.split("/")[0] === "group")
    chat = groups.find((c) => c.chatTopic === active_chat);
  if (!chat) return;

  const newMessage = {
    type: "message",
    from: id,
    timestamp: new Date().getTime(),
    message: messageText,
  };

  const msg = new Paho.MQTT.Message(JSON.stringify(newMessage));
  msg.destinationName = active_chat;
  msg.qos = 2;
  msg.retained = true;
  client.send(msg);

  elements.messageInput.value = "";
  renderChats();
}

function handleCreateGroup() {
  let code = generateGroupCode();

  while (groups_taken?.[code]) {
    code = generateGroupCode();
  }

  const status = new Paho.MQTT.Message(
    JSON.stringify({
      type: "group-taken",
      code,
      admin: id,
      members: [id],
    })
  );
  status.destinationName = "GROUPS";
  status.qos = 2;
  client.send(status);

  const chatTopic = `group/${code}`;

  groups.push({
    members: [id],
    chatTopic,
    code,
    type: "group",
  });

  setGroupLinks(groups);

  client.subscribe(chatTopic, { qos: 2 });

  hideModal();
  showToast(
    `🟢 Grupo ${code}`,
    `iniciado no tópico ${chatTopic}`,
    "success"
  );
  renderChats();
}

function handleNewChat(type) {
  const nameInput =
    type === "contact" ? elements.contactName : elements.groupCode;
  const name = nameInput.value.trim();

  if (!name) {
    showToast("Erro", "Digite um nome válido", "error");
    return;
  }

  if (type === "contact") {
    if (name === id) {
      showToast(
        `Erro`,
        `Você não pode enviar um convite para você mesmo`,
        "error"
      );
      return;
    }

    createChat(name);
  } else {
    joinGroup(name);
  }

  nameInput.value = "";
  hideModal();
  renderChats();

  const actionText =
    type === "group"
      ? "Solicitação para participar do grupo"
      : "Solicitação de chat";
  showToast(
    "Solicitação enviada!",
    `${actionText} "${name}" enviada`,
    "success"
  );
}

function generateGroupCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}
