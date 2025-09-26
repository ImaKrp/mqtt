let pendingInvites = {};
let chatModalTimeout = undefined;

function onlineStatus(data) {
  chats
    .filter((c) => c.members.includes(data.from))
    .forEach((c) => {
      if (!c?.status) {
        c.status = {};

        c.members.forEach((m) => {
          c.status[m] = {
            last_update: 0,
          };
        });
      }

      c.status[data.from] = {
        last_update: data.timestamp,
      };
    });

  setChatLinks(chats);
  renderChats();
}

function handleConnect() {
  const username = elements.username.value.trim();

  elements.username.disabled = true;

  document.querySelector(".user-input label").style.display = "none";

  if (!username) {
    showToast("Erro", "Digite seu nome para conectar", "error");
    return;
  }

  createClient(username);
}

function handleDisconnect() {
  id = undefined;
  active_chat = undefined;
  chats = [];
  renderChats();
  client.disconnect();
  updateConnectionStatus();
  showWelcomeScreen();
  elements.username.disabled = false;

  document.querySelector(".user-input label").style.display = "inline";
  showToast("❌ Desconectado", undefined, "error");
}

function handleSendMessage() {
  const messageText = elements.messageInput.value.trim();
  if (!messageText || !active_chat || !id) return;

  const chat = chats.find((c) => c.chatTopic === active_chat);
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

function handleNewChat(type) {
  const nameInput =
    type === "contact" ? elements.contactName : elements.groupName;
  const name = nameInput.value.trim();

  if (!name) {
    showToast("Erro", "Digite um nome válido", "error");
    return;
  }

  if (type === "contact") createChat(name);

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
