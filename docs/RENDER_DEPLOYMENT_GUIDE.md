# AEGISBAY — Vercel to Render Architecture & Deployment Guide

This document explains the architecture and step-by-step procedure for running **AegisBay** in a decoupled production topology:
- **Frontend (Next.js 15 Console)**: Hosted globally on **Vercel** Edge Network.
- **Backend (FastAPI Trusted Mediator Enclave)**: Hosted on **Render** (Free Web Service).

---

## 1. Architecture Overview

```
                      +-----------------------------------+
                      |         End User / Judge          |
                      +-----------------------------------+
                                        |
                                        v
                      +-----------------------------------+
                      |      Vercel (Frontend Console)    |
                      |   antigravity-aegis-v.vercel.app  |
                      |   or custom domain (aegisbay)     |
                      +-----------------------------------+
                                        |
                 Next.js Edge Proxy     |   /api/* (Internal Rewrite)
                 (Zero CORS overhead)   |   MEDIATOR_URL
                                        v
                      +-----------------------------------+
                      |      Render (Backend Enclave)     |
                      |   aegisbay-backend.onrender.com   |
                      |  - Ed25519 Cryptographic Ledger   |
                      |  - Merkle Tree Proof Verifier     |
                      |  - TinyFish Sentinel Monitor      |
                      +-----------------------------------+
```

---

## 2. Deploying the Backend on Render (Free)

### Method 1: Using the `render.yaml` Blueprint (1-Click)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Connect your repository: `Ayushnot41/AgeisBay`.
4. Render will automatically detect [`render.yaml`](file:///d:/AgeisBay/render.yaml) and configure:
   - **Service Name**: `aegisbay-backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m services.mediator.app`
   - **Health Check Path**: `/api/health`
5. Click **Apply**.
6. When the build finishes, Render gives you a public URL, for example:
   ```text
   https://aegisbay-backend.onrender.com
   ```

### Method 2: Manual Web Service Setup
1. Click **New +** > **Web Service**.
2. Select `Ayushnot41/AgeisBay`.
3. Set the following fields:
   - **Name**: `aegisbay-backend`
   - **Region**: Oregon (US West) or Frankfurt (EU)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (Root)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m services.mediator.app`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   - `PYTHONUNBUFFERED`: `1`
   - `CORS_ORIGINS`: `*`
5. Click **Create Web Service**.

---

## 3. Connecting Vercel to Render

Once your Render backend is live:

1. Open your project on the **[Vercel Dashboard](https://vercel.com/dashboard)** (`antigravity-aegis-v`).
2. Go to **Settings** > **Environment Variables**.
3. Add a new variable:
   - **Key**: `MEDIATOR_URL`
   - **Value**: `https://<your-service-name>.onrender.com` (e.g. `https://aegisbay-backend.onrender.com`)
   - **Target**: Production, Preview, Development
4. Click **Save**.
5. Trigger a **Redeploy** (Deployments > click `...` on latest deployment > **Redeploy**).

### How It Works Under the Hood
In [`web/next.config.ts`](file:///d:/AgeisBay/web/next.config.ts), Next.js automatically rewrites all browser API calls:
```ts
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.MEDIATOR_URL || "https://pickup-collecting-improved-florist.trycloudflare.com"}/api/:path*`,
    },
  ];
}
```
All client requests to `/api/runs`, `/api/health`, `/api/dispatch`, `/api/topology`, etc. are proxied by Vercel server-to-server directly to Render. The browser never makes cross-origin requests, guaranteeing **zero CORS errors** and **low latency**.
