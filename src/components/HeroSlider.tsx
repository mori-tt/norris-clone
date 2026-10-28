"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Slide = {
  image: string;
  imageSp: string;
  alt: string;
  href: string;
};

/** 本家サイトと同じフェードスライダー(3秒・文言は画像焼き込み) */
export function HeroSlider({ slides }: { slides: Slide[] }) {
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
        return (
          <div
            key={s.image}
            className={`slide ${i === index ? "active" : ""}`}
            aria-hidden={i !== index}
          >
            {s.href ? <Link href={s.href}>{pic}</Link> : pic}
          </div>
        );
      })}
    </div>
  );
}
