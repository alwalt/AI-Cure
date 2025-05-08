# 🛰️ NASA AI Curation Tool

This internal tool enables AI-driven document curation for NASA teams. It provides a secure web-based interface to upload scientific files, generate AI summaries and keywords, and interact with content through a Retrieval-Augmented Generation (RAG) chat interface.

> 🔒 **Note:** A version of this tool is hosted on NASA’s SMCE and integrated with the Open Science Data Repository (OSDR). That instance is accessible **only via NASA VPN** and intended for internal use by the OSDR curation team.

---

## 🚀 Features

- Upload `.pdf`, `.xlsx`, and image files
- Automatic AI-generated summaries and keyword tagging
- RAG-based chatbot to query your documents in natural language
- Public OSDR API integration for dataset discovery
- Session-based directory isolation for each user
- Works locally or in secure internal environments (e.g., SMCE)

---

## 🧭 Getting Started (End Users)

See the [Quick Start Guide](docs/QuickStart.md) for step-by-step usage instructions.

---

## 🛠️ Development Setup

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Then open http://localhost:3000 in your browser.

You can begin editing the page by modifying app/page.tsx. The app will auto-refresh with updates.

This project uses next/font with Geist for optimized font loading.

---

## 🧱 Architecture Overview

```
User (VPN) 
  ↓
Next.js Frontend (React)
  ↓
Python Backend (FastAPI or Flask)
  ├── LLM Summarization
  ├── RAG Chat via local Ollama or HF model
  ├── OSDR API Integration
  └── Session-Based File & Embedding Storage
```

---

## 🔐 Security & Access

- Hosted on NASA SMCE (internal deployment)
- Session directories isolated per user


---

## 🧪 Testing & Compliance

- Tested iteratively during development by the internal project team
- Issues tracked via GitHub Projects, categorized by priority
- 508 accessibility compliance verified through manual review and ticketing

---

## 🚀 Deployment

- Open source and adaptable for other NASA applications

---

## 🤝 Contributing

Have ideas or want to report an issue?  
- Submit tickets via GitHub Issues  
- Use the internal project board for task tracking  
- Contact the dev team directly on Slack or via email

---

## 📎 Resources

- [Quick Start Guide](docs/QuickStart.md)  
- OSDR Reference: https://visualization.osdr.nasa.gov/


