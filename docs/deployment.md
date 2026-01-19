# Deployment Guide

![Deployment](https://img.shields.io/badge/Deployment-Production_Ready-success?style=flat-square)
![Platforms](https://img.shields.io/badge/Platforms-Vercel_|_GCloud-blue?style=flat-square)

Complete guide for deploying ODUS to production environments.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- (Optional) GitHub Personal Access Token for repository import feature

---

## Build for Production

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

**Build Output:**
- `dist/index.html` - Main application entry
- `dist/*.js` - Bundled JavaScript (optimized)
- Static assets

**Build Configuration:**
- TypeScript 5.9.0 (Angular 21 compatible)
- Font inlining disabled for offline reliability
- Production optimizations enabled

---

## Environment Configuration

ODUS requires API keys to be configured at runtime (no build-time environment variables needed).

### Gemini API Key
Users configure their API key in the application:
1. Launch ODUS
2. Click Settings → API Configuration
3. Enter Gemini API key
4. Key is stored in browser localStorage

### GitHub Token (Optional)
For GitHub repository import:
1. Settings → GitHub Integration
2. Enter Personal Access Token
3. Token stored locally (never sent to server)

**Security Note:** All keys are stored client-side only. ODUS is a local-first application.

---

## Deployment Options

### Option 1: Vercel (Recommended for SPA)

#### Quick Deploy
```bash
npm install -g vercel
vercel
```

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
vercel --prod
```

**Vercel Configuration:**
- Auto-detects Angular
- Handles SPA routing
- Global CDN
- Free SSL/TLS
- Zero-config deployment

---

### Option 2: Google Cloud Platform

#### App Engine Deployment

**1. Create `app.yaml`:**
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
    
env_variables:
  NODE_ENV: 'production'
```

**2. Deploy:**
```bash
gcloud app deploy
```

#### Cloud Run Deployment

**1. Create `Dockerfile`:**
```dockerfile
FROM nginx:alpine

# Copy built app
COPY dist /usr/share/nginx/html

# Nginx config for SPA
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

**2. Build and Deploy:**
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

---

### Option 3: GitHub Pages (Landing Page Only)

**Perfect for `landing.html` deployment:**

**1. Create GitHub Pages Branch:**
```bash
git checkout -b gh-pages
```

**2. Add Only Landing Page:**
```bash
git add landing.html
git commit -m "Deploy landing page"
git push origin gh-pages
```

**3. Configure Repository Settings:**
- Go to repository Settings → Pages
- Source: gh-pages branch
- Root directory
- Save

**Landing page will be available at:**
`https://[username].github.io/ODUS/landing.html`

**Update Links:**
Edit `landing.html` and update the "Launch App" buttons to point to your production deployment URL (Vercel/GCloud).

---

### Option 4: Netlify

**1. Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

**2. Create `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**3. Deploy:**
```bash
netlify deploy --prod
```

---

## Post-Deployment Configuration

### 1. Update API Endpoints
ODUS is entirely client-side, no server configuration needed.

### 2. Configure CORS (if using external APIs)
For GitHub API access, no CORS config needed (public API).

### 3. Set Up Custom Domain (Optional)

**Vercel:**
```bash
vercel domains add yourdomain.com
```

**GCloud:**
```bash
gcloud app domain-mappings create yourdomain.com
```

### 4. Enable Analytics (Optional)

Add Google Analytics to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

---

## Performance Optimization

### Build Optimizations (Already Configured)
- ✅ Tree-shaking enabled
- ✅ Minification enabled
- ✅ Code splitting
- ✅ Font loading optimization

### Runtime Optimizations
- ✅ Zoneless change detection (no Zone.js overhead)
- ✅ Angular Signals for reactive state
- ✅ IndexedDB for local persistence
- ✅ Lazy-loaded D3.js visualizations

### Recommended CDN Settings
- Cache-Control: `public, max-age=31536000, immutable` for JS/CSS
- Cache-Control: `no-cache` for index.html

---

## Monitoring & Maintenance

### Application Monitoring

**Browser Console Errors:**
ODUS logs errors to console. Monitor via:
- Browser DevTools
- Sentry (optional integration)
- LogRocket (optional)

**Performance Metrics:**
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3s
- Total Bundle Size: ~1.2 MB (gzipped: ~260 KB)

### Database Maintenance

**IndexedDB Storage:**
- Automatically managed by browser
- Users can clear via Settings → Hard Reset
- No server-side database to maintain

### Updates and Versioning

**Deploy New Version:**
```bash
# 1. Build
npm run build

# 2. Deploy (example: Vercel)
vercel --prod

# 3. Users auto-update on next page load
```

**Version Management:**
Update version in `package.json` and UI footer.

---

## Security Considerations

### Data Privacy
- ✅ All data stored client-side (IndexedDB)
- ✅ API keys never transmitted to server
- ✅ No user tracking without explicit analytics

### Content Security Policy (Recommended)

Add to `index.html` `<head>`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://esm.sh; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com; 
               connect-src 'self' https://api.github.com https://generativelanguage.googleapis.com;">
```

### HTTPS Enforcement
All deployment platforms (Vercel, GCloud, Netlify) provide automatic HTTPS.

---

## Troubleshooting

### Build Fails

**Issue:** TypeScript version mismatch
**Solution:** Ensure TypeScript 5.9.0+
```bash
npm install typescript@~5.9.0 --save-dev
```

**Issue:** Font inlining errors
**Solution:** Already configured in `angular.json`:
```json
"optimization": {
  "fonts": false
}
```

### Deployment Fails

**Issue:** 404 on routes
**Solution:** Configure SPA fallback (see platform configs above)

**Issue:** Assets not loading
**Solution:** Check output directory in build config matches deployment config

### Runtime Issues

**Issue:** AI not responding
**Solution:** Verify Gemini API key is configured in app

**Issue:** IndexedDB errors
**Solution:** Check browser compatibility (all modern browsers supported)

---

## Rollback Procedure

### Vercel
```bash
vercel rollback [deployment-url]
```

### GCloud
```bash
gcloud app versions list
gcloud app services set-traffic default --splits [VERSION]=1
```

### GitHub Pages
```bash
git revert [commit-hash]
git push origin gh-pages
```

---

## Support & Resources

- **Documentation:** `/docs` directory
- **Issues:** [GitHub Issues](https://github.com/amuzetnoM/ODUS/issues)
- **Community:** GitHub Discussions

---

## Checklist for Production Deployment

- [ ] Build completed successfully (`npm run build`)
- [ ] Landing page (`landing.html`) deployed to GitHub Pages
- [ ] Main app deployed to Vercel/GCloud
- [ ] Landing page "Launch App" links updated with production URL
- [ ] Custom domain configured (if applicable)
- [ ] SSL/TLS certificate active
- [ ] Gemini API key configuration tested
- [ ] GitHub token integration tested (optional)
- [ ] Performance metrics verified (Lighthouse score > 90)
- [ ] Error monitoring configured (optional)
- [ ] Analytics configured (optional)
- [ ] Documentation updated with deployment URLs

---

**Deployment Complete!** 🚀

Your ODUS instance is now live and ready for users.
