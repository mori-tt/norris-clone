# norris-clone — 美容クリニック 静的サイト テンプレート

美容クリニック向けのウェブサイトテンプレートです。**すべてのコンテンツを JSON ファイルで管理**しており、文章と画像を差し替えるだけで同構成の別クリニックサイトを量産できます。

- Next.js 16(App Router)+ TypeScript + Tailwind CSS v4
- `output: "export"` で完全静的書き出し → ロリポップ等のレンタルサーバーにそのままアップロード可能
- CMS・DB 不使用。news / コラム / 診療メニュー / 料金 もすべて `content/` 配下の JSON
- JSON は zod で検証。形式を間違えるとビルド時にエラーで止まるため安全

## 開発・ビルド

```bash
npm install
npm run dev        # 開発サーバー (http://localhost:3000)
npm run build      # out/ に静的ファイルを出力
```

## デプロイ(ロリポップ等のレンタルサーバー)

1. `npm run build`
2. `out/` フォルダの**中身をすべて** FTP やファイルマネージャーで公開ディレクトリ(例: `public_html/`)にアップロード
   - `_next/`(CSS・JS)と `images/`、`index.html`、各ページフォルダごとアップする
3. `trailingSlash` 構成のため `/menu/botox/` は `menu/botox/index.html` として出力済み。Apache ではそのまま動作します
4. 404 ページは `out/404.html`。サーバー側で 404 設定を `404.html` に向けると綺麗に動きます

独自ドメインを変えた場合は `content/site.json` の `url` を更新して再ビルド(sitemap.xml / OGP / robots.txt に反映)。

## コンテンツの編集

`content/` 配下の JSON を編集するだけでサイトが更新されます。スキーマ定義は `src/lib/schemas.ts`。

| ファイル | 内容 |
|---|---|
| `site.json` | クリニック名・電話番号・住所・SNS/予約URL・テーマカラー・サイトURL |
| `navigation.json` | ヘッダーナビ。`"dynamicMenu": true` の項目は `menu/*.json` から子メニュー自動生成 |
| `home.json` | ヒーロースライド・「選ばれる理由」・Instagram注記 |
| `clinic.json` | クリニック紹介・設備 |
| `doctor.json` | 院長紹介(経歴・資格・メッセージ) |
| `schedule.json` | 診療時間表・当月カレンダー(休診日は日付の配列で指定) |
| `access.json` | 電車/車でのアクセス、Googleマップ埋め込みURL |
| `fee.json` | 料金一覧(カテゴリ→項目の表) |
| `menu/*.json` | 施術ページ。1ファイル=1ページ (`/menu/<slug>/`)。`kind`: `treatment` / `concern` / `device` / `mens` |
| `news/*.json` | お知らせ記事。1ファイル=1記事 (`/news/<slug>/`) |
| `column/*.json` | コラム記事 (`/column/<slug>/`) |

記事本文(`body`)はブロック配列: `{ "type": "p"|"h2"|"h3"|"ul"|"image"|"link", ... }`。記事の追加は同じ形式の JSON ファイルを増やすだけで、一覧・詳細・sitemap が自動生成されます。

## 画像

- `public/images/` に配置し、JSON から `/images/xxx.jpg` のように参照
- 現在の画像は `npm run placeholders` で再生成できるダミーSVG。実写真(jpg/png/webp)に差し替えてください
- 推奨サイズ: ヒーロー `1600×900`、カード/記事 `1200×800`、院長 `800×1000`、Instagram `800×800`

## 別クリニックサイトの作り方(2通り)

### A. コンテンツだけ差し替え(推奨)

コードは1本のまま、コンテンツディレクトリだけ分けられます:

```bash
sites/
  clinic-a/   # content/ と同じ構造
  clinic-b/
```

```bash
CONTENT_DIR=sites/clinic-a npm run build   # out/ をA院用にリネーム/アップ
CONTENT_DIR=sites/clinic-b npm run build
```

`CONTENT_DIR` は絶対パスでも可。各クリニックの画像は `content/` 側ではなく `public/` 側参照なので、サイトごとに別プロジェクトへコピーするか、`public/` を差し替えてビルドしてください。

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
- 本テンプレートの文言・画像はすべてダミーです。実サイト公開時は自院の素材に置き換えてください
