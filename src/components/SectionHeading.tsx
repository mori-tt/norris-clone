type Props = {
  ja: string;
  /** 透かし英字の背景画像(txt_*.png) */
  ghost?: "menu" | "machine" | "features" | "greeting" | "treatment" | "";
};

/** 本家 h2.ttl 形式のセクション見出し(NBCエンブレム + 透かし英字) */
export function SectionHeading({ ja, ghost = "" }: Props) {
  return (
    <h2 className={`ttl${ghost ? ` ghost-${ghost}` : ""}`}>{ja}</h2>
  );
}
