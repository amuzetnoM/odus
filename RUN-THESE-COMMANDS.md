# ⚡ Run These Commands to Deploy

## For Google Cloud Deployment

Copy and paste these commands one at a time:

```bash
# Step 1: Authenticate with Google Cloud
gcloud auth login

# Step 2: Set your Google Cloud project ID
# Replace YOUR-PROJECT-ID with your actual project ID
gcloud config set project YOUR-PROJECT-ID

# Step 3: Enable App Engine API (first time only)
gcloud services enable appengine.googleapis.com

# Step 4: Run the automated deployment script
./deploy-gcloud.sh
```

### If you don't know your Project ID:
```bash
# List all your projects
gcloud projects list

# Then set the project
gcloud config set project YOUR-PROJECT-ID
```

## For GitHub Pages Deployment

Copy and paste this command:

```bash
# Deploy landing page to GitHub Pages
./deploy-ghpages.sh
```

After running the script:
1. Go to: https://github.com/amuzetnoM/ODUS/settings/pages
2. Set **Source** to: `gh-pages` branch
3. Set **Directory** to: `/ (root)`
4. Click **Save**

Your landing page will be available at:
`https://amuzetnom.github.io/ODUS/landing.html`

## Check Deployment Status

Anytime you want to check what's ready to deploy:

```bash
./check-deployment.sh
```

## Troubleshooting

### Google Cloud: "Project not found"
```bash
# Create a new project
gcloud projects create YOUR-PROJECT-ID

# Or list existing projects
gcloud projects list
```

### Google Cloud: "App Engine API not enabled"
```bash
gcloud services enable appengine.googleapis.com
```

### GitHub Pages: "Authentication failed"
Make sure you have:
- GitHub credentials configured (username/password or token)
- Or SSH keys set up
- Push access to the repository

## What Happens When You Deploy

### Google Cloud (via `./deploy-gcloud.sh`):
1. ✅ Checks authentication
2. ✅ Verifies project is set
3. ✅ Builds the application (npm run build)
4. ✅ Deploys to App Engine
5. ✅ Shows you the deployment URL

### GitHub Pages (via `./deploy-ghpages.sh`):
1. ✅ Creates/updates gh-pages branch
2. ✅ Copies landing.html
3. ✅ Commits and pushes to GitHub
4. ✅ Returns to your original branch
5. ✅ Preserves any uncommitted changes

---

## 🎯 That's It!

Everything is ready. Just run the commands above to deploy.

For more details, see:
- **Quick reference:** [DEPLOYMENT-QUICK-START.md](./DEPLOYMENT-QUICK-START.md)
- **Full guide:** [DEPLOY.md](./DEPLOY.md)
