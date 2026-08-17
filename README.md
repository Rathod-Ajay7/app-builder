# AI App Builder

Describe your app idea in plain English and watch it get built in real-time. This tool uses AI to generate full React apps — complete with working code, live preview, and one-click export.

## What It Does

- **Chat to build** — Tell the AI what you want and it writes all the code for you.
- **Live preview** — See your app running instantly in the browser as files are generated.
- **Edit code** — Switch to code view to tweak anything the AI wrote.
- **Revise with AI** — Don't like something? Tell the AI to change it through chat.
- **Export** — Download your project as a ZIP or publish it with a shareable link.
- **Auth** — Sign up / log in to save your projects

## Tech Stack

| Part | Tech |
|------|------|
| Frontend | React 19, Vite, TailwindCSS, Sandpack (live preview) |
| Backend | Node.js, Express 5, MongoDB, JWT auth |
| AI | OpenRouter API (any model — GPT, Claude, etc.) |

## Quick Start

### 1. Clone

```bash
git clone https://github.com/Rathod-Ajay7/app-builder.git
cd app-builder
```

### 2. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 3. Set up environment

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret_string
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/auto
ORIGINS=http://localhost:5173
```

Get your OpenRouter API key from [openrouter.ai](https://openrouter.ai).

### 4. Run

Open two terminals:

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Open `http://localhost:5173` in your browser. That's it!

## Project Structure

```
app-builder/
├── client/          # React frontend
│   └── src/
│       ├── pages/        # Home, Builder, Auth, Preview, Publish
│       ├── components/   # Editor, Preview panel, File explorer, etc.
│       ├── context/      # App-wide state (auth, projects)
│       └── utils/        # Sandpack helpers, code sanitizer
│
└── server/          # Express backend
    ├── controllers/      # Auth, Chat (AI), Projects
    ├── models/           # User, Project (MongoDB)
    ├── services/         # AI prompts, code validator
    ├── middleware/       # JWT auth check
    └── Routes/          # API routes
```

## How It Works

1. You type a prompt like *"Build me a todo app with dark mode"*
2. The AI plans which files to create (App.js, styles.css, etc.)
3. It generates each file one by one using streaming
4. Sandpack compiles and renders your app live in the browser
5. You can chat more to revise, then export or publish

## License

MIT
