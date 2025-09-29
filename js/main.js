let client = undefined;
let id = undefined;
let chats = [];
let groups = [];
let history = {};
let active_chat = undefined;
let chatReq = undefined;
let groupTopic = undefined;

let users_status = {};
let groups_taken = {};

let statusInterval = undefined;

function createClient(name) {
  id = name;
  const userTopic = "clientId_" + name;

  client = new Paho.MQTT.Client("localhost", 9001, userTopic);

  client.onConnectionLost = (res) => {
    if (statusInterval) clearInterval(statusInterval);

    console.log(res.errorMessage);
    if (res.errorCode !== 0) {
      showToast("❌ Conexão perdida", res.errorMessage, "error");
    }
  };

  client.onMessageArrived = messageHandler;

  chats = getChatLinks(id);
  groups = getGroupLinks(id);
  history = getChatHistory(id);
  groups_taken = getGroupsTaken();
  renderChats();
  setUserData(id);

  client.connect({
    onFailure: () => {
      handleDisconnect();
    },
    onSuccess: () => {
      updateConnectionStatus();
      showToast("Conectado!", `Bem-vindo, ${id}!`, "success");

      client.subscribe(userTopic, { qos: 2 });
      client.subscribe("usersStatus", { qos: 0 });
      client.subscribe("GROUPS", { qos: 2 });

      handleConnect();

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
      }, 2500);
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

  if (pending[targetId]) {
    showToast("Chat", `📤 Convite já enviado para ${targetId}`, "warning");
    return;
  }

  if (!users_status?.[targetId])
    showToast("Chat", `Contato não encontrado`, "error");
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

  pending[targetId] = setTimeout(() => {
    showToast("Chat", `⌛ Convite para ${targetId} expirou`, "error");

    clearTimeout(pending[targetId]);
    delete pending[targetId];
  }, 60000);
}

function joinGroup(targetId) {
  targetId = targetId.toUpperCase();
  const existingChat = groups.find((c) => c.code === targetId);

  if (existingChat) {
    client.subscribe(existingChat.chatTopic, { qos: 2 });
    showToast(`🟢 Chat aceito!`, `Tópico ${existingChat.topic}`, "success");
    renderChats();
    return;
  }

  if (pending[`group/${targetId}`]) {
    showToast("Grupo", `📤 Solicitação já enviada para ${targetId}`, "warning");
    return;
  }

  if (!groups_taken?.[targetId]?.admin)
    showToast("Grupo", `Grupo não encontrado`, "error");

  const request = new Paho.MQTT.Message(
    JSON.stringify({
      type: "request",
      from: id,
      about: `group/${targetId}`,
      to: groups_taken[targetId].admin,
      timestamp: new Date().getTime(),
    })
  );
  request.destinationName = "clientId_" + groups_taken[targetId].admin;
  request.qos = 2;
  client.send(request);

  showToast("Grupo", `📤 Solicitação enviada para ${targetId}`, "success");

  pending[`group/${targetId}`] = setTimeout(() => {
    showToast("Grupo", `⌛ Solicitação para ${targetId} expirou`, "error");

    clearTimeout(pending[`group/${targetId}`]);
    delete pending[`group/${targetId}`];
  }, 60000);
}

window.addEventListener("load", () => {
  id = getUserData();

  if (!id) {
    localStorage.clear();
    return;
  }

  elements.username.value = id;
  createClient(id);
});
