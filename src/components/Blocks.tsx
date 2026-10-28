import Image from "next/image";
import Link from "next/link";
import type { Block } from "@/lib/schemas";

/** content JSON の body ブロックを描画する */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-clinic space-y-4">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i}>{b.text}</p>;
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
          case "h3":
            return <h3 key={i}>{b.text}</h3>;
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1 pl-6">
                {b.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "image":
            return (
              <figure key={i} className="relative aspect-[3/2] overflow-hidden rounded">
                <Image
                  src={b.src}
                  alt={b.alt}
                  fill
                  sizes="(max-width:768px) 100vw, 768px"
                  className="object-cover"
                />
              </figure>
            );
          case "html":
            // 自前の .md / CMS コンテンツ前提のためサニタイズは行わない
            return (
              <div
                key={i}
                dangerouslySetInnerHTML={{ __html: b.html }}
              />
            );
          case "link":
            return b.external ? (
              <p key={i}>
                <a
                  href={b.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-dark underline"
                >
                  {b.text}
                </a>
              </p>
            ) : (
              <p key={i}>
                <Link href={b.href} className="text-primary-dark underline">
                  {b.text}
                </Link>
              </p>
            );
        }
      })}
    </div>
  );
}
