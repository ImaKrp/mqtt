const setChatLinks = (data) => {
  localStorage.setItem(`@links:${id}`, JSON.stringify(data));
};

const getChatLinks = (id) => {
  const existingData = localStorage.getItem(`@links:${id}`);

  if (existingData) {
    return JSON.parse(existingData);
  }

  return [];
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
