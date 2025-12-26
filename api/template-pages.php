<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/helpers.php';

start_session();
$pdo = db();

$tid = (int)($_GET['tid'] ?? 0);
if ($tid <= 0 && !empty($_COOKIE['rc_tid'])) $tid = (int)$_COOKIE['rc_tid'];
if ($tid <= 0) $tid = (int)($_SESSION['selected_template_id'] ?? 0);

if ($tid <= 0) json_out(["ok"=>false, "error"=>"No template selected"]);

$stmt = $pdo->prepare("SELECT folder_slug, entry_file FROM templates WHERE id = ? LIMIT 1");
$stmt->execute([$tid]);
$t = $stmt->fetch();
if (!$t) json_out(["ok"=>false, "error"=>"Template not found"]);

$folderSlug = $t['folder_slug'];
$entryFile  = $t['entry_file'] ?: "index.html";

$dir = TEMPLATE_BASE_DIR . "/" . $folderSlug;
if (!is_dir($dir)) json_out(["ok"=>false, "error"=>"Template folder missing"]);

$files = [];
foreach (scandir($dir) as $f) {
  if (preg_match('/\.html$/i', $f)) $files[] = $f;
}
sort($files);

usort($files, function($a,$b) use ($entryFile){
  if ($a === $entryFile) return -1;
  if ($b === $entryFile) return 1;
  return strcmp($a,$b);
});

json_out(["ok"=>true, "pages"=>$files, "entry"=>$entryFile]);
