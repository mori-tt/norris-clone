/**
 * public/ 配下アセットへの参照にベースパスを付与する。
 * next.config.ts で NEXT_PUBLIC_BASE_PATH に BASE_PATH を引き継ぐ
 * (クライアント側でも参照できるようNEXT_PUBLIC_プレフィックスを使う)。
 * ローカル/ロリポップでは空文字のまま変化なし。
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return BASE && path.startsWith("/") ? `${BASE}${path}` : path;
}

/** ベースパス付きの実パス(window.location.pathname等)からベース部を除去 */
export function stripBase(pathname: string): string {
  return BASE && pathname.startsWith(`${BASE}/`)
    ? pathname.slice(BASE.length)
    : pathname;
}
