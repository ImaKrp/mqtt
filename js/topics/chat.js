function chatMessage(data, topic) {
  let dt = [];
  if (history?.[topic]) {
    dt = [...history?.[topic]];
  }

  dt.push(data);
  history[topic] = dt;

  setChatHistory(history);

  console.log(history);

  // receiveMessage(data);
  renderMessages(history[active_chat]);
}
