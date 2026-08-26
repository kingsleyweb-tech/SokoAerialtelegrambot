import TelegramBot from "node-telegram-bot-api";
import { generateAIResponse } from "../services/aiService.js";
import {
  getSession,
  updateSession,
  refreshSessionTimestamp,
  checkInactivityAndReset,
  resetSession
} from "../services/sessionService.js";
import {
  getKeyboardForMenu,
  getKeyboardForTopic,
  PROMPT_MAPPINGS
} from "../services/keyboardService.js";

const WELCOME_TEXT = `👋 *Welcome to Soko AI!*

I'm Soko, your AI assistant for Soko Aerial. I can help you learn about precision aerial mapping, industrial inspections, drone pilot training programs, and custom drone research in West Africa.

What would you like to explore today?`;

/**
 * Safely sends a text message, falling back to plaintext if Markdown parsing fails.
 */
async function sendMessageSafe(
  bot: TelegramBot,
  chatId: number,
  text: string,
  options?: any
): Promise<any> {
  try {
    return await bot.sendMessage(chatId, text, {
      ...options,
      parse_mode: "Markdown"
    });
  } catch (error) {
    console.warn("Markdown sendMessage failed, falling back to plaintext:", error);
    return await bot.sendMessage(chatId, text, {
      ...options,
      parse_mode: undefined
    });
  }
}

/**
 * Safely edits an existing message text, falling back to plaintext if Markdown parsing fails.
 */
async function editMessageSafe(
  bot: TelegramBot,
  chatId: number,
  messageId: number,
  text: string,
  options?: any
): Promise<any> {
  try {
    return await bot.editMessageText(text, {
      ...options,
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown"
    });
  } catch (error) {
    console.warn("Markdown editMessage failed, falling back to plaintext:", error);
    return await bot.editMessageText(text, {
      ...options,
      chat_id: chatId,
      message_id: messageId,
      parse_mode: undefined
    });
  }
}

export function handleMessages(bot: TelegramBot) {
  // Listen for callback queries from Telegram inline button clicks
  bot.on("callback_query", async (callbackQuery) => {
    const msg = callbackQuery.message;
    if (!msg) return;

    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const data = callbackQuery.data;

    if (!data) return;

    try {
      // 1. Acknowledge callback click immediately to stop the button loading animation
      await bot.answerCallbackQuery(callbackQuery.id);

      // 2. Perform passive 15-minute inactivity check
      const { wasReset, session } = checkInactivityAndReset(chatId);
      refreshSessionTimestamp(chatId);

      if (wasReset) {
        const welcomeBackText = `👋 *Welcome back to Soko!*

Your previous session expired due to inactivity. What would you like to do?`;
        await editMessageSafe(bot, chatId, messageId, welcomeBackText, {
          reply_markup: getKeyboardForMenu("main")
        });
        return;
      }

      // 3. Handle menu navigation buttons
      if (data.startsWith("menu:")) {
        const menu = data.split(":")[1];
        if (menu === "main") {
          await editMessageSafe(bot, chatId, messageId, WELCOME_TEXT, {
            reply_markup: getKeyboardForMenu("main")
          });
          updateSession(chatId, { currentTopic: undefined });
        } else {
          let menuText = "";
          if (menu === "training") {
            menuText = `🎓 *Drone Training Programs*
We offer professional drone training via the Centre for Unmanned Aerial Vehicles Research and Education (CUAVRE).

What would you like to explore?`;
          } else if (menu === "services") {
            menuText = `🚁 *Precision Aerial Services*
We offer high-quality drone imaging, mapping, and inspections to mitigate risks and boost productivity.

Select a service sector to learn more:`;
          } else if (menu === "research") {
            menuText = `🔬 *Research & Tech Innovation*
Our research lab (UASRL) and communication unit work on fixed-wing drones, surveillance, and tracking.

Select a project to explore:`;
          } else if (menu === "contact") {
            menuText = `📞 *Contact & Information*
Get in touch with Soko Aerial or find our office location in Accra, Ghana.

Select an option below:`;
          }
          await editMessageSafe(bot, chatId, messageId, menuText, {
            reply_markup: getKeyboardForMenu(menu)
          });
          updateSession(chatId, { currentTopic: menu });
        }
      }
      // 4. Handle preconfigured query shortcut buttons
      else if (data.startsWith("prompt:")) {
        const promptKey = data.split(":")[1];
        const question = PROMPT_MAPPINGS[promptKey];
        if (!question) return;

        // Infer context topic if not already tracked
        let topic = session.currentTopic;
        if (!topic) {
          if (["courses", "register"].includes(promptKey)) topic = "training";
          else if (["mining", "aec", "agriculture", "disaster"].includes(promptKey)) topic = "services";
          else if (["ahuoden", "tracking"].includes(promptKey)) topic = "research";
          else if (["location", "phone", "social"].includes(promptKey)) topic = "contact";
        }

        // Return a direct response for the registration form to improve responsiveness
        if (promptKey === "register") {
          const registerResponse = `✍️ *Register for Drone Training*

You can register for drone piloting, data processing, and GIS mapping courses through our online portal:
🔗 [Training Registration Form](https://edu.sokoaerial.com/login/signup.php)

Alternatively, feel free to visit our center at *Supply Bus Stop, Burma Camp, Accra* or call us at:
• +233 30 277 6296
• +233 24 324 9309

Would you like to know more?`;
          await editMessageSafe(bot, chatId, messageId, registerResponse, {
            reply_markup: getKeyboardForTopic("training")
          });
          updateSession(chatId, {
            currentTopic: "training",
            history: [
              ...session.history,
              { role: "user", content: question },
              { role: "assistant", content: registerResponse }
            ]
          });
          return;
        }

        // Edit current message to show analyzer indicator
        await editMessageSafe(bot, chatId, messageId, `🔄 *Soko is analyzing request...*`);
        await bot.sendChatAction(chatId, "typing");

        // Request AI answer with history context
        const responseText = await generateAIResponse(question, session.history);
        const formattedResponse = `${responseText}\n\nWould you like to know more?`;

        await editMessageSafe(bot, chatId, messageId, formattedResponse, {
          reply_markup: getKeyboardForTopic(topic)
        });

        updateSession(chatId, {
          currentTopic: topic,
          history: [
            ...session.history,
            { role: "user", content: question },
            { role: "assistant", content: responseText }
          ]
        });
      }
    } catch (error) {
      console.error("Error in callback handler:", error);
      try {
        await bot.sendMessage(
          chatId,
          "Sorry, something went wrong. Please try again."
        );
      } catch {}
    }
  });

  // Listen for normal text messages
  bot.on("message", async (msg) => {
    // Intercept bot command parameters
    if (msg.text && msg.text.startsWith("/")) {
      if (msg.text === "/start") {
        const chatId = msg.chat.id;
        resetSession(chatId);
        refreshSessionTimestamp(chatId);
        const sentMsg = await sendMessageSafe(bot, chatId, WELCOME_TEXT, {
          reply_markup: getKeyboardForMenu("main")
        });
        updateSession(chatId, { lastBotMessageId: sentMsg.message_id });
      }
      return;
    }

    const chatId = msg.chat.id;
    const text = msg.text;
    let typingInterval: NodeJS.Timeout | undefined;

    if (!text) return;

    try {
      // 1. Passive 15-minute inactivity check
      const { wasReset, session } = checkInactivityAndReset(chatId);
      refreshSessionTimestamp(chatId);

      let prefixMsg = "";
      if (wasReset) {
        prefixMsg = `⚠️ *Note: Your previous session expired due to inactivity. Starting a new session...*\n\n`;
      }

      await bot.sendChatAction(chatId, "typing");
      typingInterval = setInterval(async () => {
        try {
          await bot.sendChatAction(chatId, "typing");
        } catch {}
      }, 4000);

      // 2. Request AI answer with session history
      const responseText = await generateAIResponse(text, session.history);

      // 3. Detect context topic dynamically if none is active
      let topic = session.currentTopic;
      if (!topic) {
        const normalizedText = text.toLowerCase();
        if (
          normalizedText.includes("course") ||
          normalizedText.includes("train") ||
          normalizedText.includes("pilot") ||
          normalizedText.includes("gis") ||
          normalizedText.includes("school") ||
          normalizedText.includes("register")
        ) {
          topic = "training";
        } else if (
          normalizedText.includes("mining") ||
          normalizedText.includes("crop") ||
          normalizedText.includes("farm") ||
          normalizedText.includes("inspect") ||
          normalizedText.includes("survey") ||
          normalizedText.includes("map") ||
          normalizedText.includes("aec") ||
          normalizedText.includes("construction") ||
          normalizedText.includes("bridge") ||
          normalizedText.includes("structure")
        ) {
          topic = "services";
        } else if (
          normalizedText.includes("ahuoden") ||
          normalizedText.includes("research") ||
          normalizedText.includes("lab") ||
          normalizedText.includes("track") ||
          normalizedText.includes("software")
        ) {
          topic = "research";
        } else if (
          normalizedText.includes("phone") ||
          normalizedText.includes("email") ||
          normalizedText.includes("call") ||
          normalizedText.includes("address") ||
          normalizedText.includes("location") ||
          normalizedText.includes("contact")
        ) {
          topic = "contact";
        }
      }

      const finalResponse = `${prefixMsg}${responseText}\n\nWould you like to know more?`;
      const sentMsg = await sendMessageSafe(bot, chatId, finalResponse, {
        reply_markup: getKeyboardForTopic(topic)
      });

      updateSession(chatId, {
        currentTopic: topic,
        lastBotMessageId: sentMsg.message_id,
        history: [
          ...session.history,
          { role: "user", content: text },
          { role: "assistant", content: responseText }
        ]
      });

    } catch (error) {
      console.error("Error in message handler:", error);
      await bot.sendMessage(
        chatId,
        "Sorry, I encountered an error processing your request. Please try again."
      );
    } finally {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    }
  });
}

