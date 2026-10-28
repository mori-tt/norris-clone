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
