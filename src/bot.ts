import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { handleMessages } from "./handlers/messageHandler.js";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN; 

if (!token) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN is not defined in the environment variables."
  );
}

const usePolling = process.env.NODE_ENV !== "production";

const bot = new TelegramBot(token, { polling: false });

handleMessages(bot); 

if (usePolling) {
  bot
    .deleteWebHook()
    .then(() => bot.startPolling())
    .catch((error) => {
      console.error("Failed to start Telegram polling:", error);
    });
}

console.log(
  usePolling
    ? "Telegram bot is running with polling..."
    : "Telegram bot is running with webhooks...",
);

export default bot;
