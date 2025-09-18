function onGrMessageArrived(message) {
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