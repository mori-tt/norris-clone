"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon } from "./icons";
import type { NavItem } from "@/lib/schemas";
import { CHROME, localePrefix, navLabel, type Locale } from "@/lib/i18n";

type Props = {
  items: NavItem[];
  locale?: Locale;
};

/** SPナビの「メニュー」アイコンから開く全画面メニュー */
export function MobileMenu({ items, locale = "ja" }: Props) {
  const [open, setOpen] = useState(false);
  const chrome = CHROME[locale];
  const prefix = localePrefix(locale);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const renderItems = (list: NavItem[], depth = 0) => (
    <ul className={depth > 0 ? "ml-4 border-l border-[#d7d1c0] pl-3" : ""}>
      {list.map((item, i) => (
        <li key={`${item.label}-${i}`}>
          {item.href ? (
            <Link
              href={item.href.startsWith("/") ? prefix + item.href : item.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium"
            >
              {navLabel(item.label, locale)}
            </Link>
          ) : (
            <p className="pt-3 text-xs font-bold tracking-wider text-[#a08f5d]">
              {navLabel(item.label, locale)}
            </p>
          )}
          {item.children.length > 0 && renderItems(item.children, depth + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <li id="toggle">
      <button
        type="button"
        aria-label={chrome.openMenu}
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/norris/sp_nav05.png" alt={chrome.drawerMenu} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label={chrome.closeMenu}
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-4/5 max-w-xs flex-col overflow-y-auto bg-[#f9f8f4] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-serif text-lg text-[#8e292c]">
                {chrome.drawerMenu}
              </p>
              <button
                type="button"
                aria-label={chrome.closeMenu}
                onClick={() => setOpen(false)}
                className="p-2"
              >
                <CloseIcon />
              </button>
            </div>
            <nav>{renderItems(items)}</nav>
          </div>
        </div>
      )}
    </li>
  );
}
