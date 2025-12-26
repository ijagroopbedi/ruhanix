<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') rc_fail('Method not allowed', 405);

$pdo = rc_pdo();
$body = rc_read_json();

$templateId = (int)($body['template_id'] ?? 0);
if (!$templateId) rc_fail('template_id required', 400);

$title = trim((string)($body['title'] ?? 'My Site'));
$slugBase = rc_slugify($body['slug'] ?? $title);
$catTheme = rc_theme_from_category($body['category_theme'] ?? '');

$stmt = $pdo->prepare("SELECT id, title, category, folder_slug FROM templates WHERE id = :id LIMIT 1");
$stmt->execute([':id' => $templateId]);
$template = $stmt->fetch();
if (!$template) rc_fail('Template not found', 404);

$templateFolder = RC_TEMPLATE_DIR . '/' . $template['folder_slug'];
if (!is_dir($templateFolder)) rc_fail('Template folder missing on server', 500);

$siteKey = bin2hex(random_bytes(16));

$slug = $slugBase;
for ($i=0; $i<25; $i++) {
  $check = $pdo->prepare("SELECT 1 FROM sites WHERE slug = :s LIMIT 1");
  $check->execute([':s' => $slug]);
  if (!$check->fetch()) break;
  $slug = $slugBase . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
}

$pdo->beginTransaction();
try {
  $siteJson = [
    'template_id' => $templateId,
    'template_folder' => $template['folder_slug'],
    'category' => $template['category'],
    'created_at' => gmdate('c'),
  ];

  $ins = $pdo->prepare("INSERT INTO sites (site_key, slug, template_id, title, category_theme, site_json)
                        VALUES (:k, :slug, :tid, :title, :theme, :json)");
  $ins->execute([
    ':k' => $siteKey,
    ':slug' => $slug,
    ':tid' => $templateId,
    ':title' => $title ?: 'My Site',
    ':theme' => $catTheme,
    ':json' => json_encode($siteJson, JSON_UNESCAPED_SLASHES)
  ]);
  $siteId = (int)$pdo->lastInsertId();

  // Create pages from template root (*.html at top level)
  $files = [];
  foreach (new DirectoryIterator($templateFolder) as $f) {
    if ($f->isDot() || !$f->isFile()) continue;
    $name = $f->getFilename();
    if (preg_match('/\.html$/i', $name)) $files[] = $name;
  }
  if (!in_array('index.html', $files, true) && file_exists($templateFolder . '/index.html')) {
    $files[] = 'index.html';
  }
  sort($files);

  $pIns = $pdo->prepare("INSERT INTO pages (site_id, filename, title, page_json, page_html)
                         VALUES (:sid, :fn, :t, :j, :h)");

  foreach ($files as $fn) {
    $html = file_get_contents($templateFolder . '/' . $fn);
    $pageTitle = ($fn === 'index.html') ? 'Home' : ucwords(str_replace(['.html','-','_'], ['',' ',' '], $fn));

    $pIns->execute([
      ':sid' => $siteId,
      ':fn' => $fn,
      ':t' => $pageTitle,
      ':j' => json_encode(['version'=>1,'changes'=>[]], JSON_UNESCAPED_SLASHES),
      ':h' => $html
    ]);
  }

  $pdo->commit();
} catch (Throwable $e) {
  $pdo->rollBack();
  rc_fail('Create failed: ' . $e->getMessage(), 500);
}

rc_ok([
  'site_key' => $siteKey,
  'slug' => $slug
]);
