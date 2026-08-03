import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import './bot.js'; 

dotenv.config(); 

const app = express(); //Create a new Express application and store it in a variable called app so we can build and run our web server
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Parse incoming JSON requests

// Health check endpoint — hosting platforms use this to verify the app is alive
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Sokoaerial Telegram Bot server is running'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});