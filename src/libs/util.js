import CryptoJS from 'crypto-js'

export const encrptyAES = (data) => {
  const key = CryptoJS.enc.Utf8.parse('H9bhcblkwCslr7cK')
  // const iv = CryptoJS.enc.Utf8.parse('4PEwaZGcu8AVRUU2')
  // var encrypted = CryptoJS.AES.encrypt(data, key, { iv: iv, mode: CryptoJS.mode.CFB, padding: CryptoJS.pad.NoPadding })
  var encrypted = CryptoJS.AES.encrypt(data, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
  return encrypted.ciphertext.toString()
}
