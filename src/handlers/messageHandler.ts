import TelegramBot from "node-telegram-bot-api";
import { generateAIResponse } from "../services/aiService.js";

export function handleMessages(bot: TelegramBot) {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id; // Unique ID of the chat/user
    const text = msg.text; // The message text the user sent

    if (!text) return;

    try {
      // Show "typing..." 
      await bot.sendChatAction(chatId, "typing");

      // Keep refreshing the typing indicator every 4 seconds
      const typingInterval = setInterval(async () => {
        try {
          await bot.sendChatAction(chatId, "typing");
        } catch {}
      }, 4000);

      // Send the user's question to the AI and wait for a response
      const responseText = await generateAIResponse(text);

      clearInterval(typingInterval); 

      await bot.sendMessage(chatId, responseText); // Send AI's answer back
    } catch (error) {
      console.error("Error in message handler:", error);
      await bot.sendMessage(
        chatId,
        "Sorry, I encountered an error processing your request.",
      );
    }
  });
}
