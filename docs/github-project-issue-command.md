# GitHub Project/Issue 専用コマンド

`gh` 操作の定型（Issue 作成/更新、Project 連携、Status 更新）を省略入力で実行するための運用です。

## Codex スラッシュコマンド（プロジェクト固有）

以下のファイルをこのリポジトリの `.codex/prompts/` に配置します。

- `tracker-status.md`
- `tracker-upsert-issue.md`
- `tracker-sync-mvp.md`

グローバル `~/.codex/prompts` には同名ファイルを置かず、プロジェクトごとに分離します。
Codex では `/prompts:<name>` で呼び出します（例: `/prompts:tracker-sync-mvp`）。

## ベース実行コマンド

スラッシュコマンドは内部で次の npm script を使います。

```bash
npm run gh:tracker -- <command> [options]
```

## コマンド

1. 状態確認

```bash
npm run gh:tracker -- status
```

2. Issue を作成または更新して Project に追加

```bash
npm run gh:tracker -- upsert-issue \
  --title "[Ops] 例: issue title" \
  --body-file docs/project-spec.md \
  --labels "enhancement,ops" \
  --milestone "MVP v1 - project-spec" \
  --status "Todo"
```

3. Project の status 更新

```bash
npm run gh:tracker -- set-status --issue 11 --status "In Progress"
```

4. MVP issue を一括同期（label + milestone で抽出）

```bash
npm run gh:tracker -- sync-mvp --status "Todo"
```

5. MVP issue 一括同期の dry-run

```bash
npm run gh:tracker -- sync-mvp --dry-run
```

## 主なオプション

- `--repo OWNER/REPO`: 対象リポジトリ（未指定時は `origin` から推定）
- `--owner OWNER`: Project owner（未指定時は `repo` から推定）
- `--project NUMBER`: Project number（既定値: `5`）
- `--status NAME`: Project の Status 名（例: `Todo`, `In Progress`, `Done`）
- `--state open|all`: `sync-mvp` 対象の Issue state（既定値: `open`）
- `--mvp-label NAME`: `sync-mvp` 抽出ラベル（既定値: `mvp`）
- `--mvp-milestone NAME`: `sync-mvp` 抽出マイルストーン（既定値: `MVP v1 - project-spec`）
- `--dry-run`: `sync-mvp` の対象表示のみ実行し、更新はしない

## 前提

- `gh auth status` が成功していること
- Project 更新には `project` スコープが必要
