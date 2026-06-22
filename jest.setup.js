require('@testing-library/jest-dom');
require('whatwg-fetch');

// Polyfill for Node.js globals in jsdom environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
