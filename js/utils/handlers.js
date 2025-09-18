function log(msg) {
  const el = document.getElementById("log");
  el.innerHTML += msg + "<br/>";
  el.scrollTop = el.scrollHeight;
}

function messageHandler(message) {
  const data = JSON.parse(message.payloadString);
  console.log("📩 " + JSON.stringify(data));

  if (data.type === "message") {
    chatMessage(data);
    return;
  }

  if (data.type === "invite" && data.to === id) {
    const accept = confirm(`${data.from} quer abrir um chat. Aceitar?`);

    const response = new Paho.MQTT.Message(
      JSON.stringify({
        type: "inviteResponse",
        from: id,
        to: data.from,
        accepted: accept,
      })
    );
    response.destinationName = "clientId_" + data.from;
    response.qos = 2;
    client.send(response);

    if (accept) {
      const chatTopic = `chat/${data.from}_${id}`;

      chats.push({
        members: [data.from, id],
        chatTopic,
      });

      setChatLinks(chats);

      client.subscribe(chatTopic, { qos: 2 });
      active_chat = chatTopic;
      log(`🟢 Chat iniciado com ${data.from} no tópico ${chatTopic}`);
    } else {
      log(`❌ Convite recusado de ${data.from}`);
    }
  }

  if (data.type === "inviteResponse" && data.to === id) {
    if (pendingInvites[data.from]) {
      clearTimeout(pendingInvites[data.from]);
      delete pendingInvites[data.from];
    }

    if (data.accepted) {
      const chatTopic = `chat/${id}_${data.from}`;

      chats.push({
        members: [data.from, id],
        chatTopic,
      });

      setChatLinks(chats);

      client.subscribe(chatTopic, { qos: 2 });
      active_chat = chatTopic;
      log(`🟢 Chat aceito! Tópico ${chatTopic}`);
    } else {
      log(`❌ Convite recusado/expirado por ${data.from}`);
    }
  }
}
