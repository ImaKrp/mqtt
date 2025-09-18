let client = null;
let id = null;
let pendingInvites = {};

function log(msg) {
  const el = document.getElementById("log");
  el.innerHTML += msg + "<br/>";
  el.scrollTop = el.scrollHeight;
}

function createClient(name) {
  id = name;
  const userTopic = "clientId_" + name;

  client = new Paho.MQTT.Client("localhost", 9001, userTopic);

  client.onConnectionLost = (res) => {
    if (res.errorCode !== 0) {
      log("❌ Conexão perdida: " + res.errorMessage);
    }
  };

  client.onMessageArrived = onMessageArrived;

  client.connect({
    onSuccess: () => {
      log("✅ Conectado como " + id);

      client.subscribe(userTopic, { qos: 2 });
      client.subscribe("usersStatus", { qos: 2 });

      const status = new Paho.MQTT.Message(
        JSON.stringify({
          type: "status",
          from: id,
          txt: `${id} online`,
        })
      );
      status.destinationName = "usersStatus";
      status.qos = 2;
      client.send(status);

      document.getElementById("chatControls").style.display = "block";
    },
  });
}

// 🔗 criar convite de chat
function createChat(targetId) {
  const invite = new Paho.MQTT.Message(
    JSON.stringify({
      type: "invite",
      from: id,
      to: targetId,
      timestamp: Date.now(),
    })
  );
  invite.destinationName = "clientId_" + targetId;
  invite.qos = 2;
  client.send(invite);

  log(`📤 Convite enviado para ${targetId}`);

  // inicia timeout de 1 minuto
  pendingInvites[targetId] = setTimeout(() => {
    log(`⌛ Convite para ${targetId} expirou`);
    const expired = new Paho.MQTT.Message(
      JSON.stringify({
        type: "inviteResponse",
        from: targetId,
        to: id,
        accepted: false,
        reason: "timeout",
      })
    );
    expired.destinationName = "clientId_" + id;
    expired.qos = 2;
    client.send(expired);
  }, 60000);
}

// 📩 handler de mensagens
function onMessageArrived(message) {
  const data = JSON.parse(message.payloadString);
  log("📩 " + JSON.stringify(data));

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
      client.subscribe(chatTopic, { qos: 2 });
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
      client.subscribe(chatTopic, { qos: 2 });
      log(`🟢 Chat aceito! Tópico ${chatTopic}`);
    } else {
      log(`❌ Convite recusado/expirado por ${data.from}`);
    }
  }
}

// 🚀 bind dos botões
document.getElementById("connectBtn").addEventListener("click", () => {
  const name = document.getElementById("username").value.trim();
  if (name) createClient(name);
});

document.getElementById("chatBtn").addEventListener("click", () => {
  const targetId = document.getElementById("targetId").value.trim();
  if (targetId) createChat(targetId);
});
