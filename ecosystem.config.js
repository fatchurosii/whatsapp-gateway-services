const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function createSlug(key = ''){
  return key
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') 
    .trim() 
    .replace(/^-+|-+$/g, ''); 
}

const appNameRaw = process.env.APP_NAME || path.basename(__dirname);
const appName = createSlug(appNameRaw);

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  
module.exports = {
  apps: [
    {
      name: process.env.APP_NAME,
      script: path.join(__dirname, 'index.js'),
      cwd: __dirname,
      exec_mode: 'cluster',
      instances: 1,
      interpreter: process.env.NODE_INTERPRETER || '/home/ubuntu/.nvm/versions/node/v20.19.5/bin/node',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001,
        API_TOKEN: process.env.API_TOKEN
      },
      error_file: path.join(__dirname, 'logs', `${appName}-error.log`),
      out_file:   path.join(__dirname, 'logs', `${appName}-out.log`),
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    }
  ]
}
