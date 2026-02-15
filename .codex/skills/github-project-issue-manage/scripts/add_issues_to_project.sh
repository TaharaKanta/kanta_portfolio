#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 4 ]; then
  echo "Usage: $0 <owner> <repo> <project-number> <issue-number...> [--status <StatusName>]" >&2
  exit 1
fi

owner="$1"
repo="$2"
project_number="$3"
shift 3

status_name="Todo"
issues=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --status)
      shift
      status_name="${1:-Todo}"
      ;;
    *)
      issues+=("$1")
      ;;
  esac
  shift || true
done

if [ "${#issues[@]}" -eq 0 ]; then
  echo "No issue numbers provided." >&2
  exit 1
fi

gh auth status >/dev/null

project_id="$(gh project view "$project_number" --owner "$owner" --format json --jq '.id')"
status_field_id="$(gh project field-list "$project_number" --owner "$owner" --format json --jq '.fields[] | select(.name=="Status") | .id')"
status_option_id="$(gh project field-list "$project_number" --owner "$owner" --format json --jq ".fields[] | select(.name==\"Status\") | .options[] | select(.name==\"$status_name\") | .id")"

if [ -z "${status_option_id}" ]; then
  echo "Status option not found: $status_name" >&2
  exit 1
fi

for issue_number in "${issues[@]}"; do
  item_id="$(gh project item-list "$project_number" --owner "$owner" --format json --jq ".items[] | select(.content.number == ${issue_number}) | .id" | head -n1 || true)"
  issue_url="https://github.com/${owner}/${repo}/issues/${issue_number}"

  if [ -z "${item_id}" ]; then
    item_id="$(gh project item-add "$project_number" --owner "$owner" --url "$issue_url" --format json --jq '.id')"
    echo "added #${issue_number}"
  else
    echo "exists #${issue_number}"
  fi

  gh project item-edit \
    --id "$item_id" \
    --project-id "$project_id" \
    --field-id "$status_field_id" \
    --single-select-option-id "$status_option_id" >/dev/null

  echo "status ${status_name} #${issue_number}"
done
