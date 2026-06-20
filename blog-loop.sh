#!/bin/bash
# blog-loop.sh — Runs auto-blog.sh every hour as a background process
# Usage: nohup bash blog-loop.sh &
REPO_DIR="/vercel/sandbox/agent-workspace/repos/shreysatpathy.github.io"
while true; do
  bash "$REPO_DIR/auto-blog.sh"
  echo "[$(date)] Cycle complete. Sleeping 1 hour..."
  sleep 3600
done
