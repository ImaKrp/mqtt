function messageHandler(message) {
  if (!message) return;

  const data = JSON.parse(message.payloadString);
  console.log("📩 " + JSON.stringify(data));

  if (data.type === "message") {
    const { destinationName } = message;

    chatMessage(data, destinationName);
    return;
  }

  if (data.type === "invite" && data.to === id) {
    showChatModal(data.from);
  }

  if (data.type === "inviteResponse" && data.to === id) {
    if (pendingInvites[data.from]) {
      clearTimeout(pendingInvites[data.from]);
      delete pendingInvites[data.from];
    }

    if (data.topic) {
      const chatTopic = `chat/${id}_${data.from}`;

      chats.push({
        members: [data.from, id],
        chatTopic,
      });

      setChatLinks(chats);

      client.subscribe(chatTopic, { qos: 2 });
      active_chat = chatTopic;
      showToast(`🟢 Chat aceito! Tópico ${chatTopic}`);
    } else {
      showToast(`❌ Convite recusado/expirado por ${data.from}`);
    }
  }
}
