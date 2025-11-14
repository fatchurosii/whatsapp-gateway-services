## 🙏 Thanks

Special thanks to [pedroslopez](https://github.com/pedroslopez) for the [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) library!

## Credits

This project is powered by [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js), developed and maintained by [pedroslopez](https://github.com/pedroslopez).  
Thank you for your contributions to the open-source community!


# Node.js Application

A simple Node.js application using **Node.js v18**.

## Requirements

- Node.js v20.x+
- npm (comes with Node.js)

# Libraries Used
- [express](https://www.npmjs.com/package/express) - Fast, unopinionated, minimalist web framework for Node.js
- [dotenv](https://www.npmjs.com/package/dotenv) - Loads environment
  variables from a `.env` file into `process.env`
  
  ## System Dependencies

  This command installs essential system libraries required for running Chromium-based applications (like Puppeteer) on Linux systems:

  ```bash
  sudo apt install -y \
    libasound2 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdbus-1-3 libdrm2 libgbm1 libnspr4 libnss3 \
    libx11-6 libx11-xcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 \
    libxrandr2 libxkbcommon0 libxshmfence1 \
    libexpat1 libglib2.0-0 libpango-1.0-0 libpangocairo-1.0-0 \
    libgtk-3-0 fonts-liberation xdg-utils ca-certificates
  ```

  These dependencies include:
  - **Audio libraries** (`libasound2`) - For sound support
  - **Accessibility libraries** (`libatk*`) - For accessibility features
  - **Graphics libraries** (`libx11*`, `libdrm2`, `libgbm1`) - For display and rendering
  - **Font rendering** (`libpango*`, `fonts-liberation`) - For text display
  - **Security** (`libnss3`, `ca-certificates`) - For secure connections
  - **GTK components** (`libgtk-3-0`) - For UI elements

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the root of the project:

```bash
cp .env.example .env
```

### 4. Run the application

```bash
node index.js
```

### 5. Run on PM2 
```bash 
pm2 start ecosystem.config.js
````


## Environment Variables

| Name       | Description          | Example        |
|------------|----------------------|----------------|
| APP_NAME   | Your App Name        | Whatsapp Gateway|
| API_TOKEN  | Your API token       | abc123xyz      |
| PORT       | Port to run the app  | 3000           |
| NODE_INTERPRETER | Node.js interpreter  | path to your node version|
