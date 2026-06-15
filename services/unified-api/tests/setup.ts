// Jest global setup - start unified-api server before tests

import { startServer } from '../src/server';

let serverProcess: any;

module.exports = async () => {
  console.log('Starting unified-api server for tests...');

  try {
    // Start server
    const serverPromise = startServer();

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Server started. Running tests...');

    // Store for teardown
    (global as any).serverStarted = true;
  } catch (err) {
    console.error('Failed to start server:', err);
    throw err;
  }
};
