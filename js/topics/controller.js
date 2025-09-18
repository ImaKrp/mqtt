function createClient(name) {
  if (!name) return;

  id = name;
  const userTopic = "clientId_" + name;
  client = new Paho.MQTT.Client("localhost", 9001, userTopic);

  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  client.connect({
    onSuccess: function () {
      console.log("✅ Conectado:", userTopic);

      // assina tópicos de controle
      client.subscribe(userTopic, { qos: 2 });
      client.subscribe("usersStatus", { qos: 2 });

      // avisa que está online
      let status = new Paho.MQTT.Message(
        JSON.stringify({
          type: "status",
          from: id,
          txt: userTopic + ": online",
        })
      );
      status.destinationName = "usersStatus";
      status.qos = 2;
      msg.retained = status;
      client.send(status);

      // 🚀 só aqui podemos convidar outro usuário
      const targetId = prompt("Digite o id do cara que quer se conectar:");
      if (targetId) {
        createChat(targetId);
      }
    },
  });
}

function onCoMessageArrived(message) {
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