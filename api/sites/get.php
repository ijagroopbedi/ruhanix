<?php
require_once __DIR__ . '/../_bootstrap.php';

$pdo = rc_pdo();
$siteParam = trim($_GET['site'] ?? '');
if (!$siteParam) rc_fail('site required', 400);

$isKey = (bool)preg_match('/^[a-f0-9]{32}$/i', $siteParam);

$sql = $isKey
  ? "SELECT s.*, t.folder_slug, t.category AS template_category
     FROM sites s JOIN templates t ON t.id=s.template_id
     WHERE s.site_key=:v LIMIT 1"
  : "SELECT s.*, t.folder_slug, t.category AS template_category
     FROM sites s JOIN templates t ON t.id=s.template_id
     WHERE s.slug=:v LIMIT 1";

$stmt = $pdo->prepare($sql);
$stmt->execute([':v' => $siteParam]);
$site = $stmt->fetch();
if (!$site) rc_fail('Site not found', 404);

$p = $pdo->prepare("SELECT id, filename, title, updated_at
                    FROM pages
                    WHERE site_id=:sid
                    ORDER BY (filename='index.html') DESC, filename ASC");
$p->execute([':sid' => $site['id']]);
$pages = $p->fetchAll();

$folderUrl = RC_TEMPLATES_URL . '/' . $site['folder_slug'] . '/';

$settings = [];
if (!empty($site['site_json'])) {
  $decoded = json_decode($site['site_json'], true);
  if (is_array($decoded) && isset($decoded['settings']) && is_array($decoded['settings'])) {
    $settings = $decoded['settings'];
  }
}

rc_ok([
  'site' => [
    'site_key' => $site['site_key'],
    'slug' => $site['slug'],
    'title' => $site['title'],
    'category_theme' => $site['category_theme'],
    'template_category' => $site['template_category'],
    'template_folder_url' => $folderUrl,
    'status' => $site['status'],
    'published_at' => $site['published_at'],
    'settings' => $settings
  ],
  'pages' => array_map(function($x){
    return [
      'id' => (int)$x['id'],
      'filename' => $x['filename'],
      'title' => $x['title'],
      'updated_at' => $x['updated_at']
    ];
  }, $pages)
]);
