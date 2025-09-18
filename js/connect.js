let id = null;
let client = null;

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

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("❌ Conexão perdida: " + responseObject.errorMessage);
  }
}

createClient(prompt("Digite seu ID para entrar no sistema:"));
