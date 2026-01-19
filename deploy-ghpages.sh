#!/bin/bash

# ODUS - GitHub Pages Deployment Script
# This script deploys the landing page to GitHub Pages

set -e  # Exit on error

echo "=================================="
echo "ODUS GitHub Pages Deployment"
echo "=================================="
echo ""

# Check if landing.html exists
if [ ! -f "landing.html" ]; then
    echo "Error: landing.html not found"
    exit 1
fi

echo "Step 1: Checking git status..."
git status

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Stash any changes
if ! git diff-index --quiet HEAD --; then
    echo "Stashing uncommitted changes..."
    git stash
    STASHED=true
fi

# Create or checkout gh-pages branch
echo "Step 2: Setting up gh-pages branch..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "Checking out existing gh-pages branch..."
    git checkout gh-pages
else
    echo "Creating new gh-pages branch..."
    git checkout --orphan gh-pages
    
    # Remove all files except landing.html
    git rm -rf . 2>/dev/null || true
    git checkout $CURRENT_BRANCH -- landing.html
fi

# Ensure we only have landing.html
echo ""
echo "Step 3: Preparing landing page for deployment..."

# Copy landing.html from current branch if needed
if [ ! -f "landing.html" ]; then
    git checkout $CURRENT_BRANCH -- landing.html
fi

echo "Files in gh-pages branch:"
ls -la landing.html
echo ""

# Commit changes
echo "Step 4: Committing changes..."
git add landing.html
if git diff --cached --quiet; then
    echo "No changes to commit"
else
    git commit -m "Deploy landing page to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo ""
echo "Step 5: Pushing to GitHub..."
echo "Note: This requires proper GitHub authentication"
echo ""

if git push origin gh-pages; then
    echo ""
    echo "=================================="
    echo "✓ Deployment Successful!"
    echo "=================================="
    echo ""
    echo "Landing page deployed to:"
    echo "https://amuzetnom.github.io/ODUS/landing.html"
    echo ""
    echo "Configure GitHub Pages:"
    echo "1. Go to: https://github.com/amuzetnoM/ODUS/settings/pages"
    echo "2. Source: gh-pages branch"
    echo "3. Root directory"
    echo "4. Save"
else
    echo ""
    echo "=================================="
    echo "✗ Push Failed"
    echo "=================================="
    echo ""
    echo "This might be due to authentication issues."
    echo "Make sure you have proper credentials configured."
fi

# Return to original branch
echo ""
echo "Step 6: Returning to $CURRENT_BRANCH branch..."
git checkout $CURRENT_BRANCH

# Restore stashed changes
if [ "$STASHED" = true ]; then
    echo "Restoring stashed changes..."
    git stash pop
fi

echo ""
echo "Done!"
