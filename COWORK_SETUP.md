# Cowork PC セットアップ手順

四柱推命アプリ（React + Vite版）を別PC（Cowork）でも触れるようにする手順。

---

## 1. 必要なソフトを入れる

Cowork PCで以下が入っているか確認：

```bash
git --version
node --version    # v18以上
npm --version
```

入っていなければ：
- **Git for Windows**: https://gitforwindows.org/
- **Node.js LTS**: https://nodejs.org/ja/  （LTS版でOK）

---

## 2. GitHub認証（初回のみ）

```bash
git config --global user.name "wandererharu-sudo"
git config --global user.email "wanderer.haru@gmail.com"
```

push/pullの認証は、ブラウザ経由でGitHubログインを求められたら従う（Git Credential Manager）。
2FAを使っているならPersonal Access Tokenでも可。

---

## 3. リポジトリを clone

メインPCと同じパスにすると混乱が少ない：

```bash
cd C:\Users\wande
git clone https://github.com/wandererharu-sudo/shichusuimei.git shichusuimei
cd shichusuimei
```

> 既に `C:\Users\wande\shichusuimei` がある場合は、別の場所（例：`C:\Users\wande\dev\shichusuimei`）に clone する。

---

## 4. 依存パッケージをインストール

```bash
npm install
```

数分かかる。`node_modules` フォルダが作られる。

---

## 5. 起動して確認

```bash
npm run dev
```

ブラウザで http://localhost:5173/ にアクセス。
パスワード入力画面が出れば成功。

---

## 6. 普段の開発フロー

### Cowork PC で作業を始める時（朝）

```bash
cd C:\Users\wande\shichusuimei
git pull             # メインPCで作業した変更を取り込む
npm run dev          # 開発サーバー起動
```

### Cowork PC で作業を終える時（夜）

```bash
git add .
git commit -m "（やったことを簡潔に）"
git push
```

### メインPC で作業を始める時

```bash
cd C:\Users\wande\shichusuimei
git pull             # Cowork PCで作業した変更を取り込む
```

**ポイント**：作業前に必ず `git pull`、作業後に `git push`。これを守れば両PCで安全に往復できる。

---

## トラブル時

### 「Cowork PCで作業中だけど push 忘れた」
メインPCで作業始める前に、Cowork PCを起動して push してから帰る。
または、メインPCで作業した分を別ブランチで作って後でマージ。

### 「pull したら conflict が出た」
両方で同じファイルを編集した時に発生。Claude Codeに「conflict を解消して」と頼む。

### 「node_modules がデカすぎて push される？」
`.gitignore` に書いてあるので push されない。安心。

---

## デプロイ（GitHub Pages）

- **公開URL**：https://wandererharu-sudo.github.io/shichusuimei/
- **配信中の中身**：このリポジトリ（React + Vite版）の `main` ブランチを `.github/workflows/deploy.yml` で自動ビルドしたもの
- **デプロイ方法**：`main` に push すると GitHub Actions が自動で `npm run build` → `dist/` を Pages に配信
- **旧HTML版（v5/v6）**：同URLに以前は配信されていたが、2026-05-23 以降は React 版に置き換わっている。HTML ソースは `C:\Users\wande\OneDrive\ドキュメント\GitHub\shichusuimei\`（`html-legacy` ブランチ）に退避済み
