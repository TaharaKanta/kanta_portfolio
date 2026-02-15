# GitHub 読み取りレシピ

## 1. リポジトリ識別子を特定する

```bash
git remote -v
```

`origin` URL から `<owner>/<repo>` を使う。

## 2. Issue 一覧を取得する

```bash
gh issue list -R <owner>/<repo> --limit 200 --state all \
  --json number,title,state,labels,milestone,assignees,updatedAt,url
```

## 3. 特定 Issue の詳細を取得する

```bash
gh issue view <number> -R <owner>/<repo> \
  --json number,title,body,state,labels,milestone,assignees,comments,url
```

## 4. Label と Milestone 一覧を取得する

```bash
gh label list -R <owner>/<repo> --limit 200 --json name,color,description
gh api repos/<owner>/<repo>/milestones?state=all&per_page=100
```

## 5. Project 一覧を取得する（Projects v2）

```bash
gh project list --owner <owner> --limit 100 --format json
gh project view <project-number> --owner <owner> --format json
gh project field-list <project-number> --owner <owner> --format json
gh project item-list <project-number> --owner <owner> --format json
```

## 6. スコープ不足を切り分ける

```bash
gh auth status
gh auth refresh -s read:project
```

Issue 読み取りが失敗する場合は `repo` スコープを確認する。
