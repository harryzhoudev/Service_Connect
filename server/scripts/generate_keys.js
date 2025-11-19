//just a script to help generate RSA key pairs for JWT signing OR you can use built in openssl command in terminal
const { generateKeyPairSync } = require('crypto');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const priv = privateKey
  .export({ type: 'pkcs1', format: 'pem' })
  .replace(/\n/g, '\\n');
const pub = publicKey
  .export({ type: 'pkcs1', format: 'pem' })
  .replace(/\n/g, '\\n');

console.log('PRIVATE=' + priv);
console.log('PUBLIC=' + pub);
