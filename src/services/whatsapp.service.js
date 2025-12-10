// services/whatsapp.service.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const db = require('../models');

const WAIT = (ms) => new Promise(r => setTimeout(r, ms));
const clients = new Map();

function makeDataPath(clientId) {
  return `./session-data/${clientId}`;
}

function registerEvents(cli, clientId) {
  cli.on('qr', qr => {
    const store = clients.get(clientId);
    if (store) store.qr = qr;
    console.log(`[${clientId}] QR received`);
  });

  cli.on('ready', async () => {
    const store = clients.get(clientId);
    if (store) {
      store.isReady = true;
      await db.Device.update(
        { client_status: 1 },
        { where: { deviceKey: clientId } }
      );
    }
    console.log(`[${clientId}] Client ready`);
  });

  cli.on('authenticated', () => console.log(`[${clientId}] Authenticated`));

  cli.on('auth_failure', async msg => {
    console.error(`[${clientId}] Auth failure`, msg);
    await resetClient(clientId, 'auth_failure');
  });

  cli.on('disconnected', async reason => {
    console.log(`[${clientId}] Disconnected:`, reason);
    const store = clients.get(clientId);
    if (store) {
      store.isReady = false;
      await db.Device.update(
        { client_status: 0 },
        { where: { deviceKey: clientId } }
      );
    }
    if (reason === 'LOGOUT') await resetClient(clientId, 'logout');
  });

  cli.on('error', async (err) => {
    console.error(`[${clientId}] Client error:`, err);
    if (err && String(err).includes('Target closed')) {
      await resetClient(clientId, 'target_closed');
    }
  });
}

async function createClient(clientId, opts = {}) {
  if (!clientId) throw new Error('clientId required');

  if (clients.has(clientId)) return clients.get(clientId);

  const store = {
    clientId,
    client: null,
    isReady: false,
    qr: null,
    initializing: false,
    destroying: false,
  };
  clients.set(clientId, store);

  try {
    store.initializing = true;
    const dataPath = makeDataPath(clientId);

    const client = new Client({
      authStrategy: new LocalAuth({ clientId, dataPath }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--single-process'
        ]
      }
    });

    store.client = client;
    registerEvents(client, clientId);

    // initialize might take time; registerEvents will update store.isReady and store.qr
    await client.initialize();
    console.log(`[${clientId}] initialize() resolved`);
  } catch (err) {
    console.error(`[${clientId}] Initialization failed:`, err);
    // cleanup partial store
    await destroyClient(clientId);
    throw err;
  } finally {
    store.initializing = false;
  }

  // Return the whole store so caller dapat baca isReady/qr/client
  return store;
}

async function destroyClient(clientId) {
  const store = clients.get(clientId);
  if (!store) return;
  if (store.destroying) return;
  store.destroying = true;

  try {
    try {
      if (store.client) {
        await store.client.destroy();
        console.log(`[${clientId}] Client destroyed`);
      }
    } catch (err) {
      console.warn(`[${clientId}] Error destroying client (ignored):`, err);
    }

    try {
      const path = makeDataPath(clientId);
      if (fs.existsSync(path)) fs.rmSync(path, { recursive: true, force: true });
      console.log(`[${clientId}] Session-data removed`);
    } catch (err) {
      console.error(`[${clientId}] Error removing session-data:`, err);
    }

    clients.delete(clientId);
    await db.Device.update(
      { client_status: 0 },
      { where: { deviceKey: clientId } }
    );
    
  } finally {
    store.destroying = false;
  }
}

async function destroyAll() {
  const ids = Array.from(clients.keys());
  for (const id of ids) {
    await destroyClient(id);
  }
}

async function resetClient(clientId, reason = 'manual') {
  console.log(`[${clientId}] resetClient triggered (${reason})`);
  await destroyClient(clientId);
  await WAIT(2000);
  return createClient(clientId);
}

function getStatus(clientId) {
  const store = clients.get(clientId);
  if (!store) return { exists: false };
  return {
    exists: true,
    isReady: !!store.isReady,
    initializing: !!store.initializing,
    qrAvailable: !!store.qr,
    // optionally include raw qr string (dangerous to return to client in prod)
    // qr: store.qr
  };
}

async function getQrImage(clientId) {
  const store = clients.get(clientId);
  if (!store || !store.qr) throw new Error('QR not available');
  return await qrcode.toDataURL(store.qr);
}

async function sendMessage(clientId, number, message) {
  const store = clients.get(clientId);
  if (!store || !store.client || !store.isReady) throw new Error('client not ready');
  const formattedNumber = number.startsWith('0') ? '62' + number.slice(1) : number;
  const chatId = `${formattedNumber}@c.us`;
  const sent = await store.client.sendMessage(chatId, message);
  return sent;
}

function getClient(clientId) {
  const store = clients.get(clientId);
  if (!store) {
    return false
  }
  return Promise.resolve(store);
}

module.exports = {
  createClient,
  destroyClient,
  resetClient,
  getStatus,
  getQrImage,
  sendMessage,
  destroyAll,
  getClient
};
