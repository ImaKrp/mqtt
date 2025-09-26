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
  contactName: document.getElementById("contact-name"),
  groupName: document.getElementById("group-name"),
  toastContainer: document.getElementById("toast-container"),
};

document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
});

function setupEventListeners() {
  elements.connectBtn.addEventListener("click", handleConnect);
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

  closeBtn.addEventListener("click", hideModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });

  addContactBtn.addEventListener("click", () => handleNewChat("contact"));
  addGroupBtn.addEventListener("click", () => handleNewChat("group"));

  elements.contactName.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleNewChat("contact");
  });
  elements.groupName.addEventListener("keypress", (e) => {
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
      `🟢 Chat iniciado com ${chatReq} no tópico ${chatTopic}`,
      undefined,
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

elements.username.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleConnect();
  }
});

document
  .getElementById("open-sidebar")
  .addEventListener("click", toggleSidebar);
document
  .querySelector(".sidebar .close-btn")
  .addEventListener("click", toggleSidebar);

function toggleSidebar() {
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
  const contacts = chats.filter((chat) => chat.type === "chat");
  const groups = chats.filter((chat) => chat.type === "group");

  elements.contactsList.innerHTML = contacts
    .map((chat) => createChatItem(chat))
    .join("");
  elements.groupsList.innerHTML = groups
    .map((chat) => createChatItem(chat))
    .join("");

  document.querySelectorAll(".chat-item").forEach((item) => {
    item.addEventListener("click", () => {
      const chatId = item.dataset.chatId;
      selectChat(chatId);
    });
  });
}

function createChatItem(chat) {
  const isActive = active_chat === chat.chatTopic;
  const onlineIndicator =
    chat.type === "chat" ? '<div class="online-indicator"></div>' : "";

  const user = chat.members.filter((i) => i !== id)[0];
  const updates = chat?.status?.[user];
  let isOnline = false;

  if (updates && new Date().getTime() - updates?.last_update < 6000) {
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
  const chat = chats.find((c) => c.chatTopic === chatId);

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

  elements.chatName.textContent = chat.members.filter((i) => i !== id)[0];
  elements.chatType.textContent = chat.type === "group" ? "Grupo" : "Offline";
  elements.chatAvatarText.textContent =
    chat.type === "group"
      ? '<i class="fa-solid fa-users"></i>'
      : chat.members
          .filter((i) => i !== id)[0]
          .charAt(0)
          .toUpperCase();

  if (history[active_chat]) renderMessages(history[active_chat]);
}

function showWelcomeScreen() {
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
  const messages = htry.msgs;

  if (!messages) return;
  elements.messagesContainer.innerHTML = messages
    .map((message) => createMessageBubble(message))
    .join("");
  document.querySelector(".chat-area").scrollTop =
    document.querySelector(".chat-area").scrollHeight;
}

function createMessageBubble(message) {
  const time = formatTime(message.timestamp);

  return `
        <div class="message ${message.from === id ? "sent" : "received"}">
            <div class="message-bubble">
                <div class="message-text">${message.message}</div>
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
