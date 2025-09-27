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

  if (data.type === "group-taken") {
    groups_taken[data.code] = { ...data };

    setGroupsTaken(groups_taken);
  }

  if (data.type === "invite" && data.to === id) {
    showChatModal(data.from);
  }

  if (data.type === "request" && data.to === id) {
    showGroupModal(data.from, data.about);
  }

  if (data.type === "inviteResponse" && data.to === id) {
    if (pending[data.from]) {
      clearTimeout(pending[data.from]);
      delete pending[data.from];
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

  if (data.type === "reqResponse" && data.to === id) {
    if (pending[data.topic]) {
      clearTimeout(pending[data.topic]);
      delete pending[data.topic];
    }

    if (data.topic) {
      groups.push({
        members: [data.from, id],
        chatTopic: data.topic,
        type: "group",
        code: data.topic.split("/")[1],
      });

      setGroupLinks(groups);

      client.subscribe(data.topic, { qos: 2 });
      showToast(`🟢 Participação aceita!`, `Tópico ${data.topic}`, "success");
      renderChats();
    } else {
      showToast(`❌ Solicitação recusada/expirada por ${data.from}`);
    }
  }
}
