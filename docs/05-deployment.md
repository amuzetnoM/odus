---
title: Deployment Guide
description: Production deployment instructions for multiple platforms
version: 1.0.0-beta
last_updated: 2026-01-19
---

![Deployment](https://img.shields.io/badge/Deployment-Production_Ready-success?style=flat-square)
![Platforms](https://img.shields.io/badge/Platforms-Vercel_|_GCloud_|_Netlify-blue?style=flat-square)

## Build Configuration

### Development Build

```bash
npm run dev
```

Starts local server at `http://localhost:4200` with hot module replacement.

### Production Build

```bash
npm run build
```

**Output**: `dist/` directory with optimized assets

**Bundle Analysis**:
- **Total Size**: ~1.22 MB
- **Gzipped**: ~263 KB
- **Main Bundle**: `main-[HASH].js`
- **Polyfills**: `polyfills-[HASH].js`
- **Styles**: `styles-[HASH].css`

**Applied Optimizations**:
- Tree-shaking (removes unused code)
- Minification (Terser)
- Code splitting (lazy routes)
- Font optimization (inline: false)
- CSS purging (Tailwind)

---

## Platform Deployment

### Option 1: Vercel (Recommended)

**Best For**: SPAs, fastest deployment, global CDN

#### Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "angular",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Features**:
- Auto HTTPS
- Global CDN
- Instant rollbacks
- Preview deployments
- Zero config

**Cost**: Free (Hobby plan)

---

### Option 2: Google Cloud Platform

#### App Engine

**1. Create `app.yaml`**:
```yaml
runtime: nodejs18

handlers:
  - url: /(.*\.(js|css|png|jpg|svg|ico|json))$
    static_files: dist/\1
    upload: dist/.*\.(js|css|png|jpg|svg|ico|json)$
    secure: always
    
  - url: /.*
    static_files: dist/index.html
    upload: dist/index.html
    secure: always
```

**2. Deploy**:
```bash
gcloud app deploy
```

**Cost**: ~$5/month (F1 instance)

#### Cloud Run

**1. Create `Dockerfile`**:
```dockerfile
FROM nginx:alpine

# Copy built app
COPY dist /usr/share/nginx/html

# SPA routing config
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**2. Build & Deploy**:
```bash
# Build image
gcloud builds submit --tag gcr.io/[PROJECT-ID]/odus

# Deploy to Cloud Run
gcloud run deploy odus \
  --image gcr.io/[PROJECT-ID]/odus \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Cost**: Pay-per-use (~$0-2/month for light traffic)

---

### Option 3: Netlify

**Configuration**: Create `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deploy**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Features**: Same as Vercel (free tier)

---

### Option 4: GitHub Pages

**Best For**: Static hosting, documentation sites

**Steps**:
1. Create `gh-pages` branch
2. Copy `dist/` contents to branch
3. Enable GitHub Pages in repo settings
4. Point to `gh-pages` branch

**Limitations**: No custom server-side routing (use hash routing)

---

## Environment Configuration

### Runtime Configuration

ODUS uses **client-side configuration** (no build-time env vars needed).

**API Keys**:
- Configured in-app (Settings → API Configuration)
- Stored in browser `localStorage`
- Never transmitted to server

**GitHub Token**:
- Optional (for repository import)
- Configured in Settings → GitHub Integration
- Stored locally only

---

## Custom Domain Setup

### Vercel

```bash
vercel domains add yourdomain.com
```

Follow prompts to configure DNS (A/CNAME records).

### GCloud

```bash
gcloud app domain-mappings create yourdomain.com
```

Add verification TXT record to DNS.

### Netlify

Dashboard → Domain Settings → Add custom domain

---

## Performance Optimization

### CDN Configuration

**Cache Headers** (recommended):

```
# Static assets (JS, CSS, images)
Cache-Control: public, max-age=31536000, immutable

# index.html
Cache-Control: no-cache
```

**Vercel** (automatic):
- Static files cached for 1 year
- HTML not cached

**GCloud** (manual):
Add to `app.yaml`:
```yaml
handlers:
  - url: /(.*\.(js|css|png))$
    static_files: dist/\1
    upload: dist/.*\.(js|css|png)$
    secure: always
    expiration: "365d"
```

---

## Monitoring & Analytics

### Lighthouse CI

Add to GitHub Actions:

```yaml
name: Lighthouse CI
on: push

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:4200
          uploadArtifacts: true
```

**Target Scores**:
- Performance: >90
- Accessibility: >90
- Best Practices: 100
- SEO: >90

### Error Tracking (Optional)

**Sentry Integration**:
```typescript
// app.config.ts
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "YOUR_DSN",
  environment: "production"
});
```

---

## Security

### Content Security Policy

Add to `index.html` `<head>`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://esm.sh; 
               connect-src 'self' https://api.github.com https://generativelanguage.googleapis.com;">
```

### HTTPS Enforcement

All platforms provide automatic HTTPS. No configuration needed.

---

## Rollback Procedure

### Vercel

```bash
# List deployments
vercel list

# Promote previous deployment
vercel promote [deployment-url]
```

### GCloud

```bash
# List versions
gcloud app versions list

# Route traffic to previous version
gcloud app services set-traffic default --splits [VERSION]=1
```

---

## Troubleshooting

### Build Fails

**Issue**: TypeScript errors

**Solution**:
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### 404 on Routes

**Issue**: Direct navigation to routes fails

**Solution**: Configure SPA fallback (see platform configs above)

### Large Bundle Size

**Issue**: Bundle >2 MB

**Solution**:
- Check for duplicate dependencies: `npm dedupe`
- Analyze bundle: `npm run build -- --stats-json`
- Use `webpack-bundle-analyzer`

---

## Deployment Checklist

- [ ] Build passes locally (`npm run build`)
- [ ] API keys configured in app (post-deployment)
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS certificate active (automatic on platforms)
- [ ] SPA routing configured (redirects)
- [ ] Performance tested (Lighthouse >90)
- [ ] Error monitoring configured (optional)
- [ ] Analytics configured (optional)

---

## Support

- **Documentation**: Complete docs in `/docs`
- **Issues**: [GitHub Issues](https://github.com/amuzetnoM/ODUS/issues)
- **Discussions**: [GitHub Discussions](https://github.com/amuzetnoM/ODUS/discussions)

---

**Deployment Complete!** Your ODUS instance is live.
