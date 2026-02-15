# フォルダ構成ガイド

## 1. 目的

このドキュメントは、リポジトリ内のフォルダ構成と配置ルールを一元管理するためのガイドです。

## 2. 現在の主要構成

```text
src/
  app/        # Next.js App Router
  features/   # 機能単位の UI/ロジック
  server/     # 外部API連携・サーバー専用処理
  test/       # テスト共通セットアップ
docs/         # 仕様・設計・運用ドキュメント
public/       # 静的アセット
```

## 3. 高レベル配置ルール

1. 外部 API とのやりとりに関するファイルは `src/server` 配下に作成する。
   例: `src/server/fmp.ts`
2. API キーを扱う処理はサーバー側に限定し、クライアントコンポーネントに置かない。
3. 機能実装は `src/features` 配下に機能単位で配置する。

## 4. 関連ドキュメント

- ファイルの作り方・命名・`index.ts` 運用:
  `docs/file-creation-rules.md`
- Container/Presentation の役割分離:
  `docs/frontend-architecture.md`

## 5. 更新ルール

フォルダ構成や配置ルールを変更した場合は、このファイルを先に更新してから実装に反映する。
