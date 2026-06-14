# ReachAI — Frontend

> AI-native CRM frontend for D2C brands — built with React, Vite, and Tailwind CSS.

**Live URL:** https://reachai-frontend.vercel.app

**Backend Repo:** [reachai-backend](https://github.com/NIKHIL-14238/reachai-backend) · **Channel Service Repo:** [reachai-channel-service](https://github.com/NIKHIL-14238/reachai-channel-service)

---

## What This Is

ReachAI is a Mini CRM that helps consumer brands intelligently reach their shoppers. This repo contains the frontend — a React single-page application that connects to the ReachAI Backend.

Built as part of the **Xeno Engineering Internship Assignment 2026**.

---

## System Architecture

![ReachAI Architecture](./architecture.png)

### How the Campaign Delivery Loop Works

```
Marketer clicks "Send Campaign"
        │
        ▼
CRM Backend loops through segment members
        │
        ▼
Creates communication_log entry per customer (status: queued)
        │
        ▼
Fires POST /api/send to Channel Service (async)
        │
        ▼
Channel Service simulates delivery with realistic delays
        │
        ├── delivered → POST /api/callbacks/status {status: "delivered"}
        ├── opened   → POST /api/callbacks/status {status: "opened"}
        ├── clicked  → POST /api/callbacks/status {status: "clicked"}
        └── failed   → POST /api/callbacks/status {status: "failed"}
                │
                ▼
        CRM updates log + campaign counters
                │
                ▼
Frontend polls every 3s → shows live stats
```

### AI Segmentation Flow

```
Marketer types: "Women from Mumbai who spent more than 5000"
        │
        ▼
POST /api/ai/segment
        │
        ▼
Backend builds prompt with real DB schema + data ranges
        │
        ▼
AI returns: gender = 'Female' AND city ILIKE 'Mumbai' AND total_spent > 5000
        │
        ▼
Backend validates with COUNT(*) query
        │
        ▼
Returns: { filter_query, customer_count, suggested_name, preview }
        │
        ▼
Marketer saves segment → creates campaign
```

---

## Pages & Features

| Page | What it does |
|------|-------------|
| **Dashboard** | Key metrics, revenue timeline, top cities, AI campaign suggestions |
| **Customers** | Searchable list with order history and message history side panel |
| **Segments** | AI-powered natural language audience builder |
| **Campaigns** | Create campaigns, pick channel, AI-draft messages, send |
| **Campaign Detail** | Real-time delivery tracking — sent, delivered, opened, clicked, failed |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Styling — dark theme with orange accents |
| React Router v6 | Client-side routing |
| Recharts | Revenue and delivery charts |
| Lucide React | Icons |

---

## Project Structure

```
src/
├── App.jsx                  # Layout, sidebar, routing
├── main.jsx                 # React entry point
├── index.css                # Tailwind + global styles
├── lib/
│   └── api.js               # All API calls (centralized)
└── pages/
    ├── Dashboard.jsx        # Metrics + AI suggestions
    ├── Customers.jsx        # Customer list + detail panel
    ├── Segments.jsx         # AI segment builder
    ├── Campaigns.jsx        # Campaign listing
    ├── NewCampaign.jsx      # Create campaign + AI composer
    └── CampaignDetail.jsx   # Real-time delivery tracking
```

---

## Local Development

```bash
git clone https://github.com/NIKHIL-14238/reachai-frontend.git
cd reachai-frontend
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:5173`

### Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Backend URL e.g. `https://reachai-backend.onrender.com` |

For local dev, leave `VITE_API_URL` empty — Vite proxy forwards `/api` to `localhost:3000`.

---

## Deployment

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Vite**
4. Add env var: `VITE_API_URL` = backend URL
5. Deploy — auto-deploys on every push to `main`

---

## Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| AI Segmentation | Natural language → SQL | No complex filter UI — marketers just describe their audience |
| Centralized API | `src/lib/api.js` | Single place to swap backend URL or add auth headers |
| Real-time tracking | 3-second polling | Simple and reliable — no WebSocket complexity at this scale |
| No auth | Intentional | Not core to the brief — would add JWT auth at production scale |
| Dark orange theme | Custom Tailwind | Distinct, professional — not default AI-generated appearance |

---

## Scale Tradeoffs

- **Current scope:** handles ~1000 customers and campaigns of ~500 messages
- **At scale I'd add:** WebSockets instead of polling, Redis caching for dashboard analytics, virtual scrolling for large customer lists
- **Deliberately excluded:** Authentication, email template editor, real-time WebSockets — not core to the brief

---

## Author

**Nikhil** — Xeno SDE Internship Assignment 2026
