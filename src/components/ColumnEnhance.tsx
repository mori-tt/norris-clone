"use client";

import { useEffect } from "react";

/**
 * SWELLテーマ由来のスクレイプHTMLに残る data-onclick フックのうち、
 * 素のDOM操作で再現できるものだけを再接続する。
 * (元サイトのSWELL JSは同梱していないため、これらは死んだUIになっていた)
 * - pageTop: ページトップボタン → スムーズスクロール
 * - tabControl: SWELLタブブロック → aria-selected/aria-hidden の切替
 * toggleSearch/toggleIndex は開く側のトリガーがスクレイプに存在しないため対象外。
 */
export function ColumnEnhance() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-onclick]",
      );
      if (!el) return;
      const action = el.dataset.onclick;

      if (action === "pageTop") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (action === "tabControl") {
        const wrap = el.closest(".swell-block-tab");
        const targetId = el.getAttribute("aria-controls");
        if (!wrap || !targetId) return;
        e.preventDefault();
        wrap
          .querySelectorAll<HTMLElement>('[role="tab"]')
          .forEach((b) =>
            b.setAttribute("aria-selected", String(b === el)),
          );
        const panel = document.getElementById(targetId);
        wrap
          .querySelectorAll<HTMLElement>(".c-tabBody__item")
          .forEach((p) =>
            p.setAttribute("aria-hidden", String(p !== panel)),
          );
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
