# norris-clone — 美容クリニック 静的サイト テンプレート

美容クリニック向けのウェブサイトテンプレートです。コンテンツは **JSON と Markdown で管理**しており、文章と画像を差し替えるだけで同構成の別クリニックサイトを量産できます。

- Next.js 16(App Router)+ TypeScript + Tailwind CSS v4
- `output: "export"` で完全静的書き出し → ロリポップ等のレンタルサーバーにそのままアップロード可能
- 記事・診療メニューは **Markdown ファイル**、サイト設定・料金等は **JSON** で管理
- **3つの編集方法**を用意: ①ファイルを直接編集 ②ローカル管理画面(Decap CMS)③ヘッドレスCMS(microCMS/Newt)
- JSON/frontmatter は zod で検証。形式を間違えるとビルド時にエラーで止まるため安全

## 開発・ビルド

```bash
npm install
npm run dev        # 開発サーバー (http://localhost:3000)
npm run build      # out/ に静的ファイルを出力
npm run lint       # ESLint
npm run cms        # Decap CMS ローカルプロキシ(:8081)
```

## デプロイ(ロリポップ等のレンタルサーバー)

1. `npm run build`
2. `out/` フォルダの**中身をすべて** FTP やファイルマネージャーで公開ディレクトリ(例: `public_html/`)にアップロード
   - `_next/`(CSS・JS)と `images/`、`index.html`、各ページフォルダごとアップする
3. `trailingSlash` 構成のため `/menu/botox/` は `menu/botox/index.html` として出力済み。Apache ではそのまま動作します
4. 404 ページは `out/404.html`。サーバー側で 404 設定を `404.html` に向けると綺麗に動きます

独自ドメインを変えた場合は `content/site.json` の `url` を更新して再ビルド(sitemap.xml / OGP / robots.txt に反映)。

## コンテンツの編集

### 1. ファイルを直接編集(基本)

`content/` 配下のファイルを編集するだけでサイトが更新されます。スキーマ定義は `src/lib/schemas.ts`。

**単一ファイル(JSON)**

| ファイル | 内容 |
|---|---|
| `site.json` | クリニック名・電話番号・住所・SNS/予約URL・テーマカラー・サイトURL |
| `navigation.json` | ヘッダーナビ。`"dynamicMenu": true` の項目は `menu/` から子メニュー自動生成 |
| `home.json` | ヒーロースライド・「選ばれる理由」・Instagram注記 |
| `clinic.json` | クリニック紹介・設備 |
| `doctor.json` | 院長紹介(経歴・資格・メッセージ) |
| `schedule.json` | 診療時間表・当月カレンダー(休診日は日付の配列で指定) |
| `access.json` | 電車/車でのアクセス、Googleマップ埋め込みURL |
| `fee.json` | 料金一覧(カテゴリ→項目の表) |

**1ファイル=1ページ(Markdown + frontmatter)**

| ディレクトリ | 内容 | パス |
|---|---|---|
| `menu/*.md` | 施術ページ | `/menu/<slug>/` |
| `news/*.md` | お知らせ記事 | `/news/<slug>/` |
| `column/*.md` | コラム記事 | `/column/<slug>/` |

`menu/*.md` の frontmatter 例(`kind`: `treatment` / `concern` / `device` / `mens`):

```md
---
slug: botox
name: ボトックス注射
kind: treatment
image: /images/menu-1.svg
features: ["施術時間:約10分"]
related: [hyaluronic, hifu]
order: 1
---

本文は普通に Markdown で書けます。## 見出しや - 箇条書き も使えます。
```

記事・メニューの追加は `.md` ファイルを増やすだけで、一覧・詳細・sitemap が自動生成されます(`.json` 形式のファイルも併用可能です)。

### 2. ローカル管理画面(Decap CMS)

非エンジニアでもブラウザの管理画面から編集できます。Gitプロキシが `content/` のファイルを直接書き換えるため、外部サービスへの登録は不要です。

```bash
# ターミナル1
npm run dev        # または静的サーバー
# ターミナル2
npm run cms        # decap-server を :8081 で起動
```

`http://localhost:3000/admin/` を開くと管理画面が表示され、お知らせ・コラム・メニュー・サイト設定をフォームで編集できます。保存すると `content/` 内のファイルが更新されるので、確認後 `npm run build` → アップロード。

※ 公開済みサイト上の `/admin/` にはバックエンドが無いためログインできません(ローカル専用として運用してください)。
※ `decap-server` はローカル開発ツールです。依存パッケージに既知の脆弱性がありますが、公開物(`out/`)には含まれません。

### 3. ヘッドレスCMS(microCMS / Newt)

環境変数を設定すると、ビルド時に外部CMSの記事をローカルの `news`/`column` にマージします(同slugはCMS優先)。クリニック側がブラウザから記事を書き、手元で `npm run build` してアップする運用が可能です。

```bash
# microCMS の場合
MICROCMS_SERVICE_DOMAIN=xxxx \
MICROCMS_API_KEY=xxxx \
MICROCMS_NEWS_ENDPOINT=news \
MICROCMS_COLUMN_ENDPOINT=column \
npm run build

# Newt の場合
NEWT_SPACE_UID=xxx NEWT_APP_UID=xxx NEWT_TOKEN=xxx npm run build
```

想定フィールド: `title`(text), `slug`(text,省略時はID), `date`(date), `category`(text/select), `image`(image), `excerpt`(text), `body`(リッチテキスト)。設定は `src/lib/external-cms.ts`。

## 画像

- `public/images/` に配置し、content から `/images/xxx.jpg` のように参照
- 現在の画像は `npm run placeholders` で再生成できるダミーSVG。実写真(jpg/png/webp)に差し替えてください
- 推奨サイズ: ヒーロー `1600×900`、カード/記事 `1200×800`、院長 `800×1000`、Instagram `800×800`

## 別クリニックサイトの作り方(2通り)

### A. コンテンツだけ差し替え(推奨)

コードは1本のまま、コンテンツディレクトリだけ分けられます:

```bash
CONTENT_DIR=sites/clinic-a npm run build   # out/ をA院用にリネーム/アップ
CONTENT_DIR=sites/clinic-b npm run build
```

`CONTENT_DIR` は絶対パスでも可。画像は `public/` 側参照なので、サイトごとにプロジェクトをコピーするか `public/` を差し替えてビルドしてください。

### B. プロジェクトごと複製

フォルダを丸ごとコピーして `content/` と `public/images/` を差し替えるだけ。テーマカラーは `site.json` の `theme` を変えるだけで全ページに反映されます。

## フォーム・予約について

静的サイトのため問い合わせフォームは動作しません。以下のいずれかを `site.json` の `contactUrl` / `reserveUrl` に設定してください。

- 予約システム(STORES予約、LINE予約等)の公開URL
- Googleフォーム等の外部フォーム
- レンタルサーバーのPHPメールフォームを別途設置してリンク

## 注意点・制約

- 診療カレンダーは `schedule.json` の手動更新(月替わりで日付配列を編集)
- Instagram セクションは固定画像+プロフィールリンク(リアルタイムフィードではありません)
- Markdown・CMS 由来の本文HTMLはサニタイズしていません(自前コンテンツ前提)。外部入力を受け付ける場合は `src/components/Blocks.tsx` にサニタイザを導入してください
- 本テンプレートの文言・画像はすべてダミーです。実サイト公開時は自院の素材に置き換えてください
