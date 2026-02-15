# GitHub 更新レシピ

## 1. Label を upsert する

```bash
gh label create <name> -R <owner>/<repo> --color <hex> --description "<desc>" \
  || gh label edit <name> -R <owner>/<repo> --color <hex> --description "<desc>"
```

## 2. title 重複を避けて Issue を作成する

```bash
if gh issue list -R <owner>/<repo> --state all --search "<title> in:title" \
  --json title --jq '.[].title' | grep -Fxq "<title>"; then
  echo "SKIP"
else
  gh issue create -R <owner>/<repo> --title "<title>" --body-file <file> --label enhancement
fi
```

## 3. Milestone を upsert して Issue に紐づける

```bash
gh api repos/<owner>/<repo>/milestones?state=all&per_page=100 \
  --jq '.[] | select(.title=="<milestone-title>") | .number'

gh api repos/<owner>/<repo>/milestones -X POST \
  -f title="<milestone-title>" -f description="<desc>"

gh issue edit <number> -R <owner>/<repo> --milestone "<milestone-title>"
```

## 4. Project メタデータを更新する

```bash
gh project edit <project-number> --owner <owner> \
  --title "<title>" --description "<desc>" --readme "<markdown>"
```

## 5. Issue を Project に追加して status を設定する

```bash
gh project item-add <project-number> --owner <owner> \
  --url https://github.com/<owner>/<repo>/issues/<number>

gh project item-edit \
  --id <item-id> \
  --project-id <project-id> \
  --field-id <status-field-id> \
  --single-select-option-id <todo-option-id>
```

## 6. スコープ不足を切り分ける

```bash
gh auth status
gh auth refresh -s project,read:project
```
