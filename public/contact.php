<?php
declare(strict_types=1);

// 静的Next.js書き出し(out/)から呼び出すお問い合わせ・WEB予約受付。
// /contact/ と /reserve/ のフォームが POST する。秘密情報は公開フォルダ外の
// contact-config.php または環境変数で設定する(詳細は deploy/contact-config.example.php)。
function contact_config(): array {
    static $config = null;
    if ($config !== null) return $config;
    $config = [];
    $docRoot = rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? __DIR__), '/');
    $candidates = array_filter([
        getenv('CONTACT_CONFIG_FILE') ?: '',
        dirname($docRoot) . '/contact-config.php',
        dirname($docRoot, 2) . '/contact-config.php',
    ]);
    foreach ($candidates as $file) {
        if (!is_file($file)) continue;
        $loaded = (static function () use ($file) { return require $file; })();
        if (is_array($loaded)) {
            $config = $loaded;
            break;
        }
        error_log('contact-config.php must return an array: ' . $file);
    }
    return $config;
}

function env_value(string $key, string $fallback = ''): string {
    $config = contact_config();
    if (array_key_exists($key, $config)) return trim((string)$config[$key]);
    $value = getenv($key);
    return $value === false ? $fallback : trim($value);
}

function request_accepts_json(): bool {
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    return str_contains(strtolower($accept), 'application/json');
}

function request_body_json(): array {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (!str_contains(strtolower($contentType), 'application/json')) {
        return [];
    }
    $raw = file_get_contents('php://input') ?: '';
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function respond_json(bool $success, string $message, int $status = 200): never {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// フォーム種別ごとの返却先。未知のパスは /contact/ に倒す。
function safe_return_path(array $input): string {
    $path = (string)($input['return_path'] ?? '/contact/');
    if (!preg_match('#^/(?:contact|reserve)/$#', $path)) {
        return '/contact/';
    }
    return $path;
}

function respond(bool $success, string $message, int $status = 200): never {
    if (request_accepts_json()) {
        respond_json($success, $message, $status);
    }
    redirect_result($success ? 'sent' : 'error');
}

function redirect_result(string $key): void {
    header('Location: ' . safe_return_path($_POST) . '?' . $key . '=1', true, 303);
    exit;
}

function request_is_allowed_origin(): bool {
    $configured = env_value('CONTACT_ALLOWED_ORIGINS');
    if ($configured === '') {
        return true;
    }
    $allowed = array_filter(array_map('trim', explode(',', $configured)));
    $origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    $referer = trim((string)($_SERVER['HTTP_REFERER'] ?? ''));
    foreach ($allowed as $base) {
        $base = rtrim($base, '/');
        if ($origin !== '' && $origin === $base) return true;
        if ($referer !== '' && strncmp($referer, $base . '/', strlen($base) + 1) === 0) return true;
    }
    return false;
}

function rate_limit_exceeded(): bool {
    $max = max(1, (int)env_value('CONTACT_RATE_LIMIT_MAX', '5'));
    $window = max(60, (int)env_value('CONTACT_RATE_LIMIT_WINDOW', '600'));
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $key = hash('sha256', $ip . '|' . __FILE__);
    $file = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'norris-contact-' . $key . '.json';
    $handle = @fopen($file, 'c+');
    if ($handle === false) return false;
    if (!flock($handle, LOCK_EX)) { fclose($handle); return false; }
    $raw = stream_get_contents($handle);
    $timestamps = json_decode($raw ?: '[]', true);
    if (!is_array($timestamps)) $timestamps = [];
    $now = time();
    $timestamps = array_values(array_filter($timestamps, static fn($timestamp) => is_int($timestamp) && $timestamp > $now - $window));
    $limited = count($timestamps) >= $max;
    if (!$limited) {
        $timestamps[] = $now;
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($timestamps));
    }
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $limited;
}

// フォーム種別ごとのフィールド定義。[ name => [ラベル, 必須] ]
function form_fields(string $form): array {
    if ($form === 'reserve') {
        return [
            'your-name'      => ['氏名', true],
            'your-kana'      => ['氏名（フリガナ）', true],
            'your-age'       => ['年齢', false],
            'your-gender'    => ['性別', false],
            'your-address'   => ['住所', false],
            'your-email'     => ['メールアドレス', true],
            'your-visit'     => ['当クリニックへのご来院の状況', false],
            'your-tel'       => ['電話番号', true],
            'reserve-date'   => ['ご予約希望日', false], // 合成フィールド(下記で生成)
            'select-menu'    => ['希望施術メニュー', false],
            'checkbox-menu'  => ['脱毛箇所', false],
            'your-message'   => ['ご相談内容', false],
        ];
    }
    return [
        'your-name'    => ['お名前', true],
        'your-kana'    => ['ふりがな', true],
        'your-tel'     => ['電話番号', true],
        'your-email'   => ['メールアドレス', true],
        'your-message' => ['お問い合わせ内容', false],
    ];
}

function first_value(array $input, string $key): string {
    $v = $input[$key] ?? '';
    return is_array($v) ? trim((string)($v[0] ?? '')) : trim((string)$v);
}

function list_value(array $input, string $key): string {
    $v = $input[$key] ?? '';
    if (!is_array($v)) return trim((string)$v);
    return implode('、', array_map(static fn($x) => trim((string)$x), $v));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_result('error');
}

if (!request_is_allowed_origin() || rate_limit_exceeded()) {
    respond(false, 'リクエストを受け付けできません。', 403);
}

$jsonInput = request_body_json();
$input = $jsonInput !== [] ? $jsonInput : $_POST;

$form = first_value($input, 'form') === 'reserve' ? 'reserve' : 'contact';
$fields = form_fields($form);
$honeypot = first_value($input, 'website');
$startedAt = (int)first_value($input, 'started_at');
$consent = first_value($input, 'acceptance-707') !== '' || ($input['consent'] ?? '') === '1' || ($input['consent'] ?? false) === true;

// ボット対策: ハニーポット・高速送信は成功したように見せて破棄
if ($honeypot !== '' || ($startedAt > 0 && (int)(microtime(true) * 1000) - $startedAt < 2500)) {
    respond(true, '送信を受け付けました。');
}
// リンク大量投稿はスパムとみなし破棄
$linkCount = preg_match_all('#https?://|www\.#i', first_value($input, 'your-message'));
if ($linkCount !== false && $linkCount > 3) {
    respond(true, '送信を受け付けました。');
}

// 値の収集と必須チェック
$values = [];
foreach ($fields as $name => [$label, $required]) {
    if ($name === 'reserve-date') continue;
    $value = $name === 'checkbox-menu' ? list_value($input, 'checkbox-menu') : first_value($input, $name);
    if ($required && $value === '') {
        respond(false, '必須項目が未入力です。', 422);
    }
    if (mb_strlen($value) > 5000) {
        respond(false, '入力内容をご確認ください。', 422);
    }
    $values[$name] = [$label, $value];
}

// 予約希望日(第1〜第3希望)を合成
if ($form === 'reserve') {
    $dates = [];
    for ($i = 1; $i <= 3; $i++) {
        $m = first_value($input, 'your-kibou0' . (($i - 1) * 2 + 1));
        $d = first_value($input, 'your-kibou0' . (($i - 1) * 2 + 2));
        $h = first_value($input, 'select-hour0' . $i);
        $min = first_value($input, 'select-minutes0' . $i);
        $free = first_value($input, 'your-kibou0' . $i . '-text');
        if ($m === '' && $d === '' && $h === '' && $free === '') continue;
        $part = trim("{$m}月{$d}日") . ($h !== '' ? " {$h}時{$min}分" : '') . ($free !== '' ? " ({$free})" : '');
        $dates[] = "第{$i}希望: " . trim($part);
    }
    $values['reserve-date'] = ['ご予約希望日', implode("\n", $dates)];
}

$name = $values['your-name'][1];
$email = $values['your-email'][1];
$tel = $values['your-tel'][1];

if (
    $name === '' || mb_strlen($name) > 80 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 ||
    $tel === '' || mb_strlen($tel) > 30 ||
    !$consent ||
    preg_match('/[\r\n\x00-\x08\x0B\x0C\x0E-\x1F]/', $name . $email . $tel)
) {
    respond(false, '入力内容をご確認ください。', 422);
}

$to = env_value('CONTACT_TO_EMAIL');
$from = env_value('CONTACT_FROM_EMAIL');
$fromName = env_value('CONTACT_FROM_NAME', 'ノリスクリニック');
if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
    error_log('Contact form is not configured: CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL is missing.');
    respond(false, 'サーバー側の設定が完了していません。', 500);
}

$subject = $form === 'reserve'
    ? '【ノリスクリニック】WEB予約（仮予約）'
    : '【ノリスクリニック】お問い合わせ';
$bodyLines = [$form === 'reserve' ? 'WEB予約フォームから受信しました(仮予約)。' : 'お問い合わせフォームから受信しました。', ''];
foreach ($values as [$label, $value]) {
    if ($value === '') continue;
    $bodyLines[] = "【{$label}】";
    $bodyLines[] = $value;
}
$body = implode("\n", $bodyLines) . "\n";

$autoloadCandidates = array_filter([
    env_value('CONTACT_PHPMAILER_AUTOLOAD'),
    __DIR__ . '/vendor/autoload.php',
    __DIR__ . '/phpmailer/vendor/autoload.php',
]);
$autoloaded = false;
foreach ($autoloadCandidates as $autoload) {
    if (is_file($autoload)) {
        require_once $autoload;
        $autoloaded = true;
        break;
    }
}

// Composer が使えない環境・FTP のみのデプロイでも動作するよう、
// 同梱の PHPMailer ソースを直接 require するフォールバック。
if (!$autoloaded && is_file(__DIR__ . '/phpmailer/src/PHPMailer.php')) {
    require_once __DIR__ . '/phpmailer/src/Exception.php';
    require_once __DIR__ . '/phpmailer/src/PHPMailer.php';
    require_once __DIR__ . '/phpmailer/src/SMTP.php';
    $autoloaded = true;
}

if ($autoloaded && class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = env_value('CONTACT_SMTP_HOST', 'smtp.lolipop.jp');
        $mail->Port = (int)env_value('CONTACT_SMTP_PORT', '465');
        $mail->SMTPAuth = true;
        $mail->Username = env_value('CONTACT_SMTP_USER', $from);
        $mail->Password = env_value('CONTACT_SMTP_PASS');
        $mail->SMTPSecure = strtolower(env_value('CONTACT_SMTP_SECURE', 'ssl')) === 'tls'
            ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS
            : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($from, $fromName);
        $mail->addAddress($to);
        $mail->addReplyTo($email, $name);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->send();
        respond(true, '送信を受け付けました。');
    } catch (Throwable $exception) {
        error_log('PHPMailer contact error: ' . $exception->getMessage());
        respond(false, '送信に失敗しました。時間を置いて再度お試しください。', 500);
    }
}

if (env_value('CONTACT_ALLOW_NATIVE_MAIL', 'false') !== 'true') {
    error_log('PHPMailer is not configured. Native mail fallback is disabled.');
    respond(false, 'サーバー側の設定が完了していません。', 500);
}

$encodedSubject = function_exists('mb_encode_mimeheader') ? mb_encode_mimeheader($subject, 'UTF-8') : $subject;
$headers = "From: {$from}\r\n" .
    "Reply-To: {$email}\r\n" .
    "Content-Type: text/plain; charset=UTF-8\r\n";
if (mail($to, $encodedSubject, $body, $headers, '-f' . $from)) {
    respond(true, '送信を受け付けました。');
}
error_log('Native mail() failed for contact form.');
respond(false, '送信に失敗しました。時間を置いて再度お試しください。', 500);
