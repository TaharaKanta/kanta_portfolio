## Skills

スキルは `SKILL.md` に定義された、ローカルで従うべき手順セットです。以下はこのリポジトリで利用可能なスキルです。

### Available skills

- github-project-issue-read: 実装計画前に GitHub Issues / Milestones / Projects を読み取り、要約するための read-only ワークフロー。 (file: /Users/taharakanta/Desktop/kanta_portfolio/.codex/skills/github-project-issue-read/SKILL.md)
- github-project-issue-manage: GitHub Issues / Milestones / Labels / Project item・status を冪等に作成・更新するワークフロー。 (file: /Users/taharakanta/Desktop/kanta_portfolio/.codex/skills/github-project-issue-manage/SKILL.md)

### How to use skills

- Discovery: 上に列挙したスキルがこのリポジトリで利用可能です。
- Trigger rules: ユーザーがスキル名を指定した場合（例: `$github-project-issue-read`）、または依頼内容がスキル説明に明確に一致する場合は、そのスキルを使います。
- Missing/blocked: スキルパスを読めない場合は簡潔に報告し、利用可能な最善の代替手段で続行します。
- Progressive disclosure: まず `SKILL.md` を読み、`references/` や `scripts/` は必要な場合のみ読み込みます。
- Coordination: 両方のスキルが関係する場合は、read-only スキルを先に実行し、その後に write スキルを実行します。
- Writing rule: 安定したトリガーのため、`SKILL.md` の frontmatter（`name`, `description`）は英語のまま維持します。
- Writing rule: `SKILL.md` の本文は日本語で記述します。
- Writing rule: コマンド名・識別子・エラー文字列は原文の英語のまま維持します。

### Documentation lookup

- フォルダ構成や配置ルールが関わる作業では、必要に応じて `docs` ディレクトリを確認します。
- Docs-first enforcement:
  - `src/` 配下でファイルを新規作成・移動する前に、以下を読んで従います:
    - `docs/file-creation-rules.md`
    - `docs/frontend-architecture.md`
    - `docs/folder-structure.md`
  - 実装着手前に `docs/README.md` を確認し、対象タスクに関連する `docs/*.md` をすべて読みます。
  - 実装とドキュメントが矛盾する場合は、ドキュメントを正として実装をリファクタします。
  - Server Action を追加する場合は `_actions/` 配下に配置し、`index.ts` から export します。
  - FE コンポーネントを追加する場合は `[ComponentName]/index.ts` を作成し、`index.ts` 経由で import します。

### Slash commands

- プロジェクト固有の slash command は `.codex/prompts/` に保存します。
- プロジェクト固有の slash command をグローバル `~/.codex/prompts/` へ置かないでください。

### Mandatory validation

- Codex がファイルを作成または更新した場合、作業完了前に必ず `npm run check` を実行します。
- `npm run check` が失敗した場合、通過するまで修正と再実行を行うか、通過できない理由を明示します。
