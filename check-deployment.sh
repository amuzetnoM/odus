#!/bin/bash

# ODUS - Deployment Status Checker
# This script checks the current deployment status and readiness

echo "=================================="
echo "ODUS Deployment Status"
echo "=================================="
echo ""

# Check build status
echo "📦 Build Status:"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "  ✅ Application built successfully"
    echo "  📁 Output directory: dist/"
    if [ -f "dist/main-5GGIGRGD.js" ]; then
        SIZE=$(du -h dist/main-5GGIGRGD.js | cut -f1)
        echo "  📊 Bundle size: $SIZE"
    fi
else
    echo "  ❌ Application not built"
    echo "  ⚠️  Run: npm run build"
fi
echo ""

# Check Google Cloud configuration
echo "☁️  Google Cloud Status:"
if [ -f "app.yaml" ]; then
    echo "  ✅ app.yaml configured"
else
    echo "  ❌ app.yaml not found"
fi

if command -v gcloud &> /dev/null; then
    echo "  ✅ gcloud CLI installed"
    
    # Check authentication
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q .; then
        ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -n1)
        echo "  ✅ Authenticated as: $ACCOUNT"
        
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
        if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "(unset)" ]; then
            echo "  ✅ Project set: $PROJECT_ID"
            echo "  ✨ Ready to deploy to Google Cloud!"
        else
            echo "  ⚠️  No project set"
            echo "  💡 Run: gcloud config set project YOUR-PROJECT-ID"
        fi
    else
        echo "  ⚠️  Not authenticated"
        echo "  💡 Run: gcloud auth login"
    fi
else
    echo "  ❌ gcloud CLI not installed"
    echo "  💡 Install from: https://cloud.google.com/sdk/docs/install"
fi
echo ""

# Check GitHub Pages configuration
echo "📄 GitHub Pages Status:"
if [ -f "landing.html" ]; then
    echo "  ✅ landing.html exists"
else
    echo "  ❌ landing.html not found"
fi

if [ -f "deploy-ghpages.sh" ]; then
    echo "  ✅ Deployment script ready"
else
    echo "  ❌ deploy-ghpages.sh not found"
fi

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "  ✅ gh-pages branch exists locally"
else
    echo "  ℹ️  gh-pages branch will be created on first deployment"
fi
echo ""

# Check deployment scripts
echo "🛠️  Deployment Scripts:"
if [ -f "deploy-gcloud.sh" ] && [ -x "deploy-gcloud.sh" ]; then
    echo "  ✅ deploy-gcloud.sh (executable)"
else
    echo "  ⚠️  deploy-gcloud.sh not executable"
    echo "  💡 Run: chmod +x deploy-gcloud.sh"
fi

if [ -f "deploy-ghpages.sh" ] && [ -x "deploy-ghpages.sh" ]; then
    echo "  ✅ deploy-ghpages.sh (executable)"
else
    echo "  ⚠️  deploy-ghpages.sh not executable"
    echo "  💡 Run: chmod +x deploy-ghpages.sh"
fi
echo ""

# Summary
echo "=================================="
echo "📋 Deployment Summary"
echo "=================================="
echo ""

READY_GCLOUD=false
READY_GHPAGES=false

if [ -d "dist" ] && [ -f "app.yaml" ] && command -v gcloud &> /dev/null; then
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q .; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
        if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "(unset)" ]; then
            READY_GCLOUD=true
        fi
    fi
fi

if [ -f "landing.html" ] && [ -f "deploy-ghpages.sh" ]; then
    READY_GHPAGES=true
fi

if [ "$READY_GCLOUD" = true ]; then
    echo "✅ Ready to deploy to Google Cloud"
    echo "   Run: ./deploy-gcloud.sh"
else
    echo "⚠️  Google Cloud deployment requires setup"
    echo "   See: DEPLOY.md for instructions"
fi

if [ "$READY_GHPAGES" = true ]; then
    echo "✅ Ready to deploy to GitHub Pages"
    echo "   Run: ./deploy-ghpages.sh"
else
    echo "⚠️  GitHub Pages deployment requires setup"
    echo "   See: DEPLOY.md for instructions"
fi

echo ""
echo "📖 For detailed instructions, see: DEPLOY.md"
echo ""
