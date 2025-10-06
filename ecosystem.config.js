module.exports = {
  apps: [
    {
      name: 'my-whatsapp-web',
      script: 'index.js',
      cwd: '/iniweb-mount/backend-energeeek-co-id/whatsapp-web-js',
      exec_mode: 'fork',
      instances: 1,  
      interpreter: '/home/ubuntu/.nvm/versions/node/v20.19.5/bin/node',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/ubuntu/.pm2/logs/my-whatsapp-web-error.log',
      out_file: '/home/ubuntu/.pm2/logs/my-whatsapp-web-out.log',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    }
  ]
};
