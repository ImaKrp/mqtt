// Elementos DOM
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
  contactName: document.getElementById("contact-name"),
  groupName: document.getElementById("group-name"),
  toastContainer: document.getElementById("toast-container"),
};

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  // renderChats();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Conectar/Desconectar
  elements.connectBtn.addEventListener("click", handleConnect);
  elements.disconnectBtn.addEventListener("click", handleDisconnect);

  // Novo Chat
  elements.newChatBtn.addEventListener("click", () => showModal());

  // Enviar mensagem
  elements.sendBtn.addEventListener("click", handleSendMessage);
  elements.messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });

  // Modal
  setupModalListeners();

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => switchTab(e.target.dataset.tab));
  });
}

function setupModalListeners() {
  const modal = elements.newChatModal;
  const closeBtn = modal.querySelector(".close-btn");
  const addContactBtn = document.getElementById("add-contact-btn");
  const addGroupBtn = document.getElementById("add-group-btn");

  // Fechar modal
  closeBtn.addEventListener("click", hideModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });

  // Adicionar contato/grupo
  addContactBtn.addEventListener("click", () => handleNewChat("contact"));
  addGroupBtn.addEventListener("click", () => handleNewChat("group"));

  // Enter nos inputs
  elements.contactName.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleNewChat("contact");
  });
  elements.groupName.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleNewChat("group");
  });
}

// Funções principais
function handleConnect() {
  const username = elements.username.value.trim();
  if (!username) {
    showToast("Erro", "Digite seu nome para conectar", "error");
    return;
  }

  createClient(username);
}

function handleDisconnect() {
  id = undefined;
  active_chat = undefined;
  client.disconnect();
  updateConnectionStatus();
  showWelcomeScreen();
  showToast("❌ Conexão perdida", undefined, "error");
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

// function renderChats() {
//   const contacts = state.chats.filter((chat) => chat.type === "contact");
//   const groups = state.chats.filter((chat) => chat.type === "group");

//   elements.contactsList.innerHTML = contacts
//     .map((chat) => createChatItem(chat))
//     .join("");
//   elements.groupsList.innerHTML = groups
//     .map((chat) => createChatItem(chat))
//     .join("");

//   // Adicionar event listeners aos itens de chat
//   document.querySelectorAll(".chat-item").forEach((item) => {
//     item.addEventListener("click", () => {
//       const chatId = item.dataset.chatId;
//       selectChat(chatId);
//     });
//   });
// }

function createChatItem(chat) {
  const isActive = active_chat === chat.topic;
  const onlineIndicator =
    chat.type === "contact" && chat.isOnline
      ? '<div class="online-indicator"></div>'
      : "";

  return `
        <div class="chat-item ${isActive ? "active" : ""}" data-chat-id="${
    chat.id
  }">
            <div class="chat-avatar ${chat.type === "group" ? "group" : ""}">
                ${
                  chat.type === "group"
                    ? '<i class="fa-solid fa-users"></i>'
                    : chat.name.charAt(0).toUpperCase()
                }
                ${onlineIndicator}
            </div>
            <div class="chat-info">
                <h4>${chat.name}</h4>
                <p>${chat.lastMessage || ""}</p>
            </div>
            ${
              chat.type === "contact"
                ? `
                <div class="status-badge ${
                  chat.isOnline ? "online" : "offline"
                }">
                    ${chat.isOnline ? "Online" : "Offline"}
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

  active_chat = chat;
  const chat = state.chats.find((c) => c.id === chatId);

  if (chat) {
    showChatArea(chat);
    // renderChats();
  }
}

function showChatArea(chat) {
  elements.welcomeScreen.style.display = "none";
  elements.activeChat.style.display = "flex";

  elements.chatName.textContent = chat.name;
  elements.chatType.textContent = chat.type === "group" ? "Grupo" : "Contato";
  elements.chatAvatarText.textContent =
    chat.type === "group"
      ? '<i class="fa-solid fa-users"></i>'
      : chat.name.charAt(0).toUpperCase();

  renderMessages(chat.messages);
}

function showWelcomeScreen() {
  elements.welcomeScreen.style.display = "flex";
  elements.activeChat.style.display = "none";
}

function renderMessages(messages) {
  elements.messagesContainer.innerHTML = messages
    .map((message) => createMessageBubble(message))
    .join("");
  elements.messagesContainer.scrollTop =
    elements.messagesContainer.scrollHeight;
}

function createMessageBubble(message) {
  const time = formatTime(message.timestamp);
  const messageClass = message.isSent ? "sent" : "received";

  return `
        <div class="message ${messageClass}">
            <div class="message-bubble">
                ${
                  !message.isSent
                    ? `<div class="message-sender">${message.sender}</div>`
                    : ""
                }
                <div class="message-text">${message.content}</div>
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

function handleSendMessage() {
  const messageText = elements.messageInput.value.trim();
  if (!messageText || !active_chat || !id) return;

  const chat = state.chats.find((c) => c.id === active_chat);
  if (!chat) return;

  const newMessage = {
    id: Date.now().toString(),
    sender: "Você",
    content: messageText,
    timestamp: new Date(),
    isSent: true,
  };

  chat.messages.push(newMessage);
  chat.lastMessage = messageText;

  elements.messageInput.value = "";
  renderMessages(chat.messages);
  // renderChats();
}

function handleNewChat(type) {
  const nameInput =
    type === "contact" ? elements.contactName : elements.groupName;
  const name = nameInput.value.trim();

  if (!name) {
    showToast("Erro", "Digite um nome válido", "error");
    return;
  }

  // Criar novo chat
  if (type === "contact") createChat(name);

  nameInput.value = "";
  hideModal();
  // renderChats();

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

// Funções de UI
function showModal() {
  elements.newChatModal.classList.add("show");
}

function hideModal() {
  elements.newChatModal.classList.remove("show");
}

function switchTab(tabName) {
  // Atualizar botões das abas
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  // Atualizar conteúdo das abas
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

  // Remover após 3 segundos
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Atualizar status dos inputs de mensagem
elements.messageInput.addEventListener("input", () => {
  const hasText = elements.messageInput.value.trim().length > 0;
  const canSend = hasText && id && active_chat;
  elements.sendBtn.disabled = !canSend;
});

// Inicializar estado dos botões
elements.sendBtn.disabled = true;
