#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "======================================"
echo "🚀 Starting Pre-Deployment Checks..."
echo "======================================"

echo ""
echo "--- 📦 Backend Checks ---"
cd backend
echo "1. Installing backend dependencies..."
npm ci || npm install
echo "2. Running basic syntax check on backend entry point..."
node -c server.js
cd ..

echo ""
echo "--- 🖥️  Frontend Checks ---"
cd frontend
echo "1. Installing frontend dependencies..."
npm ci || npm install
echo "2. Running TypeScript Typecheck..."
npm run typecheck
echo "3. Running ESLint..."
npm run lint
echo "4. Running Production Build..."
npm run build
cd ..

echo ""
echo "======================================"
echo "✅ All checks passed successfully! Ready for deployment."
echo "======================================"
