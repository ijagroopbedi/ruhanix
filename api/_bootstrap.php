<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function rc_fail($msg, $code = 400, $extra = []) {
  http_response_code($code);
  echo json_encode(array_merge(['ok' => false, 'error' => $msg], $extra), JSON_UNESCAPED_SLASHES);
  exit;
}

function rc_ok($data = []) {
  echo json_encode(array_merge(['ok' => true], $data), JSON_UNESCAPED_SLASHES);
  exit;
}

function rc_int($v, $min, $max, $default) {
  if (!isset($v) || $v === '') return $default;
  if (!is_numeric($v)) return $default;
  $n = (int)$v;
  if ($n < $min) $n = $min;
  if ($n > $max) $n = $max;
  return $n;
}

function rc_slugify($s) {
  $s = strtolower(trim((string)$s));
  $s = preg_replace('/[^a-z0-9]+/', '-', $s);
  $s = trim($s, '-');
  return $s ?: 'my-site';
}

function rc_read_json() {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function rc_theme_from_category($cat) {
  $c = strtolower((string)$cat);
  if ($c === 'ecommerce') return 'fashion';
  if ($c === 'services' || $c === 'business') return 'service';
  if ($c === 'restaurant') return 'restaurant';
  if ($c === 'startup' || $c === 'blog' || $c === 'tech') return 'tech';
  if ($c === 'portfolio' || $c === 'creative' || $c === 'photography') return 'portfolio';
  if ($c === 'travel') return 'travel';
  return 'default';
}
