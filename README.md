# kanta_portfolio

投資ポートフォリオのシミュレーションを行う Web アプリケーションです。  
株式・コモディティ・ETF・暗号資産・FX の市場データを使い、配分、手数料、税金、通貨換算、リバランス条件に基づいて資産推移を検証できます。

## 主な機能（MVP）

- 対象資産: 株式 / コモディティ / ETF / 暗号資産 / FX
- 期間指定バックテスト
- リバランス（月初実行）
- 手数料（固定）と税金（譲渡益 + 配当、固定税率入力）の反映
- 基準通貨切り替え（JPY / USD / EUR）
- 資産推移と主要指標の可視化
- OAuth ログイン
- ポートフォリオ条件の保存・再利用

## 技術スタック

- Next.js
- React
- TypeScript
- ESLint
- Vitest

## フロントエンド設計方針

- Container/Presentation パターンを採用
- 詳細: `docs/frontend-architecture.md`

## 開発環境セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認します。

## 利用可能なスクリプト

```bash
npm run dev    # 開発サーバー
npm run build  # 本番ビルド
npm run start  # 本番起動
npm run lint   # Lint
npm run lint:fix # Lint自動修正
npm run typecheck # TypeScript型チェック
npm run check  # 型チェック + Lint
npm run refactor # リファクタ（lint修正 + format）
npm run spell  # スペルチェック
npm run format # Prettierで整形
npm run format:check   # Prettierチェック
npm run test   # テスト実行
npm run test:watch      # テスト監視実行
npm run test:coverage   # カバレッジ付き実行
```

`docs/` 配下に変更があるコミットでは、pre-commit フックで `npm run refactor` が自動実行されます。

## ドキュメント

- 仕様書: `docs/project-spec.md`
- FE 設計方針: `docs/frontend-architecture.md`
- フォルダ構成ガイド: `docs/folder-structure.md`
- ファイル作成ルール: `docs/file-creation-rules.md`
