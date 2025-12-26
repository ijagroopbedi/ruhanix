<?php
ob_start();

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/helpers.php';

start_session();

$id = (int)($_GET['id'] ?? 0);
$slug = clean_slug($_GET['slug'] ?? '');

if ($id <= 0 && $slug === '') {
  header("Location: " . APP_BASE . "/templates.html");
  exit;
}

$pdo = db();

if ($id > 0) {
  $stmt = $pdo->prepare("SELECT id, slug FROM templates WHERE id = ? LIMIT 1");
  $stmt->execute([$id]);
} else {
  $stmt = $pdo->prepare("SELECT id, slug FROM templates WHERE slug = ? LIMIT 1");
  $stmt->execute([$slug]);
}

$t = $stmt->fetch();
if (!$t) {
  http_response_code(404);
  echo "Template not found in DB.";
  exit;
}

$tid = (int)$t['id'];
$_SESSION['selected_template_id'] = $tid;
$_SESSION['selected_template_slug'] = (string)$t['slug'];

// ✅ cookie fallback (works even if session fails)
set_selected_template_cookie($tid);

// ✅ write session before redirect
session_write_close();

// ✅ redirect to admin with tid
header("Location: " . APP_BASE . "/admin.html?tid=" . urlencode((string)$tid));
exit;
