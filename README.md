# norris-clone — 美容クリニック 静的サイト(Next.js)

https://www.norris-beauty-clinic.com の**全ページ完全クローン**を Next.js + TypeScript で静的生成したプロジェクトです。下層ページは本家HTMLをスクレイプして `content/pages/` に保存し、そのまま静的描画するため、UI/UX・文言・画像が本家と一致します。

- Next.js 16(App Router)+ TypeScript + Tailwind CSS v4
- `output: "export"` で完全静的書き出し → ロリポップ等のレンタルサーバーにそのままアップロード可能
- **141ルート**を静的生成(下層ページ ~120 + `/column/` SWELLサブサイト 14 + TOP + 404 等)
- 本家テーマCSS(`common.css`/`style.css`/`index.css`→ `src/app/norris.css`)+ SWELLテーマCSS(`public/swell/`)を取り込み済み
- TOPページと共有パーツ(ヘッダー/フッター/CTA)は `content/*.json` で管理し差し替え可能

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
2. `out/` フォルダの**中身をすべて** 公開ディレクトリにアップロード
   - `_next/`、`images/`、`swell/`、`index.html`、各ページフォルダごと
3. `trailingSlash` 構成のため `/botox/` は `botox/index.html` として出力済み
4. 404 ページは `out/404.html`

独自ドメインを変えた場合は `content/site.json` の `url` を更新して再ビルド(sitemap.xml / robots.txt に反映)。

## ディレクトリ構成とページの生成方法

```
content/pages/<path>/index.json   # スクレイプ済みページ(全下層ページ)
  → src/app/(norris)/[...slug]/   # キャッチオールで /access/ /botox/ 等を描画
  → src/app/column/[[...slug]]/   # /column/ サブサイト(SWELLテーマ)を別レイアウトで描画

content/*.json                    # 共有設定(サイト情報・ナビ・TOPセクション)
public/images/norris/             # 本家テーマ画像 + uploads/(本文画像 782件)
public/swell/                     # /column/ 用SWELLテーマ CSS・フォント
src/app/norris.css                # 本家 common.css+style.css+index.css(body→.pbody変換済み)
```

### スクレイプ済みページの仕組み

`scripts/scrape-norris-pages.mjs` が本家サイトマップの全URLを巡回し、各ページから以下を抽出して `content/pages/<path>/index.json` に保存します:

- `.header_title` テキスト(ヘッダーH1用)、`title`、パンくず
- `.page-title` 帯、`#main` の class と innerHTML
- `body` の class(`page-name-botox` 等。ページ別配色に必須)
- 本文内画像のDL(`public/images/norris/uploads/`)+ URL書き換え、内部リンクの相対化

`/column/` 配下は別WordPress(SWELLテーマ)のため body 全体 + インライン `<style>` を `layout:"swell"` で保存し、専用ルートで SWELL CSS と共に描画します。

```bash
node scripts/scrape-norris-pages.mjs   # 再スクレイプ(画像は既存ならDLスキップ)
```

### コンテンツ編集(content/*.json)

| ファイル | 内容 |
|---|---|
| `site.json` | クリニック名・電話番号・住所・SNS/予約URL・テーマカラー・サイトURL |
| `navigation.json` | PCヘッダーナビ(メガメニュー3列含む)・SPナビ |
| `home.json` | TOPのヒーロースライド・各セクション文言・カード・リンク |
| `news/*.md` | TOP「お知らせ」一覧の最新3件(slug=実記事ID `/news/<id>/`) |

※ 下層ページ(施術・料金・アクセス・記事等)は `content/pages/` のスクレイプJSONが直接描画します。文言差し替えは各 `index.json` の `html` を編集するか、別クリニック用には scraper を別サイト向けに改造してください。

## 画像・アセットの権利(重要)

`public/images/norris/` 配下の画像・`content/pages/` の文言は **https://www.norris-beauty-clinic.com から取得したもの**で、著作権・肖像権はノリスクリニックおよび各権利者に帰属します。

- このリポジトリをそのまま公開サイトとして運用・転用することは想定していません
- 別クリニックのサイトを作る場合は画像・文言を自院の素材に差し替えてください

```bash
node scripts/fetch-norris-assets.mjs    # テーマ画像を再取得
node scripts/scrape-norris-pages.mjs    # ページ本文+画像を再取得
```

## 注意点・制約

- 本家由来のデッドリンク(`/liftup/` 等)は本家と同じく404になります
- `script/iframe/noscript/onclick` はスクレイプ時に除去済み(GTM・予約JS等は含まれません)
- `/contact/` `/reserve/` のフォームは PHP 必須のレンタルサーバー向けに `public/contact.php` 経由で送信できます(下記「フォーム送信」参照)。PHP が無い環境では投稿は `?error=1` にリダイレクトされます

## フォーム送信(contact.php)

静的書き出しのままフォーム送信を動かすため、PHP製の受付エンドポイントを同梱しています(ロリポップ等のPHP可レンタルサーバー前提)。

- `out/contact.php` — `/contact/`・`/reserve/` のフォームがPOSTする受付。urlencoded POST・JSON POST 両対応。成功/失敗で `?sent=1`/`?error=1` へリダイレクト
- `out/phpmailer/` — 同梱PHPMailer。Composer無し・FTPのみでも動作
- `deploy/contact-config.example.php` — 設定テンプレート。**`contact-config.php` としてコピーし、公開フォルダの外**(例: 公開フォルダが `~/web/example.com/` なら `~/contact-config.php`)に置いて値を設定する
  - `CONTACT_TO_EMAIL`/`CONTACT_FROM_EMAIL` は必須。SMTPはロリポップ既定(`smtp.lolipop.jp:465 ssl`)
  - `CONTACT_ALLOWED_ORIGINS` に本番ドメインを設定すると他ドメインからのPOSTを拒否
  - 環境変数 `CONTACT_CONFIG_FILE` で配置パスを変更可能
- スパム対策: ハニーポット(`website`)、送信開始から2.5秒未満の投稿、リンク3件超の投稿は「成功を装い破棄」、IP毎レート制限(既定5件/10分)
- サーバーがPHPを実行しない環境(GitHub Pages等)ではフォーム送信は動作しません
- スクレイプHTML・Markdown由来の本文はサニタイズしていません(自前コンテンツ前提)
- Turbopack は稀に古いCSSをキャッシュします。見た目が変わらない場合は `rm -rf .next out && npm run build`
- `decap-server` はローカル開発ツールです(公開物には含まれません)
