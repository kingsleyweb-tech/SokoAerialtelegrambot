import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import bot from './bot.js'; 

dotenv.config(); 

const app = express(); //Create a new Express application and store it in a variable called app so we can build and run our web server
const PORT = process.env.PORT || 3000;
const webhookPath = `/telegram/${process.env.TELEGRAM_BOT_TOKEN}`;
const webhookBaseUrl =
  process.env.WEBHOOK_URL ||
  process.env.VERCEL_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  process.env.RENDER_EXTERNAL_HOSTNAME;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).send("<h1>Soko Aerial Telegram Bot is active and running!</h1><p>Visit <a href='/health'>/health</a> for the system status check.</p>");
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Sokoaerial Telegram Bot server is running'
  });
});

app.post(webhookPath, (req: Request, res: Response) => {
  res.sendStatus(200);
  bot.processUpdate(req.body);
});

app.get('/setup-webhook', async (req: Request, res: Response) => {
  try {
    if (webhookBaseUrl) {
      const normalizedBaseUrl = webhookBaseUrl.startsWith("http")
        ? webhookBaseUrl
        : `https://${webhookBaseUrl}`;
      await bot.setWebHook(`${normalizedBaseUrl}${webhookPath}`);
      res.status(200).send(`Webhook successfully set to ${normalizedBaseUrl}${webhookPath}`);
    } else {
      res.status(400).send("Webhook URL not configured.");
    }
  } catch (error: any) {
    res.status(500).send(`Failed to set webhook: ${error.message}`);
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    if (process.env.NODE_ENV === "production" && webhookBaseUrl) {
      const normalizedBaseUrl = webhookBaseUrl.startsWith("http")
        ? webhookBaseUrl
        : `https://${webhookBaseUrl}`;

      bot
        .setWebHook(`${normalizedBaseUrl}${webhookPath}`)
        .then(() => {
          console.log(`Telegram webhook set to ${normalizedBaseUrl}/telegram/[token]`);
        })
        .catch((error) => {
          console.error("Failed to set Telegram webhook:", error);
        });
    }
  });
}

export default app;
