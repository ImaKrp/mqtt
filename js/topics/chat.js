function chatMessage(data, topic) {
  let dt = [];
  if (history?.[topic]) {
    dt = [...history?.[topic]?.msgs];
  }

  dt.push(data);
  history[topic] = {
    msgs: dt,
    last: data,
  };

  setChatHistory(history);

  if (topic === active_chat) renderMessages(history[active_chat]);
}

