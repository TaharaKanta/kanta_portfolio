---
name: github-project-issue-manage
description: Create and update GitHub Issues, Milestones, Labels, and Projects with idempotent workflows using gh CLI. Use when the user asks to add, edit, sync, or restructure tracker data across issues and project boards.
---

# GitHub Project/Issue Manage

GitHub の追跡対象（Issue/Project など）に対して、制御された書き込み操作を行う。

## Preflight

1. リポジトリ名と owner を特定する。
2. `gh auth status` を実行し、`repo` と `project` スコープを確認する。
3. Project コマンドで権限エラーが出る場合は `gh auth refresh -s project,read:project` を実行する。
4. 書き込み前に現状を読む。先に `$github-project-issue-read` ワークフローを使う。

## Write workflow

1. ユーザー意図から変更セットを作る。
   - issue の作成/更新対象
   - milestone と label の変更
   - project のメタデータとボードステータス変更
2. 冪等に実行する。
   - Issue 作成時は先に title 検索して重複をスキップする。
   - Label は create-or-edit で処理する。
   - Milestone は無ければ作成、あれば再利用する。
   - Project item は未登録の場合のみ追加する。
3. 大量更新では、同じコマンドの繰り返しより `scripts/` を優先する。
4. 最後に再読込して、実際の変更内容を報告する。

## Safety rules

1. 明示依頼がない限り、破壊的コマンド（`close`, `delete`, `archive`）を使わない。
2. 無関係な label / milestone / issue 本文を壊さない。
3. 権限やスコープで失敗した場合は再認証を促し、残タスクから再開する。

## Output contract

1. created / updated / skipped の件数を報告する。
2. 変更した issue / project / milestone の URL を含める。
3. 未適用アクションと阻害要因を明記する。

## Reusable resources

- コマンド集: `references/gh-write-recipes.md`
- Project 一括同期スクリプト: `scripts/add_issues_to_project.sh`
