import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "プライバシーポリシー" };

export default function PrivacyPage() {
  const site = getSite();
  const sections = [
    {
      title: "個人情報の取得",
      body: "当院では、ご予約・お問い合わせ・診療の提供に必要な範囲で、氏名・連絡先等の個人情報を取得します。",
    },
    {
      title: "個人情報の利用目的",
      body: "取得した個人情報は、診療・予約管理・ご連絡・サービス改善の目的に限り利用します。",
    },
    {
      title: "第三者への提供",
      body: "法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。",
    },
    {
      title: "個人情報の管理",
      body: "個人情報への不正アクセス・紛失・漏洩を防ぐため、適切な安全管理措置を講じます。",
    },
    {
      title: "開示・訂正・削除",
      body: "ご本人からの個人情報の開示・訂正・削除のご請求には、合理的な範囲で速やかに対応します。",
    },
    {
      title: "お問い合わせ",
      body: `個人情報の取り扱いに関するお問い合わせは、${site.name}(TEL:${site.tel})までご連絡ください。`,
    },
  ];

  return (
    <>
      <PageHero ja="プライバシーポリシー" en="PRIVACY POLICY" />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm leading-relaxed">
          {site.name}(以下「当院」)は、患者さまの個人情報を適切に保護するため、以下の方針を定めます。
        </p>
        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="font-serif text-lg font-semibold">
                {i + 1}. {s.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text/80">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
