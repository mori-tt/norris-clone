<?php
// お問い合わせ・WEB予約フォーム(public/contact.php)用の設定。
// このファイルを contact-config.php という名前でコピーし、サーバー上の「公開フォルダの外」に置く。
//   例）公開フォルダが ~/web/example.com/ なら ~/contact-config.php（ホーム直下）
// 公開フォルダの中に置くとデプロイのたびに消えるため置かないこと。Git にも追加しない。
// 場所を変える場合は、環境変数 CONTACT_CONFIG_FILE にフルパスを指定する。
return [
    'CONTACT_TO_EMAIL' => '',            // 受信先(クリニック側メールアドレス)
    'CONTACT_FROM_EMAIL' => '',          // 送信元(ロリポップのメールアドレス推奨)
    'CONTACT_FROM_NAME' => 'ノリスクリニック',
    'CONTACT_SMTP_HOST' => 'smtp.lolipop.jp',
    'CONTACT_SMTP_PORT' => '465',
    'CONTACT_SMTP_USER' => '',
    'CONTACT_SMTP_PASS' => '',
    'CONTACT_SMTP_SECURE' => 'ssl',
    'CONTACT_ALLOWED_ORIGINS' => 'https://example.com',
    'CONTACT_RATE_LIMIT_MAX' => '5',
    'CONTACT_RATE_LIMIT_WINDOW' => '600',
    'CONTACT_ALLOW_NATIVE_MAIL' => 'false',
];
