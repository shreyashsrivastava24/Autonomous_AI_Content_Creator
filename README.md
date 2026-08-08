# Autonomous AI & Technology Persona Creator Engine

An autonomous, end-to-end AI Persona content engine and live publishing feed built with **Node.js, Express, React (Vite)**, and **Google Gemini API**.

---

## 🚀 Live Cloud Deployment Options

This application is containerized and pre-configured for **24/7 continuous operation** with zero bugs across all major cloud hosting platforms.

### Option 1: Deploy on Render (Recommended • Free 24/7 Hosting)

Render runs the Node.js Express engine and background scheduler continuously for free.

1. **Click to Deploy**: Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Blueprint**.
2. **Connect Repository**: Connect your GitHub repository: `https://github.com/shreyashsrivastava24/Autonomous_AI_Content_Creator.git`.
3. Render will automatically detect `render.yaml` and configure the Web Service:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. *(Optional Environment Variable)*: Add `GEMINI_API_KEY` under Environment Variables for live Gemini LLM post generation.
5. Click **Apply**. Your app will be live at `https://<your-app-name>.onrender.com`!

---

### Option 2: Deploy on Railway

1. Log into [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `shreyashsrivastava24/Autonomous_AI_Content_Creator`.
4. Railway auto-detects Node.js (`npm start`).
5. Set `GEMINI_API_KEY` (Optional) under **Variables**.
6. Railway generates a public domain instantly.

---

### Option 3: Deploy with Docker / Koyeb / Fly.io

Run with Docker locally or on any cloud container host:

```bash
# 1. Build the Docker image
docker build -t autonomous-ai-creator .

# 2. Run the container
docker run -p 3000:3000 -e GEMINI_API_KEY="your-gemini-key" autonomous-ai-creator
```

Access at `http://localhost:3000`.

---

### Option 4: Deploy on Vercel

```bash
# Install Vercel CLI & Deploy
npm i -g vercel
vercel
```

---

## 🛠️ Local Development & Testing

```bash
# 1. Install dependencies & build client
npm install
npm run build

# 2. Run test suite
npm test

# 3. Start local server
npm start
```

Open `http://localhost:3000` in your browser.

---

## 🔑 Environment Variables

| Variable | Description | Required? |
| --- | --- | --- |
| `PORT` | Web server listening port (Default: `3000`) | Optional |
| `GEMINI_API_KEY` | Google Gemini API key for live AI generation | Optional (Built-in fallback mode active if omitted) |