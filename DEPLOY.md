# ODUS Deployment Instructions

This guide provides step-by-step instructions for deploying ODUS to production.

## Prerequisites

✅ All prerequisites are already set up:
- ✅ Node.js installed
- ✅ Dependencies installed (`npm install` completed)
- ✅ Application built successfully (`dist/` directory created)
- ✅ Google Cloud SDK (gcloud) installed
- ✅ Deployment configuration files created (`app.yaml`)

## Deployment Options

### Option 1: Google Cloud Platform (App Engine)

#### Step 1: Authenticate with Google Cloud
```bash
gcloud auth login
```

This will open a browser window for you to sign in with your Google account.

#### Step 2: Set Your Project ID
```bash
gcloud config set project YOUR-PROJECT-ID
```

Replace `YOUR-PROJECT-ID` with your actual Google Cloud project ID.

#### Step 3: Enable Required APIs (First time only)
```bash
# Enable App Engine API
gcloud services enable appengine.googleapis.com

# Enable Cloud Build API (if using Cloud Build)
gcloud services enable cloudbuild.googleapis.com
```

#### Step 4: Deploy Using the Script
```bash
./deploy-gcloud.sh
```

Or deploy manually:
```bash
# Build the application
npm run build

# Deploy to App Engine
gcloud app deploy
```

#### Step 5: View Your Deployment
```bash
# Open in browser
gcloud app browse

# View logs
gcloud app logs tail -s default
```

### Option 2: GitHub Pages (Landing Page)

#### Step 1: Run the Deployment Script
```bash
./deploy-ghpages.sh
```

Or deploy manually:
```bash
# Checkout/create gh-pages branch
git checkout -b gh-pages

# Add only the landing page
git add landing.html
git commit -m "Deploy landing page"

# Push to GitHub
git push origin gh-pages
```

#### Step 2: Configure GitHub Pages
1. Go to repository Settings → Pages
2. Set Source to `gh-pages` branch
3. Set directory to `/ (root)`
4. Save

Your landing page will be available at:
`https://amuzetnom.github.io/ODUS/landing.html`

## Current Build Status

✅ **Build Completed Successfully**
- Output directory: `/home/runner/work/ODUS/ODUS/dist`
- Bundle size: 1.20 MB (259.72 kB gzipped)
- Build artifacts:
  - `index.html` - Main application entry
  - `main-5GGIGRGD.js` - Bundled JavaScript
  - `3rdpartylicenses.txt` - Third-party licenses

## Troubleshooting

### Google Cloud Deployment Issues

**Issue: "Not authenticated with Google Cloud"**
```bash
gcloud auth login
```

**Issue: "No project is set"**
```bash
gcloud config set project YOUR-PROJECT-ID
gcloud config list  # Verify settings
```

**Issue: "App Engine API not enabled"**
```bash
gcloud services enable appengine.googleapis.com
```

**Issue: "Billing not enabled"**
Visit: https://console.cloud.google.com/billing

**Issue: "Permission denied"**
Ensure your account has the "App Engine Admin" role in your GCP project.

### GitHub Pages Issues

**Issue: "Authentication failed"**
- Ensure you have proper GitHub credentials configured
- Use HTTPS with a Personal Access Token, or
- Use SSH with SSH keys configured

**Issue: "gh-pages branch not showing up"**
- Check repository settings
- Ensure the branch has been pushed successfully
- Wait a few minutes for GitHub to process the deployment

## Deployment Scripts

### `deploy-gcloud.sh`
Automated Google Cloud deployment script that:
- Checks authentication and project configuration
- Builds the application
- Deploys to App Engine
- Provides deployment URL and logs

### `deploy-ghpages.sh`
Automated GitHub Pages deployment script that:
- Creates/updates gh-pages branch
- Deploys landing.html
- Returns to original branch
- Preserves working directory state

## Post-Deployment

### Update Links in Landing Page
After deploying the main app to Google Cloud, update the links in `landing.html`:
```html
<!-- Update this URL to point to your deployed app -->
<a href="YOUR-GCLOUD-APP-URL">Launch App</a>
```

### Custom Domain (Optional)
**Google Cloud:**
```bash
gcloud app domain-mappings create yourdomain.com
```

**GitHub Pages:**
1. Go to Settings → Pages
2. Add custom domain
3. Configure DNS records with your domain provider

## Security Notes

- All API keys are stored client-side only
- HTTPS is automatically enforced on both platforms
- No sensitive data is transmitted to servers
- Local-first architecture with IndexedDB storage

## Support

For more detailed information, see:
- [Deployment Documentation](./docs/deployment.md)
- [README](./README.md)
- [GitHub Issues](https://github.com/amuzetnoM/ODUS/issues)

---

**Ready to Deploy!** 🚀

Choose your deployment method above and follow the steps.
