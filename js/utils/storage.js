function encryptJson(data) {
  const json = JSON.stringify(data);
  return encrypt(json);
}

function decryptJson(payload) {
  const decrypted = decrypt(payload);
  return JSON.parse(decrypted);
}

const setChatLinks = (data) => {
  console.log(data);
  localStorage.setItem(`@chat-links:${id}`, encryptJson(data));
};

const getChatLinks = () => {
  const existingData = localStorage.getItem(`@chat-links:${id}`);
  if (existingData) {
    return decryptJson(existingData);
  }
  return [];
};

const setGroupLinks = (data) => {
  localStorage.setItem(`@group-links:${id}`, encryptJson(data));
};

const getGroupLinks = () => {
  const existingData = localStorage.getItem(`@group-links:${id}`);
  if (existingData) {
    return decryptJson(existingData);
  }
  return [];
};

const setGroupsTaken = (data) => {
  localStorage.setItem(`@group-taken`, encryptJson(data));
};

const getGroupsTaken = () => {
  const existingData = localStorage.getItem(`@group-taken`);
  if (existingData) {
    return decryptJson(existingData);
  }
  return {};
};

const setChatHistory = (data) => {
  localStorage.setItem(`@history:${id}`, encryptJson(data));
};

const getChatHistory = () => {
  const existingData = localStorage.getItem(`@history:${id}`);
  if (existingData) {
    return decryptJson(existingData);
  }
  return {};
};

const setUserData = (data) => {
  localStorage.setItem(`@user`, encryptJson(data));
};

const getUserData = () => {
  const existingData = localStorage.getItem(`@user`);
  if (existingData) {
    return decryptJson(existingData);
  }
  return undefined;
};
