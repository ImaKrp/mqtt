function createChat(targetId) {
  const invite = new Paho.MQTT.Message(
    JSON.stringify({
      type: "invite",
      from: id,
      to: targetId,
    })
  );
  invite.destinationName = "clientId_" + targetId; // canal de controle
  invite.qos = 2;
  client.send(invite);
  console.log(`📨 Convite enviado para ${targetId}`);
}

function sendChatMessage(chatTopic, text) {
  const msg = new Paho.MQTT.Message(
    JSON.stringify({
      type: "chat",
      from: id,
      txt: text,
    })
  );
  msg.destinationName = chatTopic;
  msg.qos = 2;
  msg.destinationName = chatTopic;
  client.send(msg);
}

function onChMessageArrived(message) {
  const data = JSON.parse(message.payloadString);
  console.log("📩 Recebido:", data);

  if (data.type === "invite" && data.to === id) {
    const accept = confirm(`${data.from} quer abrir um chat. Aceitar?`);
    if (accept) {
      const chatTopic = `chat/${data.from}_${id}`;
      client.subscribe(chatTopic, { qos: 2 });
      console.log(`🟢 Entrou no chat: ${chatTopic}`);

      // avisa que aceitou
      sendChatMessage(chatTopic, `Chat iniciado entre ${data.from} e ${id}`);
    }
  } else if (data.type === "chat") {
    console.log(`💬 ${data.from}: ${data.txt}`);
  }
}
