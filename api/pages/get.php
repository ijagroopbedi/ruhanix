<?php
require_once __DIR__ . '/../_bootstrap.php';

$pdo = rc_pdo();
$siteKey = trim($_GET['site'] ?? '');
$pageId  = (int)($_GET['page_id'] ?? 0);

if (!preg_match('/^[a-f0-9]{32}$/i', $siteKey)) rc_fail('Invalid site key', 400);
if (!$pageId) rc_fail('page_id required', 400);

$stmt = $pdo->prepare("SELECT s.id AS site_id, s.site_key, t.folder_slug
                       FROM sites s JOIN templates t ON t.id=s.template_id
                       WHERE s.site_key=:k LIMIT 1");
$stmt->execute([':k' => $siteKey]);
$site = $stmt->fetch();
if (!$site) rc_fail('Site not found', 404);

$p = $pdo->prepare("SELECT id, filename, title, page_json, page_html FROM pages WHERE id=:pid AND site_id=:sid LIMIT 1");
$p->execute([':pid' => $pageId, ':sid' => $site['site_id']]);
$page = $p->fetch();
if (!$page) rc_fail('Page not found', 404);

$baseHref = RC_TEMPLATES_URL . '/' . $site['folder_slug'] . '/';

rc_ok([
  'page' => [
    'id' => (int)$page['id'],
    'filename' => $page['filename'],
    'title' => $page['title'],
    'page_json' => $page['page_json'] ? json_decode($page['page_json'], true) : null,
    'page_html' => $page['page_html']
  ],
  'base_href' => $baseHref
]);
