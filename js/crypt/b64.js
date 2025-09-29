const keyBase64 = "kPH+bIxk5D2deZiIxcaaaA==";

function decrypt(payload) {
  if (!keyBase64 || !payload) return payload;
  const [ivB64, ctB64] = payload.split(":");
  if (!ivB64 || !ctB64) throw new Error("Invalid payload format");

  const key = CryptoJS.enc.Base64.parse(keyBase64);
  const iv = CryptoJS.enc.Base64.parse(ivB64);
  const ciphertext = CryptoJS.enc.Base64.parse(ctB64);

  const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

function encrypt(plain) {
  if (!keyBase64 || !plain) return plain;

  const key = CryptoJS.enc.Base64.parse(keyBase64);

  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(plain, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return (
    iv.toString(CryptoJS.enc.Base64) +
    ":" +
    encrypted.ciphertext.toString(CryptoJS.enc.Base64)
  );
}
