<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/helpers.php';

start_session();
$pdo = db();

$tid = (int)($_GET['tid'] ?? 0);
if ($tid <= 0 && !empty($_COOKIE['rc_tid'])) $tid = (int)$_COOKIE['rc_tid'];
if ($tid <= 0) $tid = (int)($_SESSION['selected_template_id'] ?? 0);

if ($tid <= 0) json_out(["ok"=>false, "error"=>"No template selected"]);

$raw = file_get_contents("php://input");
$payload = json_decode($raw, true);
if (!$payload || !isset($payload['draft'])) {
  json_out(["ok"=>false, "error"=>"Invalid JSON body"]);
}

$draftJson = json_encode($payload['draft'], JSON_UNESCAPED_SLASHES);
$sessionId = session_id();

$sql = "INSERT INTO template_drafts (session_id, template_id, draft_json)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE draft_json = VALUES(draft_json), updated_at = CURRENT_TIMESTAMP";

$stmt = $pdo->prepare($sql);
$stmt->execute([$sessionId, $tid, $draftJson]);

json_out(["ok"=>true]);
