/**
 * 多言語(ja/en/zh)対応。
 * - 本文HTML: scripts/translate-pages.mjs が content/i18n/<locale>/pages 配下に index.json を生成。
 *   ファイルが無いページは日本語にフォールバックする。
 * - ナビ・フッター・CTA・フォーム等のクローム文字列はこのファイルの辞書で翻訳する。
 */

export type Locale = "ja" | "en" | "zh";
export const LOCALES: Locale[] = ["ja", "en", "zh"];

export function localePrefix(locale: Locale): string {
  return locale === "ja" ? "" : `/${locale}`;
}

/** "/en/fee/" -> locale:"en", path:"/fee/" */
export function splitLocalePath(pathname: string): {
  locale: Locale;
  path: string;
} {
  const m = pathname.match(/^\/(en|zh)(\/.*)?$/);
  if (!m) return { locale: "ja", path: pathname };
  return { locale: m[1] as Locale, path: m[2] || "/" };
}

export function localizePath(pathname: string, locale: Locale): string {
  const { path } = splitLocalePath(pathname);
  return `${localePrefix(locale)}${path}`;
}

/** "aria-label"/HTML属性用の全角文字なし文言 */
const NAV_LABELS: Record<string, { en: string; zh: string }> = {
  HOME: { en: "Home", zh: "首页" },
  クリニック紹介: { en: "About the Clinic", zh: "诊所介绍" },
  診療メニュー: { en: "Treatments", zh: "诊疗项目" },
  料金一覧: { en: "Price List", zh: "价目表" },
  "診療時間・アクセス": { en: "Hours & Access", zh: "就诊时间·交通" },
  院長紹介: { en: "Doctor", zh: "院长介绍" },
  設備紹介: { en: "Facilities", zh: "设备介绍" },
  再生医療: { en: "Regenerative Medicine", zh: "再生医疗" },
  幹細胞治療: { en: "Stem Cell Therapy", zh: "干细胞治疗" },
  PRP療法: { en: "PRP Therapy", zh: "PRP疗法" },
  エクソソーム療法: { en: "Exosome Therapy", zh: "外泌体疗法" },
  脱毛: { en: "Hair Removal", zh: "脱毛" },
  ボトックス: { en: "Botox", zh: "肉毒杆菌" },
  ヒアルロン酸注射: { en: "Hyaluronic Acid", zh: "玻尿酸注射" },
  水光注射: { en: "Skin Booster", zh: "水光针" },
  ホルモン注射: { en: "Hormone Injection", zh: "激素注射" },
  美容点滴: { en: "Beauty IV Drip", zh: "美容点滴" },
  ダーマペン: { en: "Dermapen", zh: "微针" },
  フォトフェイシャル: { en: "Photofacial", zh: "光子嫩肤" },
  美肌診断: { en: "Skin Analysis", zh: "皮肤诊断" },
  "HARG療法(薄毛治療)": { en: "HARG Therapy (Hair)", zh: "HARG疗法（脱发治疗）" },
  泌尿器科: { en: "Urology", zh: "泌尿科" },
  メンズメニュー: { en: "Men's Menu", zh: "男士项目" },
  "症状・お悩みから探す": { en: "By Concern", zh: "按症状·烦恼查找" },
  "しみ・そばかす・肝斑・くすみ": {
    en: "Spots & Dullness",
    zh: "色斑·暗沉",
  },
  "しわ・たるみ": { en: "Wrinkles & Sagging", zh: "皱纹·松弛" },
  "いぼ・ほくろ・タトゥー除去": {
    en: "Wart / Mole / Tattoo Removal",
    zh: "疣·痣·纹身去除",
  },
  "ニキビ・ニキビ跡、毛穴": { en: "Acne & Pores", zh: "痘痘·痘印·毛孔" },
  エイジングケア治療: { en: "Anti-Aging Care", zh: "抗衰老护理" },
  "その他(美肌点滴・ピアス)": {
    en: "Other (IV Drip / Piercing)",
    zh: "其他（美肤点滴·穿刺）",
  },
  機器から探す: { en: "By Device", zh: "按设备查找" },
  "ライトシェアデュエット(脱毛)": {
    en: "LightSheer Duet (Hair Removal)",
    zh: "LightSheer Duet（脱毛）",
  },
  "ルミナスIPL M22(フォトフェイシャル)": {
    en: "Lumenis IPL M22 (Photofacial)",
    zh: "Lumenis IPL M22（光子嫩肤）",
  },
  "ウルトラセルQ+(HIFU)": { en: "Ultraformer / HIFU", zh: "超声刀（HIFU）" },
  "PicoWay(ピコレーザー)": { en: "PicoWay (Pico Laser)", zh: "PicoWay（皮秒激光）" },
  "re-Beau2(肌診断)": { en: "re-Beau2 (Skin Analysis)", zh: "re-Beau2（皮肤诊断）" },
  ダーマペン4: { en: "Dermapen 4", zh: "微针4" },
  診療時間: { en: "Consultation Hours", zh: "就诊时间" },
  アクセス: { en: "Access", zh: "交通" },
};

export function navLabel(label: string, locale: Locale): string {
  if (locale === "ja") return label;
  return NAV_LABELS[label]?.[locale] ?? label;
}

/** トップナビの補助英字ラベル(nav_span)。en/zh では非表示でよいが一応保持 */
export function navSubLabel(label: string, locale: Locale): string {
  if (locale !== "ja") return "";
  return label;
}

type Chrome = {
  spNav: { home: string; clinic: string; tel: string; access: string; menu: string };
  ctaTel: string;
  ctaReserve: string;
  backToTop: string;
  contactForm: string;
  sitemap: string;
  mediColumn: string;
  breadcrumbHome: string;
  drawerMenu: string;
  openMenu: string;
  closeMenu: string;
  newsList: string;
  langName: string;
  details: string;
  skipContactNote: string;
};

export const CHROME: Record<Locale, Chrome> = {
  ja: {
    spNav: {
      home: "HOME",
      clinic: "クリニック紹介",
      tel: "電話",
      access: "アクセス・診療時間",
      menu: "メニュー",
    },
    ctaTel: "お電話でのお問い合わせ",
    ctaReserve: "WEB予約",
    backToTop: "一番上に戻る",
    contactForm: "お問い合わせフォーム",
    sitemap: "サイトマップ",
    mediColumn: "ノリスメディカルコラム",
    breadcrumbHome: "HOME",
    drawerMenu: "メニュー",
    openMenu: "メニューを開く",
    closeMenu: "閉じる",
    newsList: "一覧へ",
    langName: "日本語",
    details: "詳細はこちら",
    skipContactNote: "",
  },
  en: {
    spNav: {
      home: "HOME",
      clinic: "About",
      tel: "Call",
      access: "Access & Hours",
      menu: "Menu",
    },
    ctaTel: "Contact us by phone",
    ctaReserve: "Online Booking",
    backToTop: "Back to top",
    contactForm: "Contact Form",
    sitemap: "Site Map",
    mediColumn: "Norris Medical Column",
    breadcrumbHome: "HOME",
    drawerMenu: "Menu",
    openMenu: "Open menu",
    closeMenu: "Close",
    newsList: "See all",
    langName: "English",
    details: "Learn more",
    skipContactNote: "",
  },
  zh: {
    spNav: {
      home: "首页",
      clinic: "诊所介绍",
      tel: "电话",
      access: "交通·就诊时间",
      menu: "菜单",
    },
    ctaTel: "电话咨询",
    ctaReserve: "网上预约",
    backToTop: "回到顶部",
    contactForm: "联系表单",
    sitemap: "网站地图",
    mediColumn: "Norris医疗专栏",
    breadcrumbHome: "首页",
    drawerMenu: "菜单",
    openMenu: "打开菜单",
    closeMenu: "关闭",
    newsList: "查看全部",
    langName: "中文",
    details: "了解更多",
    skipContactNote: "",
  },
};

/**
 * フォームページ(contact/reserve)本文中の文字列置換辞書。
 * wireForm でHTMLの該当箇所を文字列置換する。
 * [JA(置換対象), EN, ZH]
 */
export const FORM_STRINGS: [string, string, string][] = [
  // 共通
  ["(必須)", "(required)", "（必填）"],
  ["送信する", "Send", "发送"],
  [
    "※送信内容を確認したらチェックをいれてください。",
    "* Please check to confirm the details before sending.",
    "※确认发送内容后请勾选。",
  ],
  // contact
  ["お名前", "Name", "姓名"],
  ["ふりがな", "Name (Kana)", "姓名（假名）"],
  ["電話番号", "Phone number", "电话号码"],
  ["メールアドレス", "Email address", "电子邮箱"],
  ["お問い合わせ内容", "Message", "咨询内容"],
  // reserve
  ["氏名", "Name", "姓名"],
  ["氏名（フリガナ）", "Name (Kana)", "姓名（假名）"],
  ["年齢", "Age", "年龄"],
  ["性別", "Gender", "性别"],
  ["男性", "Male", "男"],
  ["女性", "Female", "女"],
  ["その他", "Other", "其他"],
  ["住所", "Address", "地址"],
  ["当クリニックへのご来院の状況", "Have you visited our clinic before?", "就诊经历"],
  ["初めて", "First visit", "初次"],
  ["2回目以降", "Returning visit", "再次就诊"],
  ["ご予約希望日", "Preferred date & time", "希望预约日期"],
  ["第1希望", "1st choice", "第一希望"],
  ["第2希望", "2nd choice", "第二希望"],
  ["第3希望", "3rd choice", "第三希望"],
  ["希望施術メニュー", "Preferred treatment", "希望治疗项目"],
  ["脱毛箇所", "Areas for hair removal", "脱毛部位"],
  ["ご相談内容", "Message", "咨询内容"],
  ["上半身", "Upper body", "上半身"],
  ["下半身", "Lower body", "下半身"],
  ["両ワキ", "Both underarms", "双腋"],
  ["両腕全体", "Full arms", "双臂全部"],
  ["両上腕", "Upper arms", "双上臂"],
  ["両前腕", "Forearms", "双前臂"],
  ["足全体", "Full legs", "全腿"],
  ["臀部", "Buttocks", "臀部"],
  ["両太もも", "Thighs", "双大腿"],
  ["両ひざ下", "Lower legs", "双膝以下"],
  ["足の甲～指", "Top of foot & toes", "脚背至脚趾"],
  ["背中全体", "Full back", "整个背部"],
  ["背中上", "Upper back", "上背部"],
  ["背中下", "Lower back", "下背部"],
  ["うなじ", "Nape", "颈后"],
  ["VIOライン", "VIO line", "VIO线"],
  ["Vライン", "V line", "V线"],
  ["Iライン", "I line", "I线"],
  ["Oライン", "O line", "O线"],
  ["前面全体", "Entire front", "正面全部"],
  ["胸", "Chest", "胸部"],
  ["乳輪回り", "Areola", "乳晕周围"],
  ["腹部", "Abdomen", "腹部"],
  ["顔全体", "Full face", "全脸"],
  ["鼻下", "Under the nose", "鼻下"],
  ["ひげ全体", "Full beard", "全胡须"],
  ["口周り", "Around the mouth", "口周"],
  ["あご", "Chin", "下巴"],
  ["頬", "Cheeks", "脸颊"],
  ["【診療時間】", "[Hours]", "【就诊时间】"],
  ["【休診日】", "[Closed]", "【休诊日】"],
  ["不定休", "Irregular holidays", "不定期休息"],
  // reserve 注記
  [
    "※1 お時間に余裕がある方は10：00～18：30まで",
    "*1 If your schedule is flexible: 10:00-18:30",
    "※1 时间充裕者可选10:00～18:30",
  ],
  [
    "受診可能なお時間帯をご記入ください",
    "Please enter the time slot you are available.",
    "请填写您方便的就诊时间段。",
  ],
  ["例）11：00～15：00", "e.g., 11:00-15:00", "例）11:00～15:00"],
  // reserve 希望施術メニュー選択肢
  ["※無料カウンセリング", "*Free Counseling", "※免费咨询"],
  ["フォトフェイシャル", "Photofacial", "光子嫩肤"],
  ["ピコトーニング", "Pico Toning", "皮秒嫩肤"],
  ["ピコスポット", "Pico Spot", "皮秒祛斑"],
  ["ダーマペン", "Dermapen", "微针"],
  ["ピーリング", "Chemical Peel", "焕肤"],
  ["水光注射", "Skin Booster", "水光针"],
  ["美容点滴", "Beauty IV Drip", "美容点滴"],
  ["ヒアルロン酸", "Hyaluronic Acid", "玻尿酸"],
  ["ボトックス", "Botox", "肉毒杆菌"],
  ["幹細胞治療", "Stem Cell Therapy", "干细胞治疗"],
  ["メンズメニュー", "Men's Menu", "男士项目"],
  ["ほくろ除去", "Mole Removal", "祛痣"],
  ["タトゥー除去", "Tattoo Removal", "祛纹身"],
  ["ハイフ", "HIFU", "超声刀"],
  ["脱毛", "Hair Removal", "脱毛"],
  ["ピアス（耳たぶのみ）", "Piercing (earlobe only)", "穿刺（仅耳垂）"],
  ["ピアス（耳たぶ以外）", "Piercing (non-earlobe)", "穿刺（非耳垂）"],
  [
    "(脱毛をご希望される方は必須)",
    "(required if requesting hair removal)",
    "（脱毛顾客必填）",
  ],
  // 日時セレクトの単位・部位(タグ囲み指定で属性値・長文内の誤置換を防ぐ)
  [">月<", ">Month<", ">月<"],
  [">日<", ">Day<", ">日<"],
  [">時<", ">hr<", ">时<"],
  [">分<", ">min<", ">分<"],
  [">分 <", ">min <", ">分 <"],
  [">手<", ">Hands<", ">手<"],
];

/** FORM_STRINGS の置換(長い方から先に、部分一致の誤爆を防ぐ) */
export function localizeFormHtml(html: string, locale: Locale): string {
  if (locale === "ja") return html;
  let out = html;
  const sorted = [...FORM_STRINGS].sort((a, b) => b[0].length - a[0].length);
  for (const [ja, en, zh] of sorted) {
    out = out.split(ja).join(locale === "en" ? en : zh);
  }
  return out;
}

/** フォーム不可時に案内する電話番号(FormEnhance用) */
export const FORM_TEL = "06-6772-3456";

/** フォーム送信結果メッセージ(FormEnhance用) */
export const FORM_RESULT = {
  sent: {
    ja: "送信ありがとうございました。確認の上、クリニックよりご連絡いたします。",
    en: "Thank you. We have received your inquiry and will get back to you.",
    zh: "发送成功。确认后，诊所将与您联系。",
  },
  error: {
    ja: "送信できませんでした。入力内容をご確認の上、時間を置いて再度お試しください。",
    en: "Sending failed. Please check your input and try again later.",
    zh: "发送失败。请检查输入内容，稍后重试。",
  },
  unavailable: {
    ja: "現在、このページからのフォーム送信はご利用いただけません。お急ぎの方はお電話にてご連絡ください: ",
    en: "Online form submission is currently unavailable. Please call us instead: ",
    zh: "目前无法通过此表单提交。请致电联系我们: ",
  },
} as const;
