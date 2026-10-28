"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = { image: string; title: string; subtitle: string };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000,
    );
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="relative h-[60vh] min-h-[420px] overflow-hidden md:h-[70vh]">
      {slides.map((s, i) => (
        <div
          key={s.image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-6 text-center text-white">
              <h1 className="font-serif text-2xl font-semibold tracking-wide drop-shadow md:text-4xl">
                {s.title}
              </h1>
              {s.subtitle && (
                <p className="mt-4 text-sm tracking-wider drop-shadow md:text-base">
                  {s.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.image}
              type="button"
              aria-label={`スライド${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
