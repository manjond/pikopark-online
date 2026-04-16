#!/bin/bash
# Runs from the repo root regardless of where Vercel invokes it.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Building shared..."
cd "$ROOT/shared" && npm run build

echo "==> Building client..."
cd "$ROOT/client" && npm run build
