# ▦ Movio Smart Content Builder

> **AI-Powered Campaign Content Generation Platform**  
> Built with Next.js 16.2 · Tailwind CSS v4 · Gemini AI API  
> Internship Project — PT Movio Kreasi Indonesia · Task 2: MVP Development

---

## 📌 Overview

**Movio Smart Content Builder** is a single-page web application that helps creative teams and clients generate campaign content faster and more structured using AI.

Users fill out a creative brief form (brand name, industry, target audience, tone, goal, and platform), and the platform generates a complete content package powered by **Google Gemini AI**, including:

- ✦ Social Media Caption
- ▶ Video Script (platform-aware duration)
- ◈ Storyboard Frames
- ◉ Poster Concept
- \# Hashtag Set (10 targeted tags)

Results can be exported as a structured **PDF** or copied to clipboard with one click.

---

## 🎯 Project Background

This project was built as part of the **Creative Technology Generalist Internship** application at PT Movio Kreasi Indonesia.

| Item | Detail |
|---|---|
| **Task** | Task 1: Ideation & AI Architecture + Task 2: Vibe Coding MVP |
| **Position** | Creative Technology Generalist Intern |
| **Company** | PT Movio Kreasi Indonesia |
| **Deadline** | Sunday, 27 April 2026 · 01:00 PM |
| **Method** | Agentic / Vibe Coding with AI assistance |

---

## 🚀 Live Demo

🔗 **[pt-movio-advanced-test.vercel.app](https://pt-movio-advanced-test.vercel.app/)**

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16.2.4](https://nextjs.org) (App Router + Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 (CSS-first, no config file) |
| **AI Model** | Google Gemini 2.5 Flash Lite (via REST API) |
| **Fallback Models** | Gemini 2.0 Flash → Gemini 1.5 Flash |
| **PDF Export** | jsPDF (pure programmatic, no DOM screenshot) |
| **Fonts** | Syne (display) + DM Sans (body) via `next/font/google` |
| **State Management** | React `useState` (no external library needed) |
| **Persistence** | `localStorage` (session history, no database) |
| **Deployment** | Vercel (free tier, auto CI/CD from GitHub) |

---

## 📁 Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts        # Gemini API server-side route
│   │   ├── favicon.ico
│   │   ├── globals.css             # Tailwind v4 + custom design system
│   │   ├── layout.tsx              # Root layout + font loading
│   │   └── page.tsx                # Main SPA page
│   ├── components/
│   │   ├── BriefForm.tsx           # Client brief input form
│   │   └── OutputPanel.tsx         # AI result display + PDF export
│   └── lib/
│       └── gemini.ts               # Gemini API wrapper + prompt builder
├── public/
├── .env.local                      # API key (not committed)
├── AGENTS.md                       # Next.js 16 agent coding guide
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 20.9 or later
- npm 11+
- A Google AI Studio account → [Get your free API key](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/DonAdhyatma/pt-movio-advanced-test.git

# 2. Enter the project directory
cd movio-smart-content-builder

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

> ⚠️ Never commit your `.env.local` file. It is already included in `.gitignore`.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🧪 How to Use

1. **Fill the Creative Brief Form** (left panel)
   - Enter your brand name
   - Select industry, brand tone, and campaign goal
   - Choose target platform (Instagram, TikTok, YouTube, etc.)
   - Optionally add additional context

2. **Click "✦ Generate Content Package"**
   - The AI processes your brief (3–8 seconds)
   - 5 content cards appear in the right panel

3. **Use Your Content**
   - Click **⎘** on any card to copy to clipboard
   - Click **↓ Export PDF** for a structured client-ready PDF

---

## 🤖 AI Features

### Platform-Aware Video Scripts

The prompt engine automatically adjusts video script duration based on platform:

| Platform | Duration |
|---|---|
| TikTok | 15–60 seconds |
| Instagram Reels | 30–90 seconds |
| YouTube | 3–10 minutes |
| LinkedIn | 1–3 minutes |
| Twitter / X | 30–60 seconds |
| Facebook | 1–3 minutes |

### Model Fallback Chain

If the primary model is busy or rate-limited, the app automatically retries with fallback models:

```
gemini-2.5-flash-lite  →  gemini-2.0-flash  →  gemini-1.5-flash
```

### Session History

Every successful generation is saved to `localStorage` (up to 10 entries). No database required.

---

## 📄 PDF Export

The PDF export uses **jsPDF** (pure programmatic generation — no DOM screenshot):

- ✅ Gradient header with brand name and generation date
- ✅ Colour-coded section headers for each content type
- ✅ Automatic page breaks for long content
- ✅ Emoji-safe rendering (jsPDF font compatible)
- ✅ Multi-page support

---

## 🔌 API Reference

### `POST /api/generate`

Generates a complete content package based on the provided brief.

**Request Body:**
```json
{
  "brandName": "Movio Kreasi Indonesia",
  "industry": "Entertainment & Media",
  "audience": "Creative professionals aged 20-35",
  "tone": "Bold & Energetic",
  "goal": "Brand Awareness",
  "platform": "Instagram",
  "additionalContext": "Optional extra context"
}
```

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "caption": "...",
    "videoScript": "...",
    "storyboard": "...",
    "posterConcept": "...",
    "hashtags": "..."
  }
}
```

**Error Response `500 / 503`:**
```json
{
  "error": "Gemini API is temporarily busy. Please wait a moment and try again."
}
```

---

## 🛠️ Development Notes

### Why No Database?

This MVP follows the recruiter's specified Data Flow Diagram:
```
User Input → Prompting → AI API → UI Output
```
No database node exists in the spec. Results are persisted via `localStorage` for session history — lean, fast, and zero-config.

### Why jsPDF Instead of html2pdf.js?

`html2pdf.js` relies on `html2canvas` to screenshot DOM elements, which fails with `opacity: 0` or off-screen elements in Next.js SSR environments. `jsPDF` draws directly to PDF coordinates — no rendering dependency, guaranteed output.

### Tailwind v4 Notes

Tailwind v4 is CSS-first — no `tailwind.config.js` needed:
```css
/* globals.css */
@import "tailwindcss";
/* All custom styles use CSS variables, not Tailwind config */
```

---

## 📦 Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🚀 Deployment

This project is configured for **zero-config Vercel deployment**:

1. Push to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add `GEMINI_API_KEY` in Vercel Environment Variables
4. Deploy ✅

---

## 👤 Test Participant

**Danni Adhyatma Rachman**  
Creative Technology Generalist Intern Applicant  
PT Movio Kreasi Indonesia · April 2026

---