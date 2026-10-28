import Image from "next/image";
import Link from "next/link";
import type { MenuItem } from "@/lib/schemas";

export function MenuCard({ item }: { item: MenuItem }) {
  return (
    <Link
      href={`/menu/${item.slug}/`}
      className="group block overflow-hidden rounded border border-accent/60 bg-white transition-shadow hover:shadow-md"
    >
      {item.image && (
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <p className="font-serif font-semibold group-hover:text-primary-dark">
          {item.name}
          {item.nameEn && (
            <span className="ml-2 text-[10px] font-normal tracking-widest text-text/50">
              {item.nameEn}
            </span>
          )}
        </p>
        {item.catchcopy && (
          <p className="mt-1 text-xs leading-relaxed text-text/70">
            {item.catchcopy}
          </p>
        )}
      </div>
    </Link>
  );
}
