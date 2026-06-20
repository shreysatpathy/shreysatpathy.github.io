#!/bin/bash
# auto-blog.sh — Every hour: research, author, push a new blog post
# Installed via crontab: 0 * * * * /vercel/sandbox/agent-workspace/repos/shreysatpathy.github.io/auto-blog.sh

REPO_DIR="/vercel/sandbox/agent-workspace/repos/shreysatpathy.github.io"
cd "$REPO_DIR" || exit 1

git pull origin master

# Trigger opencode to research, write, and push via the task tool
opencode --agent general --prompt "
You are Shrey Satpathy's automated blog writer. Your task every hour:

1. Read existing blog posts at $REPO_DIR/blog/ to understand the style and series
2. Web search for the latest AI enterprise trends, agentic AI adoption news, and emerging research
3. Pick ONE fresh topic NOT already covered in the blog's 'gap' series
4. Author a new HTML blog post matching the analytical, data-driven PM voice with specific statistics, citations, and the signature 'The [X Gap]' title framing
5. Name the file blog/the-[topic]-gap.html (lowercase, hyphenated)
6. Update blog/index.html with the new post as the first entry
7. Update index.html featured section with the new post as the first entry
8. git add, commit, and push to origin master

The post must:
- Start with a relatable scenario hook
- Use specific statistics from real sources (Gartner, Deloitte, McKinsey, Goldman Sachs, etc.)
- Bold key numbers with <strong> tags
- Have h3 subheadings
- Reference related posts in the series where relevant
- End with LinkedIn/email CTA
- Match the exact HTML template structure found in existing posts
- Date the post one day after the most recent post in the series
- Tags format: <span class=\"tag\">AI</span> etc.

Do NOT add comments to the HTML. Keep the post concise (~800-1200 words).
"

echo "Cycle complete."
