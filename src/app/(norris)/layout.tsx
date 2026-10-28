import { SiteFooter } from "@/components/SiteFooter";
import { CtaBar } from "@/components/CtaBar";

export default function NorrisLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
      <CtaBar />
    </>
  );
}
