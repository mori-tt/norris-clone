"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

/**
 * 静的書き出しでは <html lang> はルートレイアウト固定(ja)のため、
 * en/zh ページではDOM上の lang を正しい値に補正する。
 * 併せてページルートdivにも lang 属性を付けている。
 */
export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    if (locale === "ja") return;
    const lang = locale === "zh" ? "zh-CN" : locale;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "ja";
    };
  }, [locale]);
  return null;
}
