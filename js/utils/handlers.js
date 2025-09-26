function messageHandler(message) {
  if (!message) return;

  const data = JSON.parse(message.payloadString);

  if (data.type === "status") {
    onlineStatus(data);
  }

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
      chats.push({
        members: [data.from, id],
        chatTopic: data.topic,
        type: "chat",
      });

      setChatLinks(chats);

      client.subscribe(data.topic, { qos: 2 });
      showToast(`🟢 Chat aceito!`, `Tópico ${data.topic}`, "success");
      renderChats();
    } else {
      showToast(`❌ Convite recusado/expirado por ${data.from}`);
    }
  }
}
