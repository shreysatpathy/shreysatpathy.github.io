#!/bin/bash
# auto-blog.sh — Every hour: research, author, push a new blog post
# Launched via blog-loop.sh

REPO_DIR="/vercel/sandbox/agent-workspace/repos/shreysatpathy.github.io"
cd "$REPO_DIR" || exit 1

git pull origin master

# Get the last post date from the most recent blog post file
LAST_POST=$(ls -t blog/the-*-gap.html | head -1)
LAST_DATE=$(grep 'datePublished' "$LAST_POST" | sed 's/.*"\([0-9-]*\)".*/\1/')
NEXT_DATE=$(date -d "$LAST_DATE + 1 day" +%Y-%m-%d)

# Pick a topic NOT yet covered by checking existing gap posts
# Current gaps covered: sustainability, perception, breach, gravity, ground-truth, saturation,
# verification, reversal, escalation, agent-washing, readiness, budget, interoperability, commodity,
# review, containment, blast-radius, state, data-infrastructure, freshness, confidence, tool-calling,
# fidelity, liability, energy, unit-economics, retrieval, commitment, prompt-drift, ceiling, oversight,
# audit, alignment, absorption, scaffolding, embedded, rollback, fragility, trust, handoff, jevons,
# channel, rca, loop-tax, validity, context, replication, labor, sovereignty, entropy, memory,
# model-debt, cost, reliability, shadow, autonomy, redesign, supply-chain, coordination, runtime,
# injection, identity, integration, evaluation, data-debt, fluency, value-chasm, deprecation-crisis,
# observability-blindspot, mandate-trap, enforcement, great-cheapening, 68-point, governance-multiplier,
# 88-percent, sprawl, distribution

TOPICS_QUEUE=(
  "The Procurement Gap: Why 51% of Enterprises Are Rebuilding AI In-House After Vendor Lock-In"
  "The Telemetry Gap: Why 73% of Enterprises Can't Trace Which AI Agent Made Which Decision"
  "The Sunk Cost Gap: Why 61% of Enterprises Keep Funding Failing AI Projects"
  "The Calibration Gap: Why Models Predict 90% Confidence While Being Wrong 40% of the Time"
  "The Convergence Gap: Why Open Source and Proprietary Models Are Now Functionally Indistinguishable"
  "The Latency Gap: Why 200ms of Agent Response Time Costs Enterprises $4M Annually"
  "The Consent Gap: Why 67% of Enterprise AI Agents Access Data They Were Never Authorized to Touch"
  "The Cascade Gap: Why One Hallucination in Step 3 Destroys the Entire 12-Step Workflow"
  "The Feedback Gap: Why 83% of AI Agents Deploy Without a Signal for Continuous Improvement"
)

# Pick a random topic or rotate through them
# For now, use a hashed timer to pick deterministically
HOUR=$(date +%H)
INDEX=$(( (10#$HOUR) % ${#TOPICS_QUEUE[@]} ))
TOPIC="${TOPICS_QUEUE[$INDEX]}"

# Generate the topic slug
SLUG=$(echo "$TOPIC" | sed 's/.*: //' | sed 's/^The //' | sed 's/:.*//' | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/--*/-/g' | sed 's/[^a-z0-9-]//g')
FILENAME="blog/the-$SLUG.html"

# Check if already exists
if [ -f "$FILENAME" ]; then
  echo "Topic already exists, using generic fallback"
  SLUG="ai-deployment-gap-$(date +%s)"
  FILENAME="blog/the-$SLUG.html"
fi

# Call opencode to research and write
opencode --agent general --prompt "
You are Shrey Satpathy's automated blog writer. Today is $(date +%B\ %d,\ %Y).

Write a new blog post at $REPO_DIR/$FILENAME (dated $NEXT_DATE).

Topic: $TOPIC

Requirements:
- Read 3-5 existing blog posts at $REPO_DIR/blog/ to match the analytical PM voice
- Use the exact HTML template from existing posts
- Title format: '$TOPIC — And Why Every [thing] Is the Most Expensive [something] Nobody Budgeted For'
- Open with a relatable scenario hook
- Use real statistics from 2026 reports (Prosigns, KPMG, Deloitte, Gartner, Anthropic, VentureBeat, OneReach, Confluent)
- Bold key numbers with <strong>
- Use h3 subheadings
- Reference related gap posts with <a> links
- End with LinkedIn/email CTA
- Tags format: <span class=\"tag\">AI</span> etc.
- Do NOT add HTML comments
- ~800-1200 words

After writing the file:
1. Update $REPO_DIR/blog/index.html by inserting a new <article> as the first entry (right after <div class=\"post-grid\">)
   Use the same card format as existing posts with runtime.svg image
2. Update $REPO_DIR/index.html by inserting the same new <article> as the first featured entry
3. git add -A && git commit -m \"$TOPIC\" && git push origin master
" 2>&1 | tee -a "$REPO_DIR/auto-blog.log"

echo "[$(date)] Cycle complete: $TOPIC" >> "$REPO_DIR/auto-blog.log"
