"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { asset } from "@/lib/asset";
import { CHROME, type Locale } from "@/lib/i18n";

type Props = {
  locale?: Locale;
};

const BREAKPOINT = 768;

/**
 * 本家サイト script.js と同じSPメニュー動作:
 * - sp_nav05「メニュー」タップ → body直下の #menu_bk(暗幕)を表示し、
 *   #menu-header-nav を top = スクロール量 + #header高 にドロップダウン展開
 * - .has_children の親項目は遷移せずサブメニューをアコーディオン開閉
 * - 末端リンク・#menu_bk クリックで閉じる
 * - スクロールで #sp_nav に .fixed を付与し body に padding-top
 */
export function MobileMenu({ locale = "ja" }: Props) {
  const [open, setOpen] = useState(false);
  const chrome = CHROME[locale];

  // #sp_nav のスクロール追従(本家 script.js の .fixed + body padding-top 相当)
  useEffect(() => {
    const spNav = document.getElementById("sp_nav");
    if (!spNav) return;
    const offsetTop = spNav.offsetTop;
    const onScroll = () => {
      if (window.innerWidth >= BREAKPOINT) {
        spNav.classList.remove("fixed");
        document.body.style.paddingTop = "";
        return;
      }
      const fixed = window.scrollY > offsetTop;
      spNav.classList.toggle("fixed", fixed);
      document.body.style.paddingTop = fixed ? `${spNav.offsetHeight}px` : "";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.style.paddingTop = "";
    };
  }, []);

  // #menu-header-nav のドロップダウン展開(本家と同じ top = スクロール量 + #header高)
  useEffect(() => {
    const menu = document.getElementById("menu-header-nav");
    if (!menu) return;
    if (open) {
      const headerH = document.getElementById("header")?.offsetHeight ?? 0;
      // position:absolute の基準(offsetParent)が親のposition指定で
      // 変わっても正しいドキュメント座標になるよう補正する
      const op = menu.offsetParent as HTMLElement | null;
      const opDocTop = op ? op.getBoundingClientRect().top + window.scrollY : 0;
      menu.style.display = "block";
      menu.style.top = `${window.scrollY + headerH - opDocTop}px`;
    } else {
      menu.style.display = "";
      menu.style.top = "";
      // 開いたサブメニューを閉じて初期状態に戻す
      menu
        .querySelectorAll<HTMLElement>(".sub-menu, .submenu-wrap")
        .forEach((el) => (el.style.display = ""));
    }
  }, [open]);

  // アコーディオン + 末端リンクでメニューを閉じる
  useEffect(() => {
    const menu = document.getElementById("menu-header-nav");
    if (!menu) return;
    const onClick = (e: MouseEvent) => {
      if (window.innerWidth >= BREAKPOINT) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || !menu.contains(a)) return;
      const li = a.parentElement;
      if (
        li?.classList.contains("has_children") &&
        li.querySelector(":scope > a") === a
      ) {
        // 親項目: 遷移せずサブメニューをトグル
        e.preventDefault();
        const sub = a.nextElementSibling as HTMLElement | null;
        if (sub) sub.style.display = sub.style.display === "block" ? "" : "block";
        return;
      }
      if (a.classList.contains("off")) return;
      setOpen(false);
    };
    menu.addEventListener("click", onClick);
    return () => menu.removeEventListener("click", onClick);
  }, []);

  // PC幅になったらリセット
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= BREAKPOINT) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <li id="toggle">
      {open &&
        createPortal(
          <div
            id="menu_bk"
            style={{ display: "block" }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />,
          document.body,
        )}
      <button
        type="button"
        aria-label={open ? chrome.closeMenu : chrome.openMenu}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/images/norris/sp_nav05.png")} alt={chrome.drawerMenu} />
      </button>
    </li>
  );
}
