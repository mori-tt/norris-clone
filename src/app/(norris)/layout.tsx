export default function NorrisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // フッター/CTAはロケールをpropsで受け取るため各ページ側で描画する
  return <>{children}</>;
}
