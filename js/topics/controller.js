let pendingInvites = {};

function onlineStatus(data) {
  chats
    .filter((c) => c.members.includes(data.from))
    .forEach((c) => {
      if (!c?.status) {
        c.status = {};

        c.members.forEach((m) => {
          c.status[m] = {
            last_update: 0,
          };
        });
      }

      c.status[data.from] = {
        last_update: data.timestamp,
      };
    });

  setChatLinks(chats);
  renderChats();
}
