import TelegramBot from "node-telegram-bot-api";
import { generateAIResponse } from "../services/aiService.js";

export function handleMessages(bot: TelegramBot) {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text; 
    let typingInterval: NodeJS.Timeout | undefined;

    if (!text) return;

    try {
      await bot.sendChatAction(chatId, "typing");

      typingInterval = setInterval(async () => {
        try {
          await bot.sendChatAction(chatId, "typing");
        } catch {}
      }, 4000);
      const responseText = await generateAIResponse(text);

      await bot.sendMessage(chatId, responseText); // Send AI's answer back
    } catch (error) {
      console.error("Error in message handler:", error);
      await bot.sendMessage(
        chatId,
        "Sorry, I encountered an error processing your request.",
      );
    } finally {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    }
  });
}
