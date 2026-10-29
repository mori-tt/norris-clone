"use client";

import { useEffect } from "react";
import { FORM_RESULT, FORM_TEL, splitLocalePath } from "@/lib/i18n";

/**
 * スクレイプしたCF7フォーム(静的HTML)を contact.php と連携させる。
 * - started_at に送信開始時刻を埋める(サーバー側の高速送信チェック用)
 * - contact.php が ?sent=1 / ?error=1 付きでリダイレクトしてきたとき、
 *   CF7 と同じ要領でフォームに sent/failed クラスを付けて結果を表示する
 * - メッセージは /en|zh プレフィックスから言語を判定して出し分ける
 * - contact.php が実行できない静的ホスト(GitHub Pages等)では
 *   送信をインターセプトして電話連絡へ誘導する(405/404で壊れないように)
 */
export function FormEnhance() {
  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("form.wpcf7-form");
    if (!form) return;
    const started = form.querySelector<HTMLInputElement>(
      'input[name="started_at"]',
    );
    if (started) started.value = String(Date.now());

    const { locale } = splitLocalePath(window.location.pathname);
    const params = new URLSearchParams(window.location.search);
    const output = form.querySelector<HTMLElement>(
      ".wpcf7-response-output",
    );

    const telLink = () => {
      const a = document.createElement("a");
      a.href = `tel:${FORM_TEL.replaceAll("-", "")}`;
      a.textContent = FORM_TEL;
      return a;
    };
    const showResult = (kind: keyof typeof FORM_RESULT) => {
      if (!output) return;
      form.classList.remove("init");
      form.classList.add(kind === "sent" ? "sent" : "failed");
      output.removeAttribute("aria-hidden");
      output.textContent = FORM_RESULT[kind][locale];
      if (kind === "unavailable") {
        output.appendChild(telLink());
        output.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };

    if (params.get("sent") === "1") {
      showResult("sent");
    } else if (params.get("error") === "1") {
      showResult("error");
    }

    // PHPが実行できるか(action先をHEADで確認。PHP環境ではGET→303→HTML、
    // 静的配信では404またはソースのまま返る)
    const action = form.getAttribute("action") ?? "";
    const probe: Promise<boolean> = (async () => {
      if (!action) return false;
      try {
        const res = await fetch(action, { method: "HEAD", cache: "no-store" });
        const ct = res.headers.get("content-type") ?? "";
        return res.ok && ct.includes("text/html");
      } catch {
        return false;
      }
    })();

    void probe.then((available) => {
      if (available) return;
      // 送信不可を入力前に明示(入力後に失敗するより正直)
      const note = document.createElement("p");
      note.className = "form-unavailable-note";
      note.textContent = FORM_RESULT.unavailable[locale];
      note.appendChild(telLink());
      form.insertAdjacentElement("beforebegin", note);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      void probe.then((available) => {
        if (available) {
          // ハンドラを迂回して通常のPOST送信へ(303リダイレクトで結果表示)
          form.submit();
        } else {
          showResult("unavailable");
        }
      });
    });
  }, []);
  return null;
}
