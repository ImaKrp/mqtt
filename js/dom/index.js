const elements = {
  username: document.getElementById("username"),
  connectBtn: document.getElementById("connect-btn"),
  disconnectBtn: document.getElementById("disconnect-btn"),
  newChatBtn: document.getElementById("new-chat-btn"),
  statusIndicator: document.getElementById("status-indicator"),
  statusText: document.getElementById("status-text"),
  contactsList: document.getElementById("contacts-list"),
  groupsList: document.getElementById("groups-list"),
  welcomeScreen: document.getElementById("welcome-screen"),
  activeChat: document.getElementById("active-chat"),
  chatName: document.getElementById("chat-name"),
  chatType: document.getElementById("chat-type"),
  chatAvatarText: document.getElementById("chat-avatar-text"),
  messagesContainer: document.getElementById("messages-container"),
  messageInput: document.getElementById("message-input"),
  sendBtn: document.getElementById("send-btn"),
  newChatModal: document.getElementById("new-chat-modal"),
  acceptChatModal: document.getElementById("accept-chat-modal"),
  acceptGroupModal: document.getElementById("accept-group-modal"),
  contactName: document.getElementById("contact-name"),
  groupCode: document.getElementById("group-name"),
  toastContainer: document.getElementById("toast-container"),
};

document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
});

function setupEventListeners() {
  elements.connectBtn.addEventListener("click", () => {
    const username = elements.username.value.trim();

    if (!username) {
      showToast("Erro", "Digite seu nome para conectar", "error");
      return;
    }

    createClient(username);
  });
  elements.disconnectBtn.addEventListener("click", handleDisconnect);

  elements.newChatBtn.addEventListener("click", () => showModal());

  elements.sendBtn.addEventListener("click", handleSendMessage);
  elements.messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });

  setupModalListeners();

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => switchTab(e.target.dataset.tab));
  });
}

function setupModalListeners() {
  const modal = elements.newChatModal;
  const closeBtn = modal.querySelector(".close-btn");
  const addContactBtn = document.getElementById("add-contact-btn");
  const addGroupBtn = document.getElementById("add-group-btn");
  const createGroup = document.getElementById("create-new-group");

  closeBtn.addEventListener("click", hideModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });

  addContactBtn.addEventListener("click", () => handleNewChat("contact"));
  addGroupBtn.addEventListener("click", () => handleNewChat("group"));
  createGroup.addEventListener("click", () => handleCreateGroup());

  elements.contactName.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleNewChat("contact");
  });
  elements.groupCode.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleNewChat("group");
  });

  const modal2 = elements.acceptChatModal;

  const closeBtn2 = modal2.querySelector(".close-btn");
  closeBtn2.addEventListener("click", hideChatModal);
  const acceptBtn = modal2.querySelector("#acceptChatBtn");
  const declineBtn = modal2.querySelector("#declineChatBtn");

  acceptBtn.addEventListener("click", () => {
    const chatTopic = `chat/${chatReq}_${id}_${new Date().getTime()}`;

    chats.push({
      members: [chatReq, id],
      chatTopic,
      type: "chat",
    });

    setChatLinks(chats);

    client.subscribe(chatTopic, { qos: 2 });
    showToast(
      `🟢 Chat iniciado`,
      `Com ${chatReq} no tópico ${chatTopic}`,
      "success"
    );

    const response = new Paho.MQTT.Message(
      JSON.stringify({
        type: "inviteResponse",
        from: id,
        to: chatReq,
        topic: chatTopic,
      })
    );
    response.destinationName = "clientId_" + chatReq;
    response.qos = 2;
    client.send(response);

    renderChats();
    hideChatModal();
  });
  declineBtn.addEventListener("click", () => {
    showToast(`❌ Convite recusado de ${chatReq}`, undefined, "error");

    const response = new Paho.MQTT.Message(
      JSON.stringify({
        type: "inviteResponse",
        from: id,
        to: chatReq,
        topic: undefined,
      })
    );
    response.destinationName = "clientId_" + chatReq;
    response.qos = 2;
    client.send(response);

    hideChatModal();
  });

  const modal3 = elements.acceptGroupModal;

  const closeBtn3 = modal3.querySelector(".close-btn");
  closeBtn3.addEventListener("click", hideGroupModal);
  const acceptBtn2 = modal3.querySelector("#acceptChatBtn");

  const declineBtn2 = modal3.querySelector("#declineChatBtn");

  acceptBtn2.addEventListener("click", () => {
    const code = groupTopic.split("/")[1];
    showToast(
      `🟢 Solicitação de ${chatReq} no grupo ${groupTopic} aceita`,
      undefined,
      "success"
    );

    const response = new Paho.MQTT.Message(
      JSON.stringify({
        type: "reqResponse",
        from: id,
        to: chatReq,
        topic: groupTopic,
      })
    );
    response.destinationName = "clientId_" + chatReq;
    response.qos = 2;
    client.send(response);

    const status = new Paho.MQTT.Message(
      JSON.stringify({
        type: "group-taken",
        code,
        admin: id,
        members: [...new Set([...groups_taken?.[code]?.members, chatReq])],
      })
    );
    status.destinationName = "GROUPS";
    status.qos = 2;
    status.retained = true;
    client.send(status);

    hideGroupModal();
  });
  declineBtn2.addEventListener("click", () => {
    showToast(`❌ Convite recusado de ${chatReq}`, undefined, "error");

    const response = new Paho.MQTT.Message(
      JSON.stringify({
        type: "reqResponse",
        from: id,
        to: chatReq,
        topic: undefined,
      })
    );
    response.destinationName = "clientId_" + chatReq;
    response.qos = 2;
    client.send(response);

    hideGroupModal();
  });
}

function showChatModal(req) {
  elements.acceptChatModal.classList.add("show");
  chatReq = req;
  elements.acceptChatModal.querySelector("strong").textContent = req;

  chatModalTimeout = setTimeout(() => hideChatModal(), 60000);
}

function hideChatModal() {
  chatReq = undefined;
  elements.acceptChatModal.classList.remove("show");
  clearTimeout(chatModalTimeout);
}

function showGroupModal(req, group) {
  elements.acceptGroupModal.classList.add("show");
  chatReq = req;
  groupTopic = group;
  const texts = elements.acceptGroupModal.querySelectorAll("strong");

  texts[0].textContent = req;
  texts[1].textContent = group.split("/")[1];

  groupModalTimeout = setTimeout(() => hideChatModal(), 60000);
}

function hideGroupModal() {
  chatReq = undefined;
  groupTopic = undefined;
  elements.acceptGroupModal.classList.remove("show");
  clearTimeout(groupModalTimeout);
}

elements.username.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const username = elements.username.value.trim();
    if (!username) {
      showToast("Erro", "Digite seu nome para conectar", "error");
      return;
    }

    createClient(username);
  }
});

document
  .getElementById("open-sidebar")
  .addEventListener("click", toggleSidebar);
document
  .querySelector(".sidebar-close-btn")
  .addEventListener("click", (e) => toggleSidebar(e));

document.querySelector("body").addEventListener("click", (e) => {
  if (!document.querySelector(".sidebar").classList.contains("open")) return;
  if (!document.querySelector(".sidebar").contains(e.target)) {
    document.querySelector(".sidebar").classList.remove("open");
  }
});

function toggleSidebar(e) {
  if (e) e.stopImmediatePropagation();
  document.querySelector(".sidebar").classList.toggle("open");
}

function updateConnectionStatus() {
  if (id) {
    elements.statusIndicator.classList.add("online");
    elements.statusText.textContent = "Conectado";
    elements.connectBtn.style.display = "none";
    elements.newChatBtn.style.display = "inline-flex";
    elements.disconnectBtn.style.display = "inline-flex";
    elements.username.disabled = true;
  } else {
    elements.statusIndicator.classList.remove("online");
    elements.statusText.textContent = "Desconectado";
    elements.connectBtn.style.display = "inline-flex";
    elements.newChatBtn.style.display = "none";
    elements.disconnectBtn.style.display = "none";
    elements.username.disabled = false;
    elements.username.value = "";
  }
}

function renderChats() {
  elements.contactsList.innerHTML = chats
    .map((chat) => createChatItem(chat))
    .join("");
  elements.groupsList.innerHTML = groups
    .map((chat) => createGroupChatItem(chat))
    .join("");

  document.querySelectorAll(".chat-item").forEach((item) => {
    item.addEventListener("click", () => {
      const chatId = item.dataset.chatId;
      selectChat(chatId);
    });
  });
}

function createGroupChatItem(chat) {
  const isActive = active_chat === chat.chatTopic;

  return `
        <div class="chat-item ${isActive ? "active" : ""}" data-chat-id="${
    chat.chatTopic
  }">
            <div class="chat-avatar group">
                
                 '<i class="fa-solid fa-users"></i>'
                  
              
            </div>
            <div class="chat-info">
                <h4>${chat.code}</h4>
                <p>${chat.lastMessage || ""}</p>
            </div>
        </div>
    `;
}

function createChatItem(chat) {
  const isActive = active_chat === chat.chatTopic;
  const onlineIndicator =
    chat.type === "chat" ? '<div class="online-indicator"></div>' : "";

  const user = chat.members.filter((i) => i !== id)[0];
  const updated_at = users_status?.[user];
  let isOnline = false;

  if (updated_at && new Date().getTime() - updated_at < 6000) {
    isOnline = true;
  }

  if (chat.chatTopic === active_chat) {
    elements.chatType.textContent = isOnline ? "Online" : "Offline";
  }

  return `
        <div class="chat-item ${isActive ? "active" : ""}" data-chat-id="${
    chat.chatTopic
  }">
            <div class="chat-avatar ${chat.type === "group" ? "group" : ""}">
                ${
                  chat.type === "group"
                    ? '<i class="fa-solid fa-users"></i>'
                    : user.charAt(0).toUpperCase()
                }
                ${onlineIndicator}
            </div>
            <div class="chat-info">
                <h4>${user}</h4>
                <p>${chat.lastMessage || ""}</p>
            </div>
            ${
              chat.type === "chat"
                ? `
                <div class="status-badge ${isOnline ? "online" : "offline"}">
                    ${isOnline ? "Online" : "Offline"}
                </div>
            `
                : ""
            }
        </div>
    `;
}

function selectChat(chatId) {
  if (!id) {
    showToast("Erro", "Conecte-se primeiro para acessar os chats", "error");
    return;
  }

  active_chat = chatId;

  let chat = chats.find((c) => c.chatTopic === chatId);

  if (chatId.split("/")[0] === "group")
    chat = groups.find((c) => c.chatTopic === chatId);

  console.log(chatId);

  if (chat) {
    showChatArea(chat);
    renderChats();
  }
}

function showChatArea(chat) {
  elements.welcomeScreen.style.display = "none";
  elements.activeChat.style.display = "flex";
  document.querySelector(".main-content .chat-info").style.display = "flex";
  document.querySelector(".main-content .message-input-area").style.display =
    "block";

  elements.chatName.textContent =
    chat.type === "group" ? chat.code : chat.members.filter((i) => i !== id)[0];
  elements.chatType.textContent =
    chat.type === "group"
      ? groups_taken[chat.chatTopic.split("/")[1]].members.join(", ")
      : "Offline";
  if (chat.type === "group")
    elements.chatAvatarText.innerHTML = '<i class="fa-solid fa-users"></i>';
  else
    elements.chatAvatarText.textContent = chat.members
      .filter((i) => i !== id)[0]
      .charAt(0)
      .toUpperCase();

  renderMessages(history[active_chat]);
}

function showWelcomeScreen() {
  toggleSidebar();
  elements.welcomeScreen.style.display = "flex";
  elements.activeChat.style.display = "none";
  document.querySelector(".main-content .chat-info").style.display = "none";
  document.querySelector(".main-content .message-input-area").style.display =
    "none";
}

document
  .querySelector(".sidebar-header")
  .addEventListener("click", showWelcomeScreen);

function renderMessages(htry) {
  if (!htry?.msgs) {
    elements.messagesContainer.innerHTML = "";
    return;
  }
  const messages = htry.msgs;

  const isGroup = active_chat.split("/")[0] === "group";

  elements.messagesContainer.innerHTML = messages
    .map((message) => createMessageBubble(message, isGroup))
    .join("");
  document.querySelector(".chat-area").scrollTop =
    document.querySelector(".chat-area").scrollHeight;
}

function createMessageBubble(message, isGroup = false) {
  const time = formatTime(message.timestamp);

  console.log(message);

  return `
        <div class="message ${message.from === id ? "sent" : "received"}">
            <div class="message-bubble">
              ${
                isGroup && message.from !== id
                  ? `<div class="message-author">${message.from}</div>`
                  : ""
              }
                <div class="message-text">${
                  message.msg_type === "img"
                    ? `<img src="${message.data}"/>`
                    : ""
                }${message.message ? message.message : ""}</div>
                <div class="message-time">${time}</div>
            </div>
        </div>
    `;
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showModal() {
  elements.newChatModal.classList.add("show");
}

function hideModal() {
  elements.newChatModal.classList.remove("show");
}

function switchTab(tabName) {
  if (!tabName) return;
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.toggle("active", content.id === `${tabName}-tab`);
  });
}

function showToast(title, description, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  toast.innerHTML = `
        <div class="toast-title">${title}</div>
        ${
          description
            ? `<div class="toast-description">${description}</div>`
            : ""
        }
    `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

elements.messageInput.addEventListener("input", () => {
  const hasText = elements.messageInput.value.trim().length > 0;
  const canSend = hasText && id && active_chat;
  elements.sendBtn.disabled = !canSend;
});

elements.sendBtn.disabled = true;

document.getElementById("img-input").addEventListener("change", (event) => {
  const files = event.target.files; // FileList
  if (files.length > 0) {
    console.log("Arquivo selecionado:", files[0].name);

    if (!files[0]) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const base64 = e.target.result;
      event.target.value = "";

      const newMessage = {
        type: "message",
        from: id,
        msg_type: "img",
        timestamp: new Date().getTime(),
        data: base64,
      };

      const msg = new Paho.MQTT.Message(JSON.stringify(newMessage));
      msg.destinationName = active_chat;
      msg.qos = 2;
      msg.retained = true;
      client.send(msg);
    };

    reader.readAsDataURL(files[0]);
  }
});
