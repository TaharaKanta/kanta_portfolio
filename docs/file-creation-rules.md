# ファイル作成ルール

## 1. 目的

このドキュメントは、「どのようなときに、どのようなファイルを作るか」を統一するためのルールを定義する。

## 2. 作成トリガーと必須ファイル

1. 新しい FE コンポーネントを追加するとき

- `[コンポーネント名]/index.ts` を必ず作成する。
- 必要に応じて `Container.tsx` と `Presentation.tsx` を作成する。

2. UI から切り出すロジックを追加するとき

- `_logics/[ロジック名].ts` を作成する。
- `_logics/index.ts` を必ず作成する。

3. Server Action を追加するとき

- `_actions/[アクション名].ts` を作成する。
- `_actions/index.ts` を必ず作成する。

## 3. フロントエンドコンポーネント詳細

1. 新しい FE コンポーネントを作るときは、`[コンポーネント名]` フォルダを作成する。
2. `[コンポーネント名]` フォルダには必ず `index.ts` を作成する。
3. 他ファイルからの import は `index.ts` 経由で行う。
4. `Container.tsx` と `Presentation.tsx` は必要に応じて作成する。

### 3.1 index.ts の例

```ts
export { Container as CsvButton } from "./Container";
```

## 4. ロジックファイル（\_logics）

1. コンポーネント配下のロジックは `_logics` フォルダに作成する。
2. `_logics` 配下のファイル名は責務が分かる名前にする。
   例: `formatDate.ts`
3. `_logics` フォルダにも `index.ts` を必ず作成する。
4. `_logics` の外部公開は `index.ts` 経由で行う。

## 5. Server Action（\_actions）

1. Server Action は `_actions` フォルダに作成する。
2. `_actions` 配下も `_logics` と同様に `index.ts` を必ず作成する。
3. `_actions` の外部公開は `index.ts` 経由で行う。

## 6. 例（構成イメージ）

```text
src/features/csv-button/CsvButton/
  Container.tsx
  Presentation.tsx
  index.ts
  _logics/
    formatDate.ts
    index.ts
  _actions/
    createCsv.ts
    index.ts
```

## 7. 補足

- コンポーネントの責務分離ルールは `docs/frontend-architecture.md` を参照する。
