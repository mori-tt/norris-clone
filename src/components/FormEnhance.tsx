"use client";

import { useEffect } from "react";

/**
 * スクレイプしたCF7フォーム(静的HTML)を contact.php と連携させる。
 * - started_at に送信開始時刻を埋める(サーバー側の高速送信チェック用)
 * - contact.php が ?sent=1 / ?error=1 付きでリダイレクトしてきたとき、
 *   CF7 と同じ要領でフォームに sent/failed クラスを付けて結果を表示する
 */
export function FormEnhance() {
  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("form.wpcf7-form");
    if (!form) return;
    const started = form.querySelector<HTMLInputElement>(
      'input[name="started_at"]',
    );
    if (started) started.value = String(Date.now());

    const params = new URLSearchParams(window.location.search);
    const output = form.querySelector<HTMLElement>(
      ".wpcf7-response-output",
    );
    if (!output) return;
    if (params.get("sent") === "1") {
      form.classList.remove("init");
      form.classList.add("sent");
      output.removeAttribute("aria-hidden");
      output.textContent =
        "送信ありがとうございました。確認の上、クリニックよりご連絡いたします。";
    } else if (params.get("error") === "1") {
      form.classList.remove("init");
      form.classList.add("failed");
      output.removeAttribute("aria-hidden");
      output.textContent =
        "送信できませんでした。入力内容をご確認の上、時間を置いて再度お試しください。";
    }
  }, []);
  return null;
}
