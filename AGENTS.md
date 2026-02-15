## Skills

A skill is a set of local instructions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used in this repository.

### Available skills

- github-project-issue-read: Read-only workflow for loading and summarizing GitHub Issues, Milestones, and Projects before implementation planning. (file: /Users/taharakanta/Desktop/kanta_portfolio/.codex/skills/github-project-issue-read/SKILL.md)
- github-project-issue-manage: Idempotent workflow for creating and updating GitHub Issues, Milestones, Labels, and Project items/statuses. (file: /Users/taharakanta/Desktop/kanta_portfolio/.codex/skills/github-project-issue-manage/SKILL.md)

### How to use skills

- Discovery: Skills listed above are available in this repository.
- Trigger rules: Use a skill when the user names it (for example `$github-project-issue-read`) or when the request clearly matches the skill description.
- Missing/blocked: If a skill path cannot be read, report it briefly and continue with the best fallback.
- Progressive disclosure: Read `SKILL.md` first. Load files in `references/` or `scripts/` only when needed.
- Coordination: If both skills are relevant, run read-only skill first, then write skill.
- Writing rule: Keep `SKILL.md` frontmatter (`name`, `description`) in English for stable triggering.
- Writing rule: Write `SKILL.md` body in Japanese.
- Writing rule: Keep command names, identifiers, and error strings in original English form.

### Documentation lookup

- When folder structure or file placement matters, check the `docs` directory as needed.
- Docs-first enforcement:
  - Before creating or moving files under `src/`, read and follow:
    - `docs/file-creation-rules.md`
    - `docs/frontend-architecture.md`
    - `docs/folder-structure.md`
  - If implementation and docs conflict, follow docs and refactor implementation to comply.
  - When adding Server Actions, place them under `_actions/` with `index.ts` export.
  - When adding FE components, create `[ComponentName]/index.ts` and import via `index.ts`.

### Mandatory validation

- When Codex creates or updates any file, it must run `npm run check` before finishing the task.
- If `npm run check` fails, Codex must fix the issues and re-run until it passes, or explicitly report why it cannot pass.
