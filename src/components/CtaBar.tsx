import { getSite } from "@/lib/content";
import { InstagramIcon, LineIcon, PhoneIcon } from "./icons";

/** モバイル固定フッターCTA(電話/予約/SNS) */
export function CtaBar() {
  const site = getSite();
  const items = [
    {
      href: `tel:${site.tel.replaceAll("-", "")}`,
      label: "電話",
      icon: <PhoneIcon className="h-5 w-5" />,
      external: false,
      primary: true,
    },
    site.reserveUrl && {
      href: site.reserveUrl,
      label: "WEB予約",
      icon: null,
      external: true,
      primary: false,
    },
    site.instagramUrl && {
      href: site.instagramUrl,
      label: "Instagram",
      icon: <InstagramIcon className="h-5 w-5" />,
      external: true,
      primary: false,
    },
    site.lineUrl && {
      href: site.lineUrl,
      label: "LINE",
      icon: <LineIcon className="h-5 w-5" />,
      external: true,
      primary: false,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    icon: React.ReactNode;
    external: boolean;
    primary: boolean;
  }[];

  return (
    <nav
      aria-label="お問い合わせ"
      className="fixed bottom-0 left-0 right-0 z-40 grid grid-flow-col border-t border-accent bg-white md:hidden"
    >
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          {...(item.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium ${
            item.primary ? "bg-primary text-white" : "text-primary-dark"
          }`}
        >
          {item.icon}
          {item.label}
        </a>
      ))}
    </nav>
  );
}
