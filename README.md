# Soko Aerial Telegram Bot

An intelligent, AI-powered Telegram chatbot designed for Soko Aerial. The bot provides automated customer support, training details, company info, and quick links for clients.

It uses **Cloudflare Workers AI** (Meta LLaMA 3.1 8B Instruct model) combined with a local custom knowledge base to provide grounded, accurate answers.

---

## Features

- **AI-Powered Q&A**: Answers queries using context from a local knowledge base.
- **Grounded Responses**: AI is instructed to only answer using verified company facts.
- **Typing Indicator**: Displays "typing..." in Telegram while generating responses.
- **Health Check Endpoint**: Includes a `/health` route for service monitoring (ideal for Render, Railway, etc.).

---

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Bot Wrapper**: `node-telegram-bot-api`
- **AI Engine**: Cloudflare Workers AI (LLaMA 3.1 8B Instruct)

---

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kingsleyweb-tech/SokoAerialtelegrambot.git
   cd SokoAerialtelegrambot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
   ```

4. **Prepare the Knowledge Base**:
   Ensure Soko Aerial company details are written in `src/knowledge/soko-aerial.txt` or `knowledge/soko-aerial.txt`.

---

## Available Scripts

In the project directory, you can run:

- **`npm run dev`**: Runs the app in development mode with automatic restart on file changes.
- **`npm run build`**: Compiles TypeScript files into JavaScript inside the `dist/` folder.
- **`npm run start`**: Runs the compiled JavaScript files (production mode).

---

## Project Structure

```text
sokoaerial-telegram-bot/
├── knowledge/             # Production knowledge base
├── src/                   # TypeScript source code
│   ├── bot.ts             # Bot initialization & polling
│   ├── server.ts          # Express server & health route
│   ├── handlers/          # Message event handlers
│   ├── knowledge/         # Primary development knowledge base
│   └── services/          # AI & Knowledge loading services
├── .env                   # Environment variables (git-ignored)
├── tsconfig.json          # TypeScript config
└── README.md              # Project documentation
```
