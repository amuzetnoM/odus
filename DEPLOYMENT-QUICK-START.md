# ODUS Deployment Quick Reference

## 🚀 Quick Start

### Check Deployment Status
```bash
./check-deployment.sh
```

### Deploy to Google Cloud
```bash
# 1. Authenticate (first time only)
gcloud auth login

# 2. Set your project (first time only)
gcloud config set project YOUR-PROJECT-ID

# 3. Enable APIs (first time only)
gcloud services enable appengine.googleapis.com

# 4. Deploy
./deploy-gcloud.sh
```

### Deploy to GitHub Pages
```bash
# Deploy landing page
./deploy-ghpages.sh

# Then configure in GitHub:
# Settings → Pages → Source: gh-pages branch
```

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `app.yaml` | Google Cloud App Engine configuration |
| `deploy-gcloud.sh` | Automated Google Cloud deployment |
| `deploy-ghpages.sh` | Automated GitHub Pages deployment |
| `check-deployment.sh` | Check deployment status and readiness |
| `DEPLOY.md` | Comprehensive deployment guide |
| `dist/` | Built application (created by `npm run build`) |
| `landing.html` | Landing page for GitHub Pages |

## 🔧 Common Commands

### Build
```bash
npm install          # Install dependencies
npm run build        # Build for production
```

### Google Cloud
```bash
gcloud auth login                           # Authenticate
gcloud config set project PROJECT-ID        # Set project
gcloud config list                          # View configuration
gcloud app deploy                           # Deploy application
gcloud app browse                           # Open deployed app
gcloud app logs tail -s default             # View logs
```

### GitHub
```bash
git checkout gh-pages                       # Switch to gh-pages
git push origin gh-pages                    # Push to GitHub
git checkout main                           # Return to main branch
```

## ⚡ Current Status

✅ **Ready:**
- Application built successfully (dist/ directory)
- Google Cloud configuration created (app.yaml)
- Deployment scripts created and tested
- Documentation complete

⚠️ **Requires Authentication:**
- Google Cloud: Run `gcloud auth login`
- GitHub Pages: Ensure git credentials are configured

## 🆘 Troubleshooting

### Google Cloud Issues
```bash
# Not authenticated
gcloud auth login

# No project set
gcloud config set project YOUR-PROJECT-ID

# API not enabled
gcloud services enable appengine.googleapis.com

# Check current settings
gcloud config list
gcloud auth list
```

### GitHub Pages Issues
```bash
# Check current branch
git branch

# View remote branches
git branch -r

# Force push if needed (careful!)
git push -f origin gh-pages
```

## 📖 Full Documentation

- **Complete Guide:** [DEPLOY.md](./DEPLOY.md)
- **Deployment Docs:** [docs/deployment.md](./docs/deployment.md)
- **README:** [README.md](./README.md)

## 🎯 Deployment URLs

After deployment, your app will be available at:

- **Google Cloud:** `https://YOUR-PROJECT-ID.appspot.com`
- **GitHub Pages:** `https://amuzetnom.github.io/ODUS/landing.html`

---

**Need Help?** See [DEPLOY.md](./DEPLOY.md) for detailed instructions and troubleshooting.
