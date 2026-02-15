---
name: github-project-issue-read
description: Read and summarize GitHub Issues, Milestones, Labels, and Projects for a repository without making changes. Use when the user asks to inspect issue/project state, gather planning context, verify status, or audit tracker data before implementation.
---

# GitHub Project/Issue Read

リポジトリの計画・進捗管理のために、読み取り専用で情報収集する。

## Preflight

1. リポジトリ名と owner を特定する。
2. `gh auth status` を実行して GitHub CLI のログイン状態を確認する。
3. Project 読み取りで権限エラーが出る場合は `gh auth refresh -s read:project` を実行する。
4. 書き込み系コマンド（`create`, `edit`, `close`, `delete`, `item-add`, `item-edit`）を実行しない。

## Read workflow

1. 必要に応じて `gh issue list` と `gh issue view` で Issue 状態を取得する。
2. `gh api repos/<owner>/<repo>/milestones` と `gh label list` で Milestone/Label 情報を取得する。
3. `gh project list`, `gh project view`, `gh project field-list`, `gh project item-list` で Project 情報を取得する。
4. 次の観点で要約を作成する。
   - ステータス別件数
   - メタデータ不足（label, milestone, assignee）
   - Project ボードのステータス分布
   - ブロッカーや滞留項目

## Output contract

1. 指摘した Issue/Project の URL を含める。
2. 観測事実と推測を分けて記述する。
3. 依頼達成に必要な最小の次アクションで締める。

## Reusable resources

- コマンド集: `references/gh-read-recipes.md`
- スナップショット取得スクリプト: `scripts/export_repo_tracker_state.sh`
