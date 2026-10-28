"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";
import type { NavItem } from "@/lib/schemas";

type Props = {
  items: NavItem[];
  tel: string;
  reserveUrl: string;
};

export function MobileMenu({ items, tel, reserveUrl }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const renderItems = (list: NavItem[], depth = 0) => (
    <ul className={depth > 0 ? "ml-4 border-l border-accent/60 pl-3" : ""}>
      {list.map((item, i) => (
        <li key={`${item.label}-${i}`}>
          {item.href ? (
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <p className="pt-3 text-xs font-bold tracking-wider text-primary-dark">
              {item.label}
            </p>
          )}
          {item.children.length > 0 && renderItems(item.children, depth + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <button
        type="button"
        aria-label="メニューを開く"
        onClick={() => setOpen(true)}
        className="p-2 md:hidden"
      >
        <MenuIcon />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-4/5 max-w-xs flex-col overflow-y-auto bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-serif text-lg">メニュー</p>
              <button
                type="button"
                aria-label="閉じる"
                onClick={() => setOpen(false)}
                className="p-2"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mb-4 flex gap-2">
              <a
                href={`tel:${tel.replaceAll("-", "")}`}
                className="flex flex-1 items-center justify-center gap-1 rounded bg-primary px-3 py-2.5 text-sm text-white"
              >
                <PhoneIcon /> 電話
              </a>
              {reserveUrl && (
                <a
                  href={reserveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1 rounded border border-primary px-3 py-2.5 text-sm text-primary-dark"
                >
                  WEB予約
                </a>
              )}
            </div>
            <nav>{renderItems(items)}</nav>
          </div>
        </div>
      )}
    </>
  );
}
