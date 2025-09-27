const setChatLinks = (data) => {
  localStorage.setItem(`@chat-links:${id}`, JSON.stringify(data));
};

const getChatLinks = (id) => {
  const existingData = localStorage.getItem(`@chat-links:${id}`);
  if (existingData) {
    const parsed = JSON.parse(existingData);
    return parsed;
  }

  return [];
};

const setGroupLinks = (data) => {
  localStorage.setItem(`@group-links:${id}`, JSON.stringify(data));
};

const getGroupLinks = (id) => {
  const existingData = localStorage.getItem(`@group-links:${id}`);
  if (existingData) {
    const parsed = JSON.parse(existingData);
    return parsed;
  }

  return [];
};

const setGroupsTaken = (data) => {
  localStorage.setItem(`@group-taken`, JSON.stringify(data));
};

const getGroupsTaken = () => {
  const existingData = localStorage.getItem(`@group-taken`);
  if (existingData) {
    const parsed = JSON.parse(existingData);
    return parsed;
  }

  return {};
};

const setChatHistory = (data) => {
  localStorage.setItem(`@history:${id}`, JSON.stringify(data));
};

const getChatHistory = (id) => {
  const existingData = localStorage.getItem(`@history:${id}`);

  if (existingData) {
    return JSON.parse(existingData);
  }

  return {};
};

const getUserData = () => {
  const existingData = localStorage.getItem(`@user`);

  if (existingData) {
    return JSON.parse(existingData);
  }

  return undefined;
};

const setUserData = (data) => {
  localStorage.setItem(`@user`, JSON.stringify(data));
};
