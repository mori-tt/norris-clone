type Props = {
  en: string;
  ja: string;
};

/** 「News お知らせ」形式のセクション見出し */
export function SectionHeading({ en, ja }: Props) {
  return (
    <div className="mb-8 text-center">
      <p className="font-serif text-2xl font-semibold tracking-wide text-text md:text-3xl">
        <span className="text-primary-dark">{en}</span>
        <span className="ml-3">{ja}</span>
      </p>
      <div className="mx-auto mt-3 h-px w-12 bg-primary" />
    </div>
  );
}
