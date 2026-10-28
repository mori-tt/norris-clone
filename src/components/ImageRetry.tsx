"use client";

import { useEffect } from "react";

const MAX_RETRY = 3;
const DELAYS = [4000, 8000, 15000];

/**
 * GitHub Pages デプロイ直後の CDN 伝播遅延で画像が一時的に 404 になるのを
 * 自動リトライで回復させる。エラーになった img を遅延してキャッシュバスター
 * 付きで再読み込みする(最大 MAX_RETRY 回)。
 */
export function ImageRetry() {
  useEffect(() => {
    const retry = (img: HTMLImageElement) => {
      const n = Number(img.dataset.retry ?? 0);
      if (n >= MAX_RETRY) return;
      img.dataset.retry = String(n + 1);
      const src = img.getAttribute("src") ?? img.src;
      if (!src) return;
      setTimeout(() => {
        const sep = src.includes("?") ? "&" : "?";
        img.src = `${src}${sep}retry=${Date.now()}`;
      }, DELAYS[Math.min(n, DELAYS.length - 1)]);
    };

    const onError = (e: Event) => {
      if (e.target instanceof HTMLImageElement) retry(e.target);
    };
    // img の error イベントはバブルしないためキャプチャで捕捉
    document.addEventListener("error", onError, true);

    // ハイドレーション前に既に失敗している画像も拾う
    document.querySelectorAll("img").forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.src) retry(img);
    });

    return () => document.removeEventListener("error", onError, true);
  }, []);
  return null;
}
