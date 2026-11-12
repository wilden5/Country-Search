import { startApp } from './app.js';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Root element not found');
}

startApp(root);
