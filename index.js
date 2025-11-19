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

// WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './session-data' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});

// State
let isReady = false;
let qrCode = null;

// Event Handlers
client.on('qr', qr => {
  qrCode = qr;
  console.log('[QR] QR code received');
  qrcode.toString(qr, { type: 'terminal', small: true }, (err, url) => {
    if (err) console.error('[QR] Terminal QR generation error:', err);
    else console.log('[QR] Terminal QR:\n', url);
  });
});

client.on('ready', () => {
  isReady = true;
  console.log('[WHATSAPP] Client ready');
});

client.on('auth_failure', msg => console.error('[WHATSAPP] Authentication failure:', msg));

client.initialize().catch(err => console.error('[WHATSAPP] Initialization error:', err));
process.on('unhandledRejection', reason => console.error('[PROCESS] Unhandled Rejection:', reason));

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
  if (!qrCode) return res.status(404).json({ error: 'QR not available' });

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
    if (!isReady) return res.status(503).json({ error: 'WhatsApp client not ready' });

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
    await client.destroy();
    console.log('[LOGOUT] WhatsApp client destroyed');

    if (fs.existsSync('./session-data')) {
      console.log('[LOGOUT] Removing session-data folder...');
      fs.rmSync('./session-data', { recursive: true, force: true });
      console.log('[LOGOUT] Session-data cleared');
    }

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
  try {
    await client.destroy();
    console.log('[WHATSAPP] Client destroyed');
  } catch (err) {
    console.error('[WHATSAPP] Error destroying client:', err);
  }
  process.exit(0);
});

client.on('disconnected', async (reason) => {
  console.log('[WHATSAPP] Disconnected:', reason);
  isReady = false;

  if (reason === 'LOGOUT') {
    console.log('[WHATSAPP] Detected logout from WhatsApp (Phone Client)');
    try {
      await client.destroy();
      if (fs.existsSync('./session-data')) {
        fs.rmSync('./session-data', { recursive: true, force: true });
        console.log('[WHATSAPP] Session-data cleared');
      }
      console.log('[WHATSAPP] Please scan QR again to reconnect');
    } catch (err) {
      console.error('[WHATSAPP] Error clearing session after logout:', err);
    }
  } else {
    console.log('[WHATSAPP] Reconnecting in 5 seconds...');
    setTimeout(() => client.initialize(), 5000);
  }
});
