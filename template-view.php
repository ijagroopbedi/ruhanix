<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/helpers.php';

start_session();

$slug = clean_slug($_GET['slug'] ?? '');
if (!$slug) { http_response_code(400); echo "Missing slug"; exit; }

$page = $_GET['page'] ?? '';
$page = $page ? safe_html_file($page) : '';

$stmt = db()->prepare("SELECT folder_slug, entry_file FROM templates WHERE slug = ? LIMIT 1");
$stmt->execute([$slug]);
$t = $stmt->fetch();
if (!$t) { http_response_code(404); echo "Template not found"; exit; }

$folderSlug = $t['folder_slug'];
$entryFile  = $t['entry_file'] ?: "index.html";
$fileName   = $page ?: $entryFile;

$dir = TEMPLATE_BASE_DIR . "/" . $folderSlug;
$filePath = $dir . "/" . $fileName;

if (!is_file($filePath) || !realpath_inside($dir, $filePath)) {
  http_response_code(404); echo "Page not found"; exit;
}

$html = file_get_contents($filePath);

$baseHref  = APP_BASE . "/uploads/template/" . $folderSlug . "/";
$bridgeSrc = APP_BASE . "/admin-bridge.js";

$injectHead = '<base href="'.htmlspecialchars($baseHref).'">';

if (stripos($html, '<head') !== false) {
  $html = preg_replace('/<head[^>]*>/i', '$0' . "\n" . $injectHead . "\n", $html, 1);
} else {
  $html = $injectHead . "\n" . $html;
}

$injectScript = '
<script>
window.__RUHANIX_TEMPLATE = { slug: "'.htmlspecialchars($slug).'", baseHref: "'.htmlspecialchars($baseHref).'" };
</script>
<script src="'.htmlspecialchars($bridgeSrc).'"></script>
';

if (stripos($html, '</body>') !== false) {
  $html = preg_replace('/<\/body>/i', $injectScript . "\n</body>", $html, 1);
} else {
  $html .= $injectScript;
}

header('Content-Type: text/html; charset=utf-8');
echo $html;
