#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "Usage: $0 <owner/repo> [output-dir]" >&2
  exit 1
fi

repo="$1"
owner="${repo%%/*}"
outdir="${2:-./tmp/gh-state-${owner}-$(date +%Y%m%d-%H%M%S)}"

mkdir -p "$outdir"

gh auth status >/dev/null

gh issue list -R "$repo" --state all --limit 200 \
  --json number,title,state,labels,milestone,assignees,updatedAt,url \
  > "$outdir/issues.json"

gh label list -R "$repo" --limit 200 \
  --json name,color,description \
  > "$outdir/labels.json"

gh api "repos/$repo/milestones?state=all&per_page=100" \
  > "$outdir/milestones.json"

gh project list --owner "$owner" --limit 100 --format json \
  > "$outdir/projects.json"

echo "Exported tracker snapshot to $outdir"
