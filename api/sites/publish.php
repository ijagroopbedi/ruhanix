<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') rc_fail('Method not allowed', 405);

$pdo = rc_pdo();
$body = rc_read_json();
$siteKey = trim((string)($body['site'] ?? ''));

if (!preg_match('/^[a-f0-9]{32}$/i', $siteKey)) rc_fail('Invalid site key', 400);

$stmt = $pdo->prepare("SELECT s.*, t.folder_slug
                       FROM sites s JOIN templates t ON t.id=s.template_id
                       WHERE s.site_key=:k LIMIT 1");
$stmt->execute([':k' => $siteKey]);
$site = $stmt->fetch();
if (!$site) rc_fail('Site not found', 404);

$slug = $site['slug'];
if (!preg_match('/^[a-z0-9-]+$/', $slug)) rc_fail('Invalid slug', 500);

$templateFolder = RC_TEMPLATE_DIR . '/' . $site['folder_slug'];
if (!is_dir($templateFolder)) rc_fail('Template folder missing', 500);

$publishDir = rtrim(RC_PUBLISH_DIR, '/\\') . '/' . $slug;
if (!is_dir($publishDir) && !mkdir($publishDir, 0755, true)) rc_fail('Cannot create publish dir', 500);

function rc_copy_dir($src, $dst) {
  if (!is_dir($dst)) mkdir($dst, 0755, true);
  foreach (scandir($src) as $item) {
    if ($item === '.' || $item === '..') continue;
    $s = $src . '/' . $item;
    $d = $dst . '/' . $item;
    if (is_dir($s)) rc_copy_dir($s, $d);
    else copy($s, $d);
  }
}

rc_copy_dir($templateFolder, $publishDir);

$p = $pdo->prepare("SELECT filename, page_html FROM pages WHERE site_id=:sid");
$p->execute([':sid' => $site['id']]);
$pages = $p->fetchAll();

foreach ($pages as $pg) {
  $fn = basename($pg['filename']); // safety
  file_put_contents($publishDir . '/' . $fn, $pg['page_html'] ?? '');
}

$upd = $pdo->prepare("UPDATE sites SET status='published', published_at=NOW() WHERE id=:id LIMIT 1");
$upd->execute([':id' => $site['id']]);

rc_ok([
  'published' => true,
  'publish_path' => 'sites/' . $slug . '/'
]);
