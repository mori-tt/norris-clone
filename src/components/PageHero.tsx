import Link from "next/link";

type Props = {
  ja: string;
  en?: string;
};

/** 下層ページ共通の見出し帯(under_title.jpg 背景 + パンくず + ヘッダー分の余白) */
export function PageHero({ ja, en }: Props) {
  return (
    <div className="page-offset">
      <div className="page-title">
        <h1 className="page-title-text">
          {ja}
          {en && <span className="block text-sm tracking-[0.2em]">{en}</span>}
        </h1>
      </div>
      <p className="bread">
        <Link href="/">HOME</Link>
        <span className="mx-1">&gt;</span>
        {ja}
      </p>
    </div>
  );
}
