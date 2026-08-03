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

// Create bot instance with polling (continuously checks Telegram for new messages)
const bot = new TelegramBot(token, {
  polling: true,
});

handleMessages(bot); // Start listening for user messages

console.log("Telegram bot is running...");

export default bot;