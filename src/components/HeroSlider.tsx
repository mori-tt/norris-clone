"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { HeroCopy } from "@/lib/i18n";

type Slide = {
  image: string;
  imageSp: string;
  alt: string;
  href: string;
};

/** 本家サイトと同じフェードスライダー(3秒・文言は画像焼き込み) */
export function HeroSlider({
  slides,
  copy,
}: {
  slides: Slide[];
  /** スライド画像の焼き込み日本語を覆う翻訳コピー(en/zh のみ) */
  copy?: HeroCopy[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      3000,
    );
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="mainimage">
      {slides.map((s, i) => {
        const pic = (
          <picture>
            {s.imageSp && (
              <source media="(max-width: 767px)" srcSet={s.imageSp} />
            )}
            { }
            <img src={s.image} alt={s.alt} />
          </picture>
        );
        const c = copy?.[i];
        return (
          <div
            key={s.image}
            className={`slide ${i === index ? "active" : ""}`}
            aria-hidden={i !== index}
          >
            {s.href ? <Link href={s.href}>{pic}</Link> : pic}
            {c && (
              <div className={`slide-copy pos-${c.pos}`} aria-hidden="true">
                <p className="slide-copy-title">{c.title}</p>
                {c.sub && <p className="slide-copy-sub">{c.sub}</p>}
                {c.bullets && (
                  <ul
                    className={`slide-copy-bullets${c.solidBullets ? " solid" : ""}`}
                  >
                    {c.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
