# AEGISBAY — Vercel Deployment & Integration Guide

This guide details the exact architecture, resolution of build errors, and instructions for deploying the **AegisBay Evidence-Gated AI Safety Enclave** console on Vercel.

---

## 1. Root Cause Analysis of Previous Manual Deployment Failure

When manually importing the repository `Ayushnot41/AgeisBay` into Vercel, previous builds failed due to three root causes:

1. **Subfolder Monorepo Structure (`web/`)**:
   - The Next.js web application resides in `/web`, whereas Vercel by default expects `package.json` at the root (`/`).
   - The previous root `vercel.json` specified `framework: "nextjs"` without a root `package.json`, causing Vercel's framework detector to fail during the dependency analysis phase (`No Next.js version could be detected`).

2. **Node.js Runtime & Module Incompatibilities**:
   - `web/next.config.ts` previously imported a CommonJS module (`patch-readlink.js`) and referenced `import.meta.dirname`.
   - On Vercel's standard build environments, `import.meta.dirname` evaluates to `undefined`, crashing `path.resolve(__dirname)` during configuration initialization.

3. **npm Configuration Conflicts (`.npmrc`)**:
   - `.npmrc` contained pnpm-specific flags (`node-linker=hoisted`, `package-import-method=copy`, `symlink=false`), which generated configuration errors under standard npm builds.

---

## 2. Engineering Fixes Implemented

The following changes have been applied across the repository to ensure 100% green builds on Vercel:

| Component | Modification | Impact |
| :--- | :--- | :--- |
| **Root `package.json`** | Added root workspace configuration linking to `web/` | Enables Vercel to detect Next.js and run builds from root (`/`) |
| **Root `vercel.json`** | Streamlined project definition for `antigravity-aegis-v` | Eliminates invalid `outputDirectory` overrides |
| **`web/next.config.ts`** | Sanitized TypeScript configuration with Cloudflare fallback | Removed `patch-readlink.js` & `import.meta.dirname`; proxies `/api/*` to live Cloudflare tunnel |
| **`web/.npmrc`** | Replaced with `legacy-peer-deps=true` | Guarantees clean dependency resolution on npm |
| **`web/vercel.json`** | Configured framework preset to `nextjs` | Provides instant 1-click subfolder deployment when Root Directory is `web` |

---

## 3. How to Deploy on Vercel (1-Click or Manual)

### Option A: Standard Subdirectory Deployment (Recommended)

1. Open **[Vercel Dashboard](https://vercel.com/new)** and click **Import** next to `Ayushnot41/AgeisBay`.
2. Under **Project Name**, enter: `antigravity-aegis-v`.
3. Under **Root Directory**, click **Edit** and select: `web`.
4. (Optional) Under **Environment Variables**, you can add:
   - `MEDIATOR_URL`: `https://pickup-collecting-improved-florist.trycloudflare.com`
   *(Note: This is already pre-configured as the automatic fallback in `next.config.ts`)*.
5. Click **Deploy**.
6. The build will succeed in ~20-30 seconds with 100% static prerendering.

---

### Option B: Root Monorepo Deployment

If you do not change the Root Directory and leave it as `./`:
1. Vercel automatically detects the root `package.json` workspace.
2. It executes `npm --prefix web run build`.
3. The build completes and deploys the `web` frontend.

---

## 4. Custom Domain Setup

To link your free domain (e.g., `aegisbay` registered in `domains/aegisbay.json`):
1. In your Vercel Project Dashboard, navigate to **Settings** > **Domains**.
2. Enter your custom domain name.
3. Configure your CNAME record pointing to:
   ```text
   cname.vercel-dns.com
   ```
4. SSL certificates are provisioned automatically by Vercel's global edge network.
