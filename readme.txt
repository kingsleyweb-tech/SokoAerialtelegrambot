========================================================================
                      SOKO AERIAL TELEGRAM BOT
========================================================================

An intelligent, AI-powered Telegram chatbot designed for Soko Aerial, 
providing automated customer support, training details, company info,
and quick links for clients.

========================================================================
TABLE OF CONTENTS
========================================================================
1.  How It Works
2.  Tech Stack & Dependencies
3.  AI Engine (Cloudflare Workers AI)
4.  Environment Variables (.env)
5.  Folder & File Structure
6.  Explaining Key Files
7.  The Knowledge Base (soko-aerial.txt)
8.  Bot Features
9.  How to Run the Application
10. How to Get Your API Keys
11. Deployment & Hosting
12. Troubleshooting Common Errors
13. Development History & Fixes
14. Future Feature Ideas

========================================================================
1. HOW IT WORKS
========================================================================
The bot monitors incoming Telegram messages using long-polling.
When a user sends a message to the bot:

  1. Telegram delivers the message to your Express server via polling.
  2. messageHandler.ts receives the message text and chat ID.
  3. The bot immediately shows a "typing..." indicator to the user.
  4. knowledgeService.ts loads the soko-aerial.txt knowledge base from
     disk (checking src/knowledge/ first, then root knowledge/).
  5. aiService.ts sends the user's question + the full knowledge base 
     to Cloudflare Workers AI (Meta LLaMA 3.1 8B Instruct model).
  6. The AI generates a contextual answer based ONLY on the knowledge 
     base content.
  7. The answer is sent back to the user on Telegram.
  8. If an error occurs at any point, the user gets a friendly fallback 
     message instead of silence.

========================================================================
2. TECH STACK & DEPENDENCIES
========================================================================

  Language:    TypeScript (compiled to JavaScript via tsc)
  Runtime:     Node.js
  Framework:   Express.js (web server + health check endpoint)
  Bot Library: node-telegram-bot-api (Telegram Bot API wrapper)
  AI Provider: Cloudflare Workers AI (Meta LLaMA 3.1 8B Instruct)
  HTTP Client: Axios (for Cloudflare API calls)
  Env Loader:  dotenv (loads .env file into process.env)
  Dev Runner:  tsx (TypeScript execution + file watching)

  Production Dependencies (package.json → dependencies):
  -------------------------------------------------------
  axios                  - Makes HTTP POST requests to Cloudflare AI
  dotenv                 - Loads environment variables from .env
  express                - Runs the web server (health checks, hosting)
  node-telegram-bot-api  - Connects to Telegram, sends/receives messages

  Dev Dependencies (package.json → devDependencies):
  --------------------------------------------------
  @types/express              - TypeScript types for Express
  @types/node                 - TypeScript types for Node.js
  @types/node-telegram-bot-api - TypeScript types for the bot library
  tsx                         - Runs .ts files directly without compiling
  typescript                  - The TypeScript compiler (tsc)

========================================================================
3. AI ENGINE (CLOUDFLARE WORKERS AI)
========================================================================

  Model Used:  @cf/meta/llama-3.1-8b-instruct
  Provider:    Cloudflare Workers AI
  API Endpoint:
    POST https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct

  How it works:
  - The bot sends a POST request with two messages:
    1. A "system" message containing the entire soko-aerial.txt 
       knowledge base, instructing the AI to answer questions ONLY 
       using that information.
    2. A "user" message containing the user's actual question.
  - The AI model processes both and generates a contextual response.
  - The response is extracted from: response.data.result.response

  Key Parameters:
  - max_tokens: 1024 — Controls the maximum length of the AI's reply.
    Default is only 256, which caused answers to get cut off mid-sentence.
    We raised it to 1024 to allow complete, detailed responses.
    You can increase this further (e.g., 2048) if answers still truncate.

  Pricing:
  - Cloudflare Workers AI has a generous FREE tier.
  - As of August 2026, you get 10,000 free neurons/day, which typically 
    covers hundreds of chatbot interactions daily at no cost.
  - See: https://developers.cloudflare.com/workers-ai/platform/pricing/

========================================================================
4. ENVIRONMENT VARIABLES (.env)
========================================================================

  Your .env file must contain these 4 variables:

  PORT=3000
    The port the Express server listens on.
    Default: 3000. Change if needed for your hosting provider.

  TELEGRAM_BOT_TOKEN=your_token_here
    The bot token from Telegram's @BotFather.
    This authenticates your bot with Telegram's servers.

  CLOUDFLARE_ACCOUNT_ID=your_account_id_here
    Your Cloudflare account identifier.
    Found at: https://dash.cloudflare.com → any domain → Overview sidebar

  CLOUDFLARE_API_TOKEN=your_api_token_here
    A Cloudflare API token with Workers AI permissions.
    Created at: https://dash.cloudflare.com/profile/api-tokens

  IMPORTANT:
  - Never commit your .env file to Git! It contains secret credentials.
  - The .gitignore file should include ".env" (verify this).
  - If any of these values are missing, the app will crash on startup 
    with a descriptive error message telling you which one is missing.

========================================================================
5. FOLDER & FILE STRUCTURE
========================================================================

sokoaerial-telegram-bot/
├── knowledge/                     # Root-level knowledge base (fallback)
│   └── soko-aerial.txt            # Copy of the Soko Aerial knowledge base
│
├── src/                           # All TypeScript source code lives here
│   ├── bot.ts                     # Initializes Telegram Bot + starts polling
│   ├── server.ts                  # Express server + health endpoint
│   │
│   ├── handlers/                  
│   │   └── messageHandler.ts      # Receives messages, shows typing, queries AI, replies
│   │
│   ├── knowledge/                 # Primary knowledge base directory
│   │   └── soko-aerial.txt        # Main source of all Soko Aerial company info
│   │
│   ├── services/                  
│   │   ├── aiService.ts           # Cloudflare Workers AI integration (LLaMA 3.1)
│   │   └── knowledgeService.ts    # Safely loads knowledge base from disk
│   │
│   ├── config/                    # Reserved for future configuration files
│   └── utils/                     # Reserved for future utility/helper functions
│
├── dist/                          # Compiled JavaScript output (created by `npm run build`)
├── node_modules/                  # Installed npm packages (auto-generated)
│
├── .env                           # Secret environment variables (DO NOT COMMIT)
├── .gitignore                     # Files/folders excluded from Git
├── package.json                   # Project metadata, scripts, and dependencies
├── package-lock.json              # Locked dependency versions
├── tsconfig.json                  # TypeScript compiler configuration
└── readme.txt                     # This documentation file

========================================================================
6. EXPLAINING KEY FILES
========================================================================

* src/server.ts
  The entry point of the entire application. It:
  - Imports bot.ts (which triggers the Telegram bot to start polling)
  - Starts an Express web server on the configured PORT
  - Exposes a GET /health endpoint that returns { status: "OK" }
  - The health endpoint is useful for hosting platforms (like Render, 
    Railway, or Fly.io) to verify the app is alive

* src/bot.ts
  - Reads TELEGRAM_BOT_TOKEN from environment variables
  - Creates a TelegramBot instance with polling: true
  - Passes the bot instance to handleMessages() so it starts 
    listening for incoming user messages
  - Logs "Telegram bot is running..." to confirm startup

* src/handlers/messageHandler.ts
  - Listens for every incoming "message" event from Telegram
  - Ignores messages without text (e.g., photos, stickers)
  - Shows "Bot is typing..." indicator while the AI processes
  - Keeps the typing indicator alive every 4 seconds (Telegram 
    auto-hides it after ~5 seconds)
  - Calls generateAIResponse() and sends the result back
  - Catches all errors and sends a user-friendly fallback message

* src/services/aiService.ts
  - Reads CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN from env
  - Throws an error at startup if either credential is missing
  - generateAIResponse(question): 
    → Loads the knowledge base via getKnowledgeBase()
    → Constructs a system prompt instructing the AI to answer ONLY 
      from the knowledge base
    → POSTs to Cloudflare's LLaMA 3.1 8B endpoint with max_tokens: 1024
    → Returns the AI's text response
    → On failure, returns "Sorry, I am unable to answer right now."

* src/services/knowledgeService.ts
  - getKnowledgeBase():
    → First checks src/knowledge/soko-aerial.txt
    → Falls back to knowledge/soko-aerial.txt (root directory)
    → If neither file exists, logs a warning and returns "" (empty)
    → This prevents the app from crashing if the file is missing

* src/knowledge/soko-aerial.txt  &  knowledge/soko-aerial.txt
  - A 300+ line structured text file containing ALL official Soko 
    Aerial information the AI uses to answer questions
  - Sections: Quick Links, Company Overview, Services (Mining, 
    Agriculture, Security, etc.), Departments, Training Programs, 
    Contact Info, FAQs, and a Site Map with URLs
  - The AI is instructed to answer ONLY from this file's content

========================================================================
7. THE KNOWLEDGE BASE (soko-aerial.txt)
========================================================================

  The knowledge base is the brain of the bot. It determines what the 
  AI knows and can answer. It contains:

  - QUICK LINKS: Official website, contact page, training registration,
    and all social media links (Facebook, LinkedIn, X, Instagram, YouTube)
  - COMPANY OVERVIEW: Name, tagline, founder/CEO (Ing. Kofi Owusu-Adusei),
    location (Burma Camp, Accra, Ghana), vision, mission, partners
  - SERVICES: Mining, Disaster Data Management, Infrastructure Inspection,
    Agriculture, Security, Survey & Mapping, AEC — each with capabilities 
    and links to downloadable PDF brochures
  - DEPARTMENTS: CADU, UASRL, ENTU, CESU — each with mission and projects
  - TRAINING: CUAVRE center, pilot training objectives, on-site vs online,
    registration link
  - CONTACT: Phone numbers, contact page URL, physical address
  - FAQs: 20+ pre-written Q&A pairs covering common customer questions
  - SITE MAP: Direct URLs to every page on sokoaerial.com

  To update what the bot knows:
  - Edit src/knowledge/soko-aerial.txt
  - The bot automatically picks up changes on restart (or live via tsx watch)
  - Keep the root knowledge/soko-aerial.txt in sync as a backup

========================================================================
8. BOT FEATURES
========================================================================

  Current Features:
  ✓ AI-Powered Q&A — Answers any question about Soko Aerial using 
    the knowledge base context
  ✓ Typing Indicator — Shows "Bot is typing..." while generating a 
    response, refreshed every 4 seconds for long responses
  ✓ Knowledge-Grounded Answers — The AI only answers from verified 
    company information, never makes things up
  ✓ Link Sharing — Provides official website links, social media, 
    training registration, and contact page URLs on request
  ✓ Error Handling — Gracefully catches all errors and sends a 
    friendly fallback message instead of crashing
  ✓ Health Check Endpoint — GET /health for uptime monitoring
  ✓ File Safety — Bot doesn't crash if knowledge base file is missing

========================================================================
9. HOW TO RUN THE APPLICATION
========================================================================

  Prerequisites:
  - Node.js v18 or higher installed
  - npm (comes with Node.js)
  - A Telegram bot token (from @BotFather)
  - A Cloudflare account with Workers AI access

  Step 1: Install dependencies
    npm install

  Step 2: Create and configure .env file
    PORT=3000
    TELEGRAM_BOT_TOKEN=your_telegram_bot_token
    CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
    CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

  Step 3: Run in development mode (auto-restarts on file changes)
    npm run dev

  Step 4: Build for production (compiles TypeScript → JavaScript in dist/)
    npm run build

  Step 5: Run in production
    npm run start

  Available npm scripts (from package.json):
    npm run dev   → tsx watch src/server.ts   (development with hot reload)
    npm run build → tsc                       (compile TypeScript)
    npm run start → node dist/server.js       (run compiled production code)

========================================================================
10. HOW TO GET YOUR API KEYS
========================================================================

  Telegram Bot Token:
  -------------------
  1. Open Telegram and search for @BotFather
  2. Send /newbot
  3. Follow the prompts to name your bot
  4. BotFather will give you a token like: 1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
  5. Copy it into your .env as TELEGRAM_BOT_TOKEN

  Cloudflare Account ID:
  ----------------------
  1. Go to https://dash.cloudflare.com
  2. Click on any domain (or Workers & Pages)
  3. Your Account ID is in the right sidebar under "API"
  4. Copy it into your .env as CLOUDFLARE_ACCOUNT_ID

  Cloudflare API Token:
  ---------------------
  1. Go to https://dash.cloudflare.com/profile/api-tokens
  2. Click "Create Token"
  3. Use the "Workers AI" template, or create a custom token with 
     "Workers AI: Read" permission
  4. Copy the generated token into your .env as CLOUDFLARE_API_TOKEN
  5. IMPORTANT: You can only see the token ONCE after creation!

========================================================================
11. DEPLOYMENT & HOSTING
========================================================================

  This bot can be deployed to any Node.js hosting platform:

  Render (https://render.com) — Recommended, free tier available
  ----------------------------------------------------------------
  1. Push your code to GitHub (make sure .env is in .gitignore!)
  2. Create a new "Web Service" on Render
  3. Connect your GitHub repo
  4. Set Build Command: npm install && npm run build
  5. Set Start Command: npm run start
  6. Add your environment variables in Render's dashboard
  7. Deploy!

  Railway (https://railway.app) — Easy setup, free trial credits
  ----------------------------------------------------------------
  1. Connect your GitHub repo to Railway
  2. Railway auto-detects Node.js projects
  3. Add environment variables in the Railway dashboard
  4. Deploy!

  Important Notes:
  - The Express server + /health endpoint keeps the service alive on 
    hosting platforms that require an HTTP listener
  - Set the PORT environment variable to match your host's requirements
  - The bot uses long-polling (not webhooks), so no public URL is 
    required for Telegram — it works behind firewalls and NATs

========================================================================
12. TROUBLESHOOTING COMMON ERRORS
========================================================================

  Error: "Cloudflare credentials are missing"
  → Your .env file is missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.
    Make sure both are set correctly.

  Error: "TELEGRAM_BOT_TOKEN is not defined"
  → Your .env file is missing the Telegram bot token.
    Get one from @BotFather on Telegram.

  Error: ENOENT 'knowledge/soko-aerial.txt'
  → The knowledge base file doesn't exist. Make sure either 
    src/knowledge/soko-aerial.txt or knowledge/soko-aerial.txt exists.
    The bot now handles this gracefully (returns empty response), 
    but the AI won't have any context to answer questions.

  Bot replies: "Sorry, I am unable to answer right now."
  → The Cloudflare AI API call failed. Check:
    - Is your CLOUDFLARE_API_TOKEN valid and not expired?
    - Is your CLOUDFLARE_ACCOUNT_ID correct?
    - Do you have Workers AI enabled on your Cloudflare account?
    - Check the terminal logs for the full "AI Error:" output.

  Bot replies: "Sorry, I encountered an error processing your request."
  → Something crashed in the message handler. Check:
    - The terminal logs for the full error stack trace.
    - Most likely the knowledge base file is missing or unreadable.

  AI answers are getting cut off mid-sentence:
  → Increase the max_tokens value in aiService.ts (currently 1024).
    Try 2048 or higher. The model's context window is the upper limit.

  Bot doesn't respond to messages at all:
  → Make sure the bot is running (check terminal for "Telegram bot is running...")
  → Make sure you're messaging the correct bot on Telegram
  → Check if another instance of the bot is already running (only one 
    polling instance can run at a time per bot token)

========================================================================
13. DEVELOPMENT HISTORY & FIXES
========================================================================

  1. Project Setup
     - Initialized with Express, TypeScript, node-telegram-bot-api
     - Set up Cloudflare Workers AI integration with LLaMA 3.1 8B

  2. Syntax Fix (aiService.ts)
     - `const knowledge = getKnowledgeBase()` was accidentally placed 
       inside the function's parameter list instead of the function body
     - This caused a TypeScript ',' expected error at line 16
     - Fixed by moving it into the function body after the signature

  3. File Safety (knowledgeService.ts)
     - The bot crashed with ENOENT when soko-aerial.txt didn't exist
     - Added fs.existsSync() checks before reading the file
     - Added fallback: checks src/knowledge/ first, then root knowledge/
     - Returns empty string if neither file exists (no crash)

  4. Knowledge Base Creation
     - Created a comprehensive 300+ line soko-aerial.txt
     - Added Quick Links section at the top for fast link retrieval
     - Added FAQ section with 20+ pre-written Q&A pairs
     - Added site map with URLs to every page on sokoaerial.com

  5. Truncated AI Responses Fix
     - AI answers were cutting off because the default max_tokens was 256
     - Added max_tokens: 1024 to the Cloudflare API request payload

  6. Typing Indicator
     - Added bot.sendChatAction(chatId, "typing") before AI processing
     - Added a setInterval every 4 seconds to keep the indicator alive
     - Cleared the interval once the AI response is ready

========================================================================
14. FUTURE FEATURE IDEAS
========================================================================

  These features can be added to make the bot more powerful:

  □ Interactive Training Registration
    - Guide users step-by-step to collect name, email, preferred course
    - Save leads to a database or Google Sheet

  □ Aerial Survey Cost Estimator
    - Ask service type, land size, location
    - Calculate and send estimated pricing

  □ PDF Document Delivery
    - When a user asks about a service, automatically send the 
      official PDF brochure directly in the Telegram chat

  □ Live Support Handoff
    - Forward unanswered questions to a team admin group on Telegram
    - Admins can reply and the bot forwards their response to the user

  □ Inline Navigation Menus (Telegram Keyboards)
    - Add persistent buttons: Register, Services, Contact, Location
    - Users can tap buttons instead of typing

  □ Multi-language Support
    - Detect user's language and respond accordingly

  □ Chat History / Database
    - Store conversation history for context-aware follow-up replies
    - Track user analytics (questions asked, popular topics)

========================================================================
