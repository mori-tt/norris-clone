/**
 * ノリスクリニック本家サイトの画像アセットを public/images/norris/ に取得するスクリプト。
 *
 * 使い方: node scripts/fetch-norris-assets.mjs
 *
 * ※ 取得した画像の著作権はノリスクリニックに帰属します。
 *   公開サイトで使う場合は必ず権利者の許可を得てください。
 *   別クリニック用テンプレートとして使う場合はこのディレクトリごと差し替えます。
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = path.join(ROOT, "public/images/norris");
const THEME =
  "https://www.norris-beauty-clinic.com/wp-content/themes/originalstyle-1column_05/img/";
const UP = "https://www.norris-beauty-clinic.com/wp-content/uploads/";

/** 保存先相対パス → 取得元URL */
const assets = {
  // ロゴ・ヒーロー
  "logo.png": UP + "logo.png",
  "mainimage01.jpg": THEME + "mainimage01.jpg",
  "mainimage02.jpg": THEME + "mainimage02.jpg",
  "mainimage03.jpg": THEME + "mainimage03.jpg",
  "mainimage04.jpg": UP + "mainimage04.jpg",
  "sp_mainimage01.jpg": THEME + "sp_mainimage01.jpg",
  "sp_mainimage02.jpg": THEME + "sp_mainimage02.jpg",
  "sp_mainimage03.jpg": THEME + "sp_mainimage03.jpg",
  "sp_mainimage04.jpg": UP + "sp_mainimage04.jpg",
  // 固定CTA・ページトップ
  "pagetop.png": THEME + "pagetop.png",
  "sp_pagetop.png": THEME + "sp_pagetop.png",
  "side01.png": THEME + "side01.png",
  "side02.png": THEME + "side02.png",
  "side03.png": THEME + "side03.png",
  "side04.png": THEME + "side04.png",
  "sp_side01.png": THEME + "sp_side01.png",
  "sp_side02.png": THEME + "sp_side02.png",
  "sp_side03.png": THEME + "sp_side03.png",
  "sp_side04.png": THEME + "sp_side04.png",
  // SPナビアイコン
  "sp_nav01.png": THEME + "sp_nav01.png",
  "sp_nav02.png": THEME + "sp_nav02.png",
  "sp_nav03.png": THEME + "sp_nav03.png",
  "sp_nav04.png": THEME + "sp_nav04.png",
  "sp_nav05.png": THEME + "sp_nav05.png",
  // 見出し装飾・透かし文字
  "ttl_img.png": THEME + "ttl_img.png",
  "txt_menu.png": THEME + "txt_menu.png",
  "txt_machine.png": THEME + "txt_machine.png",
  "txt_features.png": THEME + "txt_features.png",
  "txt_greeting.png": THEME + "txt_greeting.png",
  "txt_treatment.png": THEME + "txt_treatment.png",
  // 背景
  "sec03_bg.jpg": THEME + "sec03_bg.jpg",
  "sec06_bg.jpg": THEME + "sec06_bg.jpg",
  "sp_sec06_bg.jpg": THEME + "sp_sec06_bg.jpg",
  "under_title.jpg": THEME + "under_title.jpg",
  // 再生医療/診療メニューカード
  "sec_02_ttlbg001.jpg": THEME + "sec_02_ttlbg001.jpg",
  "sec_02_ttlbg002.jpg": THEME + "sec_02_ttlbg002.jpg",
  "sec_02_ttlbg003.jpg": THEME + "sec_02_ttlbg003.jpg",
  "sec_02_ttlbg004.jpg": THEME + "sec_02_ttlbg004.jpg",
  "sec_02_ttlbg005.jpg": THEME + "sec_02_ttlbg005.jpg",
  "sec_02_ttlbg006.jpg": THEME + "sec_02_ttlbg006.jpg",
  "sec02_bg01.jpg": THEME + "sec02_bg01.jpg",
  "sec02_bg02.jpg": THEME + "sec02_bg02.jpg",
  "sec02_bg03.jpg": THEME + "sec02_bg03.jpg",
  "sec02_bg04.jpg": THEME + "sec02_bg04.jpg",
  "sec02_bg05.jpg": THEME + "sec02_bg05.jpg",
  "sec02_bg06.jpg": THEME + "sec02_bg06.jpg",
  "sec_02_bnrimg001.jpg": UP + "sec_02_bnrimg001.jpg",
  "sec_02_bnrimg002.jpg": UP + "sec_02_bnrimg002.jpg",
  "sec_02_bnrimg003.jpg": UP + "sec_02_bnrimg003.jpg",
  "sec_02_bnrimg004.jpg": UP + "sec_02_bnrimg004.jpg",
  "sec_02_bnrimg005.jpg": UP + "sec_02_bnrimg005.jpg",
  "sec_02_bnrimg006.jpg": UP + "sec_02_bnrimg006.jpg",
  // 特徴カラム背景
  "sec04_bg01.jpg": THEME + "sec04_bg01.jpg",
  "sec04_bg02.jpg": THEME + "sec04_bg02.jpg",
  "sec04_bg03.jpg": THEME + "sec04_bg03.jpg",
  // 機器
  "sec03_img01.jpg": UP + "sec03_img01.jpg",
  "sec03_img02.jpg": UP + "sec03_img02.jpg",
  "sec03_img03.jpg": UP + "sec03_img03.jpg",
  "sec03_img04.jpg": UP + "sec03_img04.jpg",
  "sec03_img05.jpg": UP + "sec03_img05.jpg",
  "sec03_img06.jpg": UP + "sec03_img06.jpg",
  "sp_sec03_img01.jpg": UP + "sp_sec03_img01.jpg",
  "sp_sec03_img02.jpg": UP + "sp_sec03_img02.jpg",
  "sp_sec03_img03.jpg": UP + "sp_sec03_img03.jpg",
  "sp_sec03_img04.jpg": UP + "sp_sec03_img04.jpg",
  "sp_sec03_img05.jpg": UP + "sp_sec03_img05.jpg",
  "sp_sec03_img06.jpg": UP + "sp_sec03_img06.jpg",
  // 症状・お悩み
  "sec06_bnr01.png": UP + "sec06_bnr01.png",
  "sec06_bnr02.png": UP + "sec06_bnr02.png",
  "sec06_bnr03.png": UP + "sec06_bnr03.png",
  "sec06_bnr04.png": UP + "sec06_bnr04.png",
  "sec06_bnr05.png": UP + "sec06_bnr05.png",
  "sec06_bnr06.png": UP + "sec06_bnr06.png",
  // バナー・院長・カレンダー
  "hinyou.png": UP + "hinyou-770x331.png",
  "doctor.png": UP + "yoshitomochihara-770x770.png",
  "calendar.png": UP + "6b5ff2bab597ca80aca4ab9a8da2da95-948x1000.png",
  // アイコン・装飾
  "favicon.png": UP + "cropped-97f0fe9f784f8b6306aa6a3c5bd6058c-180x180.png",
  "h3_img.png": THEME + "h3_img.png",
  "h4_img.png": THEME + "h4_img.png",
  "arrow_b.svg": THEME + "arrow_b.svg",
  "arrow_r.svg": THEME + "arrow_r.svg",
  "f_icon01.png": THEME + "f_icon01.png",
  "f_icon02.png": THEME + "f_icon02.png",
  "f_icon03.png": THEME + "f_icon03.png",
  "f_icon04.png": THEME + "f_icon04.png",
  "btn_next.png": THEME + "btn_next.png",
  "btn_prev.png": THEME + "btn_prev.png",
  // Instagram
  "insta/profile.webp": UP + "sb-instagram-feed-images/norris_beautyclinic.webp",
};

// Instagram 投稿画像(CDN、トークン付きURLは期限切れになるため index.html から都度拾う想定だが、
// 取得済みの一時URLでも一旦保存する)
const instaPosts = [
  "https://scontent-nrt1-1.cdninstagram.com/v/t51.82787-15/829528264_18075114212717474_8909526997072647097_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=Wix7bfiweOIQ7kNvwHqdygg&_nc_oc=Ado3HW8yQRjm62zmF6TxGlZnpdqNj2Y_XOkeJLSxeXQsiE-7E7rNyUvz53pmeDI9I7s&_nc_zt=23&_nc_ht=scontent-nrt1-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=J21VBI-8y5vV1VcGTJdjBw&_nc_tpa=Q5bMBQINkg-3wmCQCCxkIIKwnfHxA-NU604CKNH_Egzf3jCPOUx93FrPPYl4DpmNWYpz84oN3LS32IGZJA&oh=00_AQSP71v0mMo-qkhBj13d1lSx7_sdcXQGaa_Ac-OPNs4OJQ&oe=6AE7409D",
  "https://scontent-nrt1-1.cdninstagram.com/v/t51.82787-15/846843490_18077363201717474_8952231234137882825_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=103&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=nytyIcN_iPAQ7kNvwE0UhwJ&_nc_oc=AdqnWX7iTfILQPMs2B4bbP0z8Q4tRfGYk260mo_j9mqFiBeDSBZjjXNyqJNK09RnI9o&_nc_zt=23&_nc_ht=scontent-nrt1-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=J21VBI-8y5vV1VcGTJdjBw&_nc_tpa=Q5bMBQKu5dqcVWvnx9jBTBZ_HmY7c7pX3zU6kbd2GPNiQfPkZDck8A81foHRQJIe8rm80hvU0CE0ASOgMg&oh=00_AQRRuslCoLTdc-9WtDaoHBMtbFEjZdbWr_-iIERZdnbUFw&oe=6AE75C41",
  "https://scontent-nrt1-2.cdninstagram.com/v/t51.82787-15/825324276_18074366060717474_1353415724220206894_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=104&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ==&_nc_ohc=BgXJhcni1ukQ7kNvwFnOM&_nc_oc=AdoFRLLhN9v4Y909IPU7whroPPUEPCVHnnS9W1XSTvd52Pxr80fbUXWJFd26BwCoHOU&_nc_zt=23&_nc_ht=scontent-nrt1-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=J21VBI-8y5vV1VcGTJdjBw&_nc_tpa=Q5bMBQLNaZpx9ykBA9IzEdYBPK6ns4o6jN0Q76AOpe2-5jWnE_bm2JtDiwlgxUrvhNaX1QNCBSw-KM5Ipw&oh=00_AQSiHcG9ZDU5BTz_JOU0CwrzIrN-b074ua3T__0_f2j2Yw&oe=6AE75740",
  "https://scontent-nrt1-2.cdninstagram.com/v/t51.82787-15/833836007_18075438269717474_8988169625873253284_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=107&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=41w8_HXxvBsQ7kNvwE0UhwJ&_nc_oc=AdoFRLLhN9v4Y909IPU7whroPPUEPCVHnnS9W1XSTvd52Pxr80fbUXWJFd26BwCoHOU&_nc_zt=23&_nc_ht=scontent-nrt1-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=J21VBI-8y5vV1VcGTJdjBw&_nc_tpa=Q5bMBQKvIgictkN16vHmpTY2c2OISqOsHFwyOJV58F5RiBtFyUwGTNSlsUpvXOOC-xJOrXlbNnbvyBg-BQ&oh=00_AQR0t7j42KGgW9aX8K3iX8lhy7uGO6YlJ7Fe2NRgFmbGEw&oe=6AE74BA6",
  "https://scontent-nrt6-1.cdninstagram.com/v/t51.82787-15/817789372_18074205866717474_8808979659374332884_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ==&_nc_ohc=2ScsAnX9KbAQ7kNvwHZSJtI&_nc_oc=AdqgvjMrGM82A1Q56rxUJCv8W-jMgunvEMEEnowVCTj3WDkuVwirp-Vut3NJoewFVZM&_nc_zt=23&_nc_ht=scontent-nrt6-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=J21VBI-8y5vV1VcGTJdjBw&_nc_tpa=Q5bMBQK-seI_4Lp_kklTJcvFwURt6WuW7CJAZ2GGScqLzGg90G8lVkhYX2W5v0D_cN2-G9VegFGUOnhu2Q&oh=00_AQSsn2OKvBc-xYfclk6cYyDLOnlEQb6Qu-ZrVbWw7Dm8rA&oe=6AE73FBB",
  "https://scontent-nrt6-1.cdninstagram.com/v/t51.82787-15/828532228_18075114617717474_7903127737335604607_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=Oqg84K8eyocQ7kNvwHmoEby&_nc_oc=Adr_BuJVXSSB7QqcboU7YnjOSge9bwLlXm9SkQpJRNmuB3ulO1uSCVJlEV1deHimqtU&_nc_zt=23&_nc_ht=scontent-nrt6-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=J21VBI-8y5vV1VcGTJdjBw&_nc_tpa=Q5bMBQLaLtIg5E2hsEeC9zhPTFJYMH7SqpmaPgF2vqo3SmKgOSb9crjZeGDCF_RviUCR57wpoexQCYdyTw&oh=00_AQTD_n-gwPmV4RSN9nUVyGG9fW2ayniarvey_vj2liMHDA&oe=6AE754B8",
  "https://scontent-nrt6-1.cdninstagram.com/v/t51.82787-15/840287493_18076162208717474_509963471570234401_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=gUcZxQFxbQkQ7kNvwEOtaFH&_nc_oc=AdrTIIQIMwx42ThSRWtk-NAP0s_uIfoF3XY7gCZIFhiyycRoGgVdN5khAtHF3WozsfU&_nc_zt=23&_nc_ht=scontent-nrt6-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=J21VBI-8y5vV1VcGTJdjBw&_nc_tpa=Q5bMBQJEQs9Q8SCEMhYD7Rq_lyaA65klwFPtnuBPk9bHWfRIUarwovdDmjExXBHLwUNCRXVJ-7QO6utsAQ&oe=6AE73A13",
  "https://scontent-nrt6-1.cdninstagram.com/v/t51.82787-15/850725608_18077968868717474_7755978383442592633_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=110&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=0No4gTI58F8Q7kNvwHmoEby&_nc_oc=Adr_KLH09d6ZQSEDn9ojSx2S4Jqt_qRXkMS2DWttkHT8VhP6Sdp4TpwhMLmebsbTeL8&_nc_zt=23&_nc_ht=scontent-nrt6-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=J21VBI-8y5vV1VcGTJdjBw&_nc_tpa=Q5bMBQLzBcTJ3piyOtALbBnApw-fZKpw3WLWqin_YuBom0Iu6YUpkx00ZtiY--5yBHtWc0ZHj6K5fazrwA&oe=6AE7595D",
];
instaPosts.forEach((url, i) => {
  assets[`insta/post0${i + 1}.jpg`] = url.replace(/&#038;/g, "&");
});

let ok = 0;
let ng = 0;
for (const [rel, url] of Object.entries(assets)) {
  const dest = path.join(OUT, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) throw new Error(`too small (${buf.length}B)`);
    await writeFile(dest, buf);
    ok++;
    console.log(`OK ${rel} (${(buf.length / 1024).toFixed(0)}KB)`);
  } catch (e) {
    ng++;
    console.log(`NG ${rel}: ${e.message}`);
  }
}
console.log(`\n${ok} downloaded, ${ng} failed → ${OUT}`);
if (ng === 0 && existsSync(OUT)) console.log("done");
