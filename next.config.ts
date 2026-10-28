import type { NextConfig } from "next";

// GitHub Pages(プロジェクトページ)用にビルドするときだけ BASE_PATH=/norris-clone を渡す。
// ローカル開発・ロリポップ等のドキュメントルート直アップロード時は空のまま。
const nextConfig: NextConfig = {
  // レンタルサーバー(ロリポップ等)へアップロードするため静的HTMLを出力
  output: "export",
  basePath: process.env.BASE_PATH || "",
  // /menu/botox/ -> out/menu/botox/index.html (Apache がそのまま配信できる形式)
  trailingSlash: true,
  // 画像最適化サーバーを使わない(public/ のファイルをそのまま配信)
  images: { unoptimized: true },
  turbopack: {
    // 親ディレクトリに別プロジェクトの lockfile があるため、root を明示する
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
