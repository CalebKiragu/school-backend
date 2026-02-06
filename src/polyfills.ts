// Polyfills for Node.js 18 compatibility

// Crypto polyfill for TypeORM
if (!global.crypto) {
  const { webcrypto } = require('crypto');
  global.crypto = webcrypto;
}

// Additional polyfills can be added here as needed
