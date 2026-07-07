# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要
四柱推命（東洋占術）の鑑定アプリ。生年月日から命式を算出し、運勢を分析する。
エスサイクル設計株式会社の代表（はるさん）が個人で開発・使用。

## 技術スタック
- React 19 + Vite 7 のSPA
- 全ロジックが `src/App.jsx`（約3000行）に集約
- 外部ライブラリなし（計算ロジックはすべて自前実装）
- データ保存：localStorage / sessionStorage

## コマンド
- `npm run dev` — 開発サーバー起動（localhost:5173）
- `npm run build` — 本番ビルド（dist/に出力）
- `npm run lint` — ESLintチェック
- `npm run preview` — ビルド結果のプレビュー

## デプロイ
- GitHub Pages: https://wandererharu-sudo.github.io/shichusuimei/
- ローカルリポジトリ（React版・正）: `C:\Users\wande\shichusuimei\`
- 旧HTML版（v5/v6）: `C:\Users\wande\OneDrive\ドキュメント\GitHub\shichusuimei\`（`html-legacy` ブランチ・退避済み）
- 公開URLは 2026-05-23 以降 React 版に置き換わっており、HTML 版は同URLでは配信していない

## クラウド同期（2026-07-07 追加）
- `src/sync.js` — GitHub非公開リポジトリ `wandererharu-sudo/shichusuimei-data` の `data.json` と自動同期
- 同期対象：`shichuPersons`（保存リスト）／`shichusuimei_memo_*`（人生メモ）／`shichusuimei_children_*`（家族）
- トークンは端末ごとに localStorage（`shichusuimei_gh_token`）へ保存。コードには書かない
- 動き：起動時・タブ復帰時に pull ／ 対象キーへの書き込み3秒後に自動 push ／ 初回は「データを持つ端末側が正」／ 未送信修正がある端末は push 優先（後勝ち）
- 設定UI：保存リストタブの「☁ 同期設定」（SyncBar コンポーネント）

## App.jsx の構造（上から順）

### 定数・データテーブル（1〜55行）
- 天干（STEMS）、地支（BRANCHES）、五行、蔵干、節入り日など
- 十二運の説明テキスト
- 干合・六合・冲の対応表

### 計算関数（56〜300行）
- `calcYear/calcMonth/calcDay/calcHour` — 年柱・月柱・日柱・時柱の算出
- `getTsuhen` — 通変星の算出
- `getJunishi` — 十二運の算出
- `calcDaiun` — 大運の算出
- `calcRyunen` — 流年の算出
- `calcYoujin` — 用神の判定
- `calcShinSatsu` — 神殺の判定
- `calcAll` — 上記すべてを統合して命式を算出

### 保存・データ管理（305〜320行）
- localStorage に鑑定結果を保存・読み込み
- `savePerson` — 鑑定結果を保存リストに追加

### UIコンポーネント（323〜2655行）
- `GogyouCompare` — 五行比較グラフ（複数人比較）
- `SavedListTab` — 保存リスト管理画面
- `GogyouCircle` — 五行円グラフ（五角形レーダー）
- `MeishikiTable` — 命式表（年柱・月柱・日柱・時柱）
- `DaiunTableH` — 大運テーブル（横型）
- `RyunenTableH` — 流年テーブル（横型）
- `TsuhenJunishiSection` — 通変星・十二運の解説
- `FamilyMeishikiModal` — 家族の命式モーダル
- `AgeMemoSection` — 年齢メモセクション

### Appコンポーネント（2656〜末尾）
- パスワード認証（sessionStorage）
- URLパラメータからの入力受付
- メイン画面のレイアウト

## セキュリティ
- パスワード認証あり（sessionStorageで管理）
- APIキー・パスワードをコードに直接書かない（環境変数を使う）

## 参考ドキュメント
- 用語集・変数対応表: `docs/glossary.md`

## 注意点
- 四柱推命の計算ロジックは天文学的な計算を含むため、変更時は慎重にテストすること
- 節入り日（SETSU）は簡易版。厳密な計算とは若干のずれがある
- 朝の学びアプリ（morning_3.html）から四柱推命アプリへの連携機能あり（URLパラメータ経由）
