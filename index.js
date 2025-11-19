const express = require('express');
const bodyParser = require('body-parser');
const qrcode = require('qrcode');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const TOKEN = process.env.API_TOKEN;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

let client = null;
let isReady = false;
let qrCode = null;
let isInitializing = false;
let isDestroying = false;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Register events for a client instance
function registerClientEvents(cli) {
  cli.on('qr', qr => {
    qrCode = qr;
    console.log('[QR] QR code received');
    qrcode.toString(qr, { type: 'terminal', small: true }, (err, url) => {
      if (err) console.error('[QR] Terminal QR generation error:', err);
      else console.log('[QR] Terminal QR:\n', url);
    });
  });

  cli.on('ready', () => {
    isReady = true;
    console.log('[WHATSAPP] Client ready');
  });

  cli.on('authenticated', () => {
    console.log('[WHATSAPP] Client authenticated');
  });

  cli.on('auth_failure', async msg => {
    console.error('[WHATSAPP] Authentication failure:', msg);
    await safeResetClient('auth_failure');
  });

  cli.on('disconnected', async reason => {
    console.log('[WHATSAPP] Disconnected:', reason);
    isReady = false;

    if (reason === 'LOGOUT') {
      console.log('[WHATSAPP] Logout detected from phone. Resetting session and re-initializing...');
      await safeResetClient('logout');
    } else {
      console.log('[WHATSAPP] Unexpected disconnect. Attempting to reset client in 5s...');
      setTimeout(() => safeResetClient('disconnect'), 5000);
    }
  });

  cli.on('error', async (err) => {
    console.error('[WHATSAPP] Client error:', err);

    if (err && String(err).includes('Target closed')) {
      console.log('[WHATSAPP] Detected target closed error -> resetting client');
      await safeResetClient('target_closed');
    }
  });
}

async function startClient() {
  if (isInitializing) {
    console.log('[WHATSAPP] startClient called but initialization already in progress');
    return;
  }
  isInitializing = true;

  try {
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: './session-data' }),
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

    registerClientEvents(client);

    console.log('[WHATSAPP] Initializing client...');
    await client.initialize();
    console.log('[WHATSAPP] client.initialize() resolved');
  } catch (err) {
    console.error('[WHATSAPP] Initialization error:', err);
    try {
      if (client) {
        await safeDestroyClient();
      }
    } catch (e) {
      console.error('[WHATSAPP] Error during cleanup after failed init:', e);
    }
  
    console.log('[WHATSAPP] Waiting 5s before next init attempt...');
    await wait(5000);
  } finally {
    isInitializing = false;
  }
}

// Safe destroy the current client (if any)
async function safeDestroyClient() {
  if (!client) return;
  if (isDestroying) {
    console.log('[WHATSAPP] destroy already in progress');
    return;
  }
  isDestroying = true;

  try {
    try {
      // await destroy but guard errors
      await client.destroy();
      console.log('[WHATSAPP] Client destroyed');
    } catch (err) {
      console.warn('[WHATSAPP] client.destroy() error (ignored):', err);
    }
    client = null;
  } finally {
    isDestroying = false;
  }
}

// Safe reset: destroy + remove session-data + start new client
async function safeResetClient(reason = 'manual') {
  console.log(`[WHATSAPP] safeResetClient triggered (${reason})`);
  // Prevent concurrent resets
  if (isDestroying || isInitializing) {
    console.log('[WHATSAPP] Reset already in progress, skipping duplicate request');
    return;
  }

  // 1. Destroy current client
  await safeDestroyClient();

  // 2. Remove session-data folder (if exists)
  try {
    if (fs.existsSync('./session-data')) {
      fs.rmSync('./session-data', { recursive: true, force: true });
      console.log('[WHATSAPP] Session-data cleared');
    }
  } catch (err) {
    console.error('[WHATSAPP] Error clearing session-data:', err);
  }

  // Reset flags/state
  qrCode = null;
  isReady = false;

  // 3. Small delay to allow Chrome processes to exit fully
  await wait(5000);

  // 4. Start new client
  await startClient();
}

// Start initial client
startClient();

// Global unhandled rejection logger
process.on('unhandledRejection', (reason, promise) => {
  console.error('[PROCESS] Unhandled Rejection:', reason);
});

// Auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
  const token = authHeader.split(' ')[1];
  if (token !== TOKEN) return res.status(403).json({ error: 'Invalid token' });
  next();
};

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'running', whatsapp: isReady ? 'connected' : 'disconnected' });
});

app.get('/qr', authenticate, async (req, res) => {
  if (!qrCode) {
    return res.status(400).json({ error: 'QR not available yet, please wait a moment' });
  }

  try {
    const qrImage = await qrcode.toDataURL(qrCode);
    res.send(`
      <html>
        <head><title>WhatsApp QR</title></head>
        <body style="font-family:Arial;text-align:center;padding:20px">
          <h2>Scan WhatsApp QR Code</h2>
          <img src="${qrImage}" style="max-width:300px;margin:20px auto;display:block;" />
          <p>Scan this code with your phone</p>
        </body>
      </html>
    `);
    console.log('[QR] QR code page served successfully');
  } catch (err) {
    console.error('[QR] Error generating QR page:', err);
    res.status(500).json({ error: 'Failed to generate QR' });
  }
});

app.post('/send-message', authenticate, async (req, res) => {
  const { number, message } = req.body;
  if (!number || !message) return res.status(400).json({ error: 'Number and message required' });

  try {
    if (!isReady || !client) return res.status(503).json({ error: 'WhatsApp client not ready' });

    const formattedNumber = number.startsWith('0') ? '62' + number.slice(1) : number;
    const chatId = `${formattedNumber}@c.us`;

    const sentMessage = await client.sendMessage(chatId, message);
    console.log(`[SEND] Text message sent to ${formattedNumber}, ID: ${sentMessage.id.id}`);
    res.json({ success: true, messageId: sentMessage.id.id, timestamp: sentMessage.timestamp });
  } catch (err) {
    console.error('[SEND] Error sending text message:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/logout', authenticate, async (req, res) => {
  try {
    await safeResetClient('manual_logout');
    res.json({ success: true, message: 'Logged out and session cleared' });
  } catch (err) {
    console.error('[LOGOUT] Error during logout:', err);
    res.status(500).json({ error: err.message });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('[ERROR] Internal server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => console.log(`[SERVER] Server running on port ${port}`));

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[PROCESS] Shutting down gracefully...');
  await safeDestroyClient();
  process.exit(0);
});
