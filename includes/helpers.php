<?php

function start_session(): void {
  if (session_status() === PHP_SESSION_ACTIVE) return;

  $path = (defined('APP_BASE') && APP_BASE) ? (rtrim(APP_BASE, '/') . '/') : '/';
  $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');

  if (!headers_sent()) {
    if (defined('PHP_VERSION_ID') && PHP_VERSION_ID >= 70300) {
      session_set_cookie_params([
        'lifetime' => 0,
        'path' => $path,
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
      ]);
    } else {
      session_set_cookie_params(0, $path, "", $secure, true);
    }
  }

  session_start();
}

function app_cookie_path(): string {
  return (defined('APP_BASE') && APP_BASE) ? (rtrim(APP_BASE, '/') . '/') : '/';
}

function set_selected_template_cookie(int $tid): void {
  $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
  $path = app_cookie_path();

  // 30 days
  if (defined('PHP_VERSION_ID') && PHP_VERSION_ID >= 70300) {
    setcookie('rc_tid', (string)$tid, [
      'expires' => time() + 86400 * 30,
      'path' => $path,
      'secure' => $secure,
      'httponly' => true,
      'samesite' => 'Lax',
    ]);
  } else {
    setcookie('rc_tid', (string)$tid, time() + 86400 * 30, $path);
  }
}

function json_out($data, int $code=200): void {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_SLASHES);
  exit;
}

function clean_slug(string $slug): string {
  return preg_match('/^[a-zA-Z0-9\-_]+$/', $slug) ? $slug : '';
}

function safe_html_file(string $file): string {
  return preg_match('/^[a-zA-Z0-9\-_]+\.html$/', $file) ? $file : '';
}

function realpath_inside(string $baseDir, string $targetPath): bool {
  $base = realpath($baseDir);
  $target = realpath($targetPath);
  if (!$base || !$target) return false;

  $base = rtrim($base, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
  return strpos($target, $base) === 0;
}

function clamp_int($v, int $min, int $max, int $fallback): int {
  $n = (int)$v;
  if ($n < $min) return $fallback;
  if ($n > $max) return $max;
  return $n;
}
