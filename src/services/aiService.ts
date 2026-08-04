import axios from "axios";
import dotenv from "dotenv";
import { getKnowledgeBase } from "./knowledgeService.js";

dotenv.config();

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!ACCOUNT_ID || !API_TOKEN) {
  throw new Error("Cloudflare credentials are missing");
}

export async function generateAIResponse(
  question: string
): Promise<string> {
  const knowledge = getKnowledgeBase();

  try {
    // Send request to Cloudflare Workers AI (LLaMA 3.1 8B model)
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        messages: [
          {
            role: "system",
            content:
`
You are a helpful assistant for Soko Aerial.

Answer questions only using the information below.

If the answer is not available, say you do not have that information.

Knowledge Base:

${knowledge}
`
          },
          {
            role: "user", 
            content: question
          }
        ],
        max_tokens: 1024 
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 25000
      }
    );

    return response.data.result.response; 

  } catch (error) {
    console.error("AI Error:", error);
    return "Sorry, I am unable to answer right now."; 
  }
}
