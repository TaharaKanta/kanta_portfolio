# フロントエンド設計方針（Container/Presentation）

## 1. 方針

このプロジェクトのフロントエンドは `Container/Presentation` パターンを採用する。
UI の描画責務と、データ取得・状態管理・ユースケース実行責務を分離し、保守性とテスト容易性を高める。

## 2. 役割定義

### Container

- データ取得（API 呼び出し、Server Action 呼び出し）
- 状態管理（画面状態、フォーム状態、ローディング/エラー）
- ドメインロジック呼び出し（計算モジュールなど）
- Presentation へ渡す Props の組み立て

### Presentation

- 受け取った Props に基づく描画
- ユーザー操作イベントの発火（`onClick` など）
- 表示ロジック（条件表示、スタイル適用）

## 3. 実装ルール

1. API 呼び出しや副作用は Container 側に置く。
2. Presentation は外部 API やグローバルストアに直接依存しない。
3. Presentation は可能な限り純粋関数コンポーネントとして実装する。
4. 画面固有のロジックが増えた場合は、Container 配下にカスタム Hook として切り出す。
5. Props 型は明示し、Presentation の入出力契約を固定する。

## 4. ディレクトリ例

```text
src/features/simulation/SimulationPanel/
  Container.tsx
  Presentation.tsx
  index.ts
  _logics/
    useSimulationForm.ts
    buildChartData.ts
    index.ts
  _actions/
    fetchHistoricalPrices.ts
    index.ts
```

## 5. テスト方針

- Container: データ取得・状態遷移・イベントハンドラの振る舞いをテストする。
- Presentation: 与えられた Props に対する描画結果をテストする。
- テストファイルは対象ファイルと同じディレクトリに `*.test.ts` / `*.test.tsx` で作成する。

## 6. 例外ルール

小さな UI で責務分離のコストが高い場合は 1 ファイルに同居してよい。
ただし、データ取得または複雑な状態管理が入った時点で分離する。

## 7. 関連ドキュメント

- ファイル作成ルール:
  `docs/file-creation-rules.md`
- フォルダ構成ガイド:
  `docs/folder-structure.md`
