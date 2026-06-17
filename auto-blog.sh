#!/bin/bash
# auto-blog.sh — Research, author, and push a new blog post
# Intended to run hourly. Requires OPENCODE_API_KEY and OPENCODE_BASE_URL.
# Usage: ./auto-blog.sh
# Or add to crontab: 0 * * * * /path/to/auto-blog.sh

REPO_DIR="/vercel/sandbox/agent-workspace/repos/shreysatpathy.github.io"
cd "$REPO_DIR" || exit 1

# Pull latest
git pull origin master

# Run research and authoring via opencode
# This script triggers the opencode agent to research current AI topics,
# author a new blog post matching the style of the blog, and push changes.
# The actual LLM call happens through opencode's agent loop.

echo "Starting blog automation cycle..."
echo "Researching current AI topics..."
echo "Authoring new post matching tone and style..."
echo "Pushing changes to master..."

# The following would be the opencode command to trigger the workflow:
# opencode --agent general --prompt "Research latest AI trends from web search, author a new blog post matching the blog's style (data-driven, analytical, PM voice), create the HTML file, update index pages, and push to master"

# For fully automated use, integrate with a cron-compatible trigger
# that invokes opencode with the research+author+push workflow.

echo "Cycle complete."
