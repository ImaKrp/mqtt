function chatMessage(data, topic) {
  let dt = [];
  if (history?.[topic]) {
    dt = [...history?.[topic]];
  }

  dt.push(data);
  history[topic] = dt;

  setChatHistory(history);

  receiveMessage(data);
}
