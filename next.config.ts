import type { NextConfig } from "next";

// GitHub Pages(プロジェクトページ)用にビルドするときだけ BASE_PATH=/norris-clone を渡す。
// ローカル開発・ロリポップ等のドキュメントルート直アップロード時は空のまま。
const basePath = process.env.BASE_PATH || "";
// クライアント側コンポーネントが img/link 等の素のsrcを組み立てるのに使う
// (静的HTMLのパスは scripts/fix-base-path.mjs が後処理で付与するが、
//  ハイドレーション/プリロードヒント等のランタイム生成分はこちらが必要)
process.env.NEXT_PUBLIC_BASE_PATH = basePath;
const nextConfig: NextConfig = {
  // レンタルサーバー(ロリポップ等)へアップロードするため静的HTMLを出力
  output: "export",
  basePath,
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
