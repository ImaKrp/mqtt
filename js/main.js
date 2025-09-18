let client = null;
let id = null;

function createClient(name) {
  id = name;
  const userTopic = "clientId_" + name;

  client = new Paho.MQTT.Client("localhost", 9001, userTopic);

  client.onConnectionLost = (res) => {
    if (res.errorCode !== 0) {
      log("❌ Conexão perdida: " + res.errorMessage);
    }
  };

  client.onMessageArrived = messageHandler;

  client.connect({
    onSuccess: () => {
      log("✅ Conectado como " + id);

      client.subscribe(userTopic, { qos: 2 });
      client.subscribe("usersStatus", { qos: 2 });

      setInterval(() => {
        const status = new Paho.MQTT.Message(
          JSON.stringify({
            type: "status",
            from: id,
            timestamp: new Date().getTime(),
          })
        );
        status.destinationName = "usersStatus";
        status.qos = 2;
        client.send(status);
      }, 10000);

      document.getElementById("chatControls").style.display = "block";
    },
  });
}

function createChat(targetId) {
  if (pendingInvites[targetId]) {
    log(`📤 Convite já enviado para ${targetId}`);
  }

  const invite = new Paho.MQTT.Message(
    JSON.stringify({
      type: "invite",
      from: id,
      to: targetId,
      timestamp: new Date().getTime(),
    })
  );
  invite.destinationName = "clientId_" + targetId;
  invite.qos = 2;
  client.send(invite);

  log(`📤 Convite enviado para ${targetId}`);

  pendingInvites[targetId] = setTimeout(() => {
    log(`⌛ Convite para ${targetId} expirou`);
    clearTimeout(pendingInvites[targetId]);
    delete pendingInvites[targetId];
  }, 60000);
}
