#!/bin/bash

# ODUS - Google Cloud Deployment Script
# This script deploys ODUS to Google Cloud App Engine

set -e  # Exit on error

echo "=================================="
echo "ODUS Google Cloud Deployment"
echo "=================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check authentication
echo "Checking Google Cloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "Error: Not authenticated with Google Cloud"
    echo ""
    echo "Please run: gcloud auth login"
    echo "Then run this script again"
    exit 1
fi

# Check if project is set
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "(unset)" ]; then
    echo "Error: No Google Cloud project is set"
    echo ""
    echo "Please run: gcloud config set project [YOUR-PROJECT-ID]"
    echo "Then run this script again"
    exit 1
fi

echo "Authenticated account: $(gcloud config get-value account)"
echo "Project ID: $PROJECT_ID"
echo ""

# Build the application
echo "Step 1: Building application..."
npm run build

if [ ! -d "dist" ]; then
    echo "Error: Build failed - dist/ directory not found"
    exit 1
fi

echo "✓ Build successful"
echo ""

# Check if app.yaml exists
if [ ! -f "app.yaml" ]; then
    echo "Error: app.yaml not found"
    echo "This file is required for Google Cloud deployment"
    exit 1
fi

echo "Step 2: Deploying to Google Cloud App Engine..."
echo "Project: $PROJECT_ID"
echo ""

# Deploy to App Engine
gcloud app deploy --quiet --project="$PROJECT_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "✓ Deployment Successful!"
    echo "=================================="
    echo ""
    echo "Your app is live at:"
    gcloud app browse --project="$PROJECT_ID" --no-launch-browser
    echo ""
    echo "To view logs:"
    echo "  gcloud app logs tail -s default"
    echo ""
    echo "To view in browser:"
    echo "  gcloud app browse"
else
    echo ""
    echo "=================================="
    echo "✗ Deployment Failed"
    echo "=================================="
    echo ""
    echo "Common issues:"
    echo "1. App Engine API not enabled - Enable at: https://console.cloud.google.com/apis/library/appengine.googleapis.com"
    echo "2. Billing not enabled - Check: https://console.cloud.google.com/billing"
    echo "3. Permissions issue - Ensure you have 'App Engine Admin' role"
    exit 1
fi
