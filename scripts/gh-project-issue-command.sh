#!/usr/bin/env bash
set -euo pipefail

DEFAULT_PROJECT_NUMBER="5"
DEFAULT_MVP_LABEL="mvp"
DEFAULT_MVP_MILESTONE="MVP v1 - project-spec"
SYNC_SCRIPT=".codex/skills/github-project-issue-manage/scripts/add_issues_to_project.sh"

usage() {
  cat <<'EOF'
Usage:
  gh-project-issue-command.sh status [--repo OWNER/REPO] [--owner OWNER] [--project NUMBER] [--limit N]
  gh-project-issue-command.sh upsert-issue --title TITLE [--body-file FILE] [--labels "a,b"] [--milestone NAME] [--repo OWNER/REPO] [--owner OWNER] [--project NUMBER] [--status NAME]
  gh-project-issue-command.sh set-status --issue NUMBER [--status NAME] [--repo OWNER/REPO] [--owner OWNER] [--project NUMBER]
  gh-project-issue-command.sh sync-mvp [--status NAME] [--state open|all] [--mvp-label NAME] [--mvp-milestone NAME] [--dry-run] [--repo OWNER/REPO] [--owner OWNER] [--project NUMBER] [--limit N]
EOF
}

parse_repo_from_remote() {
  local remote_url
  remote_url="$(git config --get remote.origin.url || true)"

  if [[ -z "$remote_url" ]]; then
    echo ""
    return
  fi

  if [[ "$remote_url" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
    echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    return
  fi

  echo ""
}

ensure_prerequisites() {
  if ! command -v gh >/dev/null 2>&1; then
    echo "gh CLI is required." >&2
    exit 1
  fi
  gh auth status >/dev/null
}

split_repo() {
  local repo="$1"
  echo "${repo%%/*}" "${repo##*/}"
}

require_file() {
  local file_path="$1"
  if [[ ! -f "$file_path" ]]; then
    echo "File not found: $file_path" >&2
    exit 1
  fi
}

cmd_status() {
  local repo="$1"
  local owner="$2"
  local project_number="$3"
  local limit="$4"

  echo "Project:"
  gh project view "$project_number" --owner "$owner" --format json --jq '{title: .title, url: .url, items: .items.totalCount}'
  echo ""
  echo "Issues:"
  gh issue list -R "$repo" --limit "$limit" \
    --json number,title,state,milestone,url \
    --jq '.[] | "#\(.number) [\(.state)] \(.title) | milestone=\(.milestone.title // "-") | \(.url)"'
}

cmd_upsert_issue() {
  local repo="$1"
  local owner="$2"
  local project_number="$3"
  local status_name="$4"
  local title="$5"
  local body_file="$6"
  local labels_csv="$7"
  local milestone_name="$8"

  local existing_number
  existing_number="$(gh issue list -R "$repo" --state all --search "$title in:title" --json number,title --jq ".[] | select(.title == \"$title\") | .number" | head -n1 || true)"

  local issue_number
  local issue_url

  if [[ -n "${existing_number:-}" ]]; then
    issue_number="$existing_number"
    echo "Existing issue found: #$issue_number"
    if [[ -n "$body_file" ]]; then
      gh issue edit "$issue_number" -R "$repo" --body-file "$body_file" >/dev/null
    fi
    if [[ -n "$milestone_name" ]]; then
      gh issue edit "$issue_number" -R "$repo" --milestone "$milestone_name" >/dev/null
    fi
    if [[ -n "$labels_csv" ]]; then
      gh issue edit "$issue_number" -R "$repo" --add-label "$labels_csv" >/dev/null
    fi
  else
    local create_args=("-R" "$repo" "--title" "$title")
    if [[ -n "$body_file" ]]; then
      create_args+=("--body-file" "$body_file")
    else
      create_args+=("--body" "")
    fi
    if [[ -n "$labels_csv" ]]; then
      create_args+=("--label" "$labels_csv")
    fi
    if [[ -n "$milestone_name" ]]; then
      create_args+=("--milestone" "$milestone_name")
    fi

    issue_url="$(gh issue create "${create_args[@]}" | tail -n1)"
    issue_number="${issue_url##*/}"
    echo "Created issue: #$issue_number"
  fi

  if [[ ! -x "$SYNC_SCRIPT" ]]; then
    echo "Sync script is not executable: $SYNC_SCRIPT" >&2
    exit 1
  fi

  local repo_parts
  read -r -a repo_parts <<<"$(split_repo "$repo")"
  bash "$SYNC_SCRIPT" "$owner" "${repo_parts[1]}" "$project_number" "$issue_number" --status "$status_name"

  gh issue view "$issue_number" -R "$repo" --json url --jq '.url'
}

cmd_set_status() {
  local repo="$1"
  local owner="$2"
  local project_number="$3"
  local issue_number="$4"
  local status_name="$5"

  if [[ ! -x "$SYNC_SCRIPT" ]]; then
    echo "Sync script is not executable: $SYNC_SCRIPT" >&2
    exit 1
  fi

  local repo_parts
  read -r -a repo_parts <<<"$(split_repo "$repo")"
  bash "$SYNC_SCRIPT" "$owner" "${repo_parts[1]}" "$project_number" "$issue_number" --status "$status_name"
}

cmd_sync_mvp() {
  local repo="$1"
  local owner="$2"
  local project_number="$3"
  local status_name="$4"
  local mvp_state="$5"
  local mvp_label="$6"
  local mvp_milestone="$7"
  local limit="$8"
  local dry_run="$9"

  if [[ ! -x "$SYNC_SCRIPT" ]]; then
    echo "Sync script is not executable: $SYNC_SCRIPT" >&2
    exit 1
  fi

  local search_query_parts=()
  if [[ -n "$mvp_label" ]]; then
    search_query_parts+=("label:${mvp_label}")
  fi
  if [[ -n "$mvp_milestone" ]]; then
    search_query_parts+=("milestone:\"${mvp_milestone}\"")
  fi

  local issue_numbers=()
  local issue_numbers_raw=""
  if [[ "${#search_query_parts[@]}" -gt 0 ]]; then
    local search_query="${search_query_parts[*]}"
    issue_numbers_raw="$(gh issue list -R "$repo" --state "$mvp_state" --limit "$limit" --search "$search_query" --json number --jq '.[].number')"
  else
    issue_numbers_raw="$(gh issue list -R "$repo" --state "$mvp_state" --limit "$limit" --json number --jq '.[].number')"
  fi

  while IFS= read -r issue_number_line; do
    if [[ -n "$issue_number_line" ]]; then
      issue_numbers+=("$issue_number_line")
    fi
  done <<<"$issue_numbers_raw"

  if [[ "${#issue_numbers[@]}" -eq 1 && -z "${issue_numbers[0]}" ]]; then
    issue_numbers=()
  fi

  if [[ "${#issue_numbers[@]}" -eq 0 ]]; then
    echo "No issues found for sync-mvp (state=$mvp_state, label=${mvp_label:-<none>}, milestone=${mvp_milestone:-<none>})."
    return
  fi

  echo "sync-mvp target issues: ${issue_numbers[*]}"
  if [[ "$dry_run" == "true" ]]; then
    echo "dry-run enabled: no changes applied."
    return
  fi

  local repo_parts
  read -r -a repo_parts <<<"$(split_repo "$repo")"
  bash "$SYNC_SCRIPT" "$owner" "${repo_parts[1]}" "$project_number" "${issue_numbers[@]}" --status "$status_name"
}

main() {
  local command="${1:-}"
  if [[ -z "$command" ]]; then
    usage
    exit 1
  fi
  if [[ "$command" == "-h" || "$command" == "--help" ]]; then
    usage
    exit 0
  fi
  shift || true

  local repo
  repo="$(parse_repo_from_remote)"
  local owner=""
  local project_number="$DEFAULT_PROJECT_NUMBER"
  local limit="30"
  local status_name="Todo"
  local title=""
  local body_file=""
  local labels_csv=""
  local milestone_name=""
  local issue_number=""
  local mvp_state="open"
  local mvp_label="$DEFAULT_MVP_LABEL"
  local mvp_milestone="$DEFAULT_MVP_MILESTONE"
  local dry_run="false"

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      --repo)
        repo="${2:-}"
        shift 2
        ;;
      --owner)
        owner="${2:-}"
        shift 2
        ;;
      --project)
        project_number="${2:-}"
        shift 2
        ;;
      --limit)
        limit="${2:-}"
        shift 2
        ;;
      --status)
        status_name="${2:-}"
        shift 2
        ;;
      --title)
        title="${2:-}"
        shift 2
        ;;
      --body-file)
        body_file="${2:-}"
        shift 2
        ;;
      --labels)
        labels_csv="${2:-}"
        shift 2
        ;;
      --milestone)
        milestone_name="${2:-}"
        shift 2
        ;;
      --issue)
        issue_number="${2:-}"
        shift 2
        ;;
      --state)
        mvp_state="${2:-}"
        shift 2
        ;;
      --mvp-label)
        mvp_label="${2:-}"
        shift 2
        ;;
      --mvp-milestone)
        mvp_milestone="${2:-}"
        shift 2
        ;;
      --dry-run)
        dry_run="true"
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "Unknown argument: $1" >&2
        usage
        exit 1
        ;;
    esac
  done

  if [[ -z "$repo" ]]; then
    echo "--repo is required when origin URL cannot be parsed." >&2
    exit 1
  fi

  if [[ -z "$owner" ]]; then
    owner="${repo%%/*}"
  fi

  case "$command" in
    status)
      ensure_prerequisites
      cmd_status "$repo" "$owner" "$project_number" "$limit"
      ;;
    upsert-issue)
      ensure_prerequisites
      if [[ -z "$title" ]]; then
        echo "--title is required for upsert-issue." >&2
        exit 1
      fi
      if [[ -n "$body_file" ]]; then
        require_file "$body_file"
      fi
      cmd_upsert_issue "$repo" "$owner" "$project_number" "$status_name" "$title" "$body_file" "$labels_csv" "$milestone_name"
      ;;
    set-status)
      ensure_prerequisites
      if [[ -z "$issue_number" ]]; then
        echo "--issue is required for set-status." >&2
        exit 1
      fi
      cmd_set_status "$repo" "$owner" "$project_number" "$issue_number" "$status_name"
      ;;
    sync-mvp)
      ensure_prerequisites
      if [[ "$mvp_state" != "open" && "$mvp_state" != "all" ]]; then
        echo "--state must be open or all for sync-mvp." >&2
        exit 1
      fi
      cmd_sync_mvp "$repo" "$owner" "$project_number" "$status_name" "$mvp_state" "$mvp_label" "$mvp_milestone" "$limit" "$dry_run"
      ;;
    *)
      echo "Unknown command: $command" >&2
      usage
      exit 1
      ;;
  esac
}

main "$@"
