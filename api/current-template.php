<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/helpers.php';

start_session();
$pdo = db();

$tid = (int)($_GET['tid'] ?? 0);

// ✅ fallback: cookie
if ($tid <= 0 && !empty($_COOKIE['rc_tid'])) {
  $tid = (int)$_COOKIE['rc_tid'];
}

// ✅ fallback: session
if ($tid <= 0) {
  $tid = (int)($_SESSION['selected_template_id'] ?? 0);
}

if ($tid <= 0) {
  json_out(["ok"=>false, "error"=>"No template selected"]);
}

// validate template exists
$stmt = $pdo->prepare("SELECT id, slug, title, category, folder_slug, entry_file, thumbnail_file, preview_label
                       FROM templates WHERE id = ? LIMIT 1");
$stmt->execute([$tid]);
$t = $stmt->fetch();

if (!$t) {
  json_out(["ok"=>false, "error"=>"Template not found"]);
}

// refresh session + cookie
$_SESSION['selected_template_id'] = (int)$t['id'];
$_SESSION['selected_template_slug'] = (string)$t['slug'];
set_selected_template_cookie((int)$t['id']);

$folder = $t['folder_slug'];
$entry  = $t['entry_file'] ?: 'index.html';
$thumb  = $t['thumbnail_file'] ?: 'thumbnail.jpg';

$t['file_url']  = APP_BASE . "/uploads/template/$folder/$entry";
$t['image_url'] = APP_BASE . "/uploads/template/$folder/$thumb";

// draft by session_id + template_id
$sessionId = session_id();
$dstmt = $pdo->prepare("SELECT draft_json FROM template_drafts WHERE session_id = ? AND template_id = ? LIMIT 1");
$dstmt->execute([$sessionId, (int)$t['id']]);
$row = $dstmt->fetch();

$draft = null;
if ($row && $row['draft_json']) $draft = json_decode($row['draft_json'], true);

json_out(["ok"=>true, "template"=>$t, "draft"=>$draft]);
