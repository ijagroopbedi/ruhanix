<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/helpers.php';

start_session();
$pdo = db();

$tid = get_tid();
if ($tid <= 0) json_out(["ok"=>false,"error"=>"No template selected"]);

$page = safe_html_file($_GET['page'] ?? '');
if (!$page) json_out(["ok"=>false,"error"=>"Invalid page"]);

$raw = file_get_contents("php://input");
$payload = json_decode($raw, true);
if (!$payload || !isset($payload['json'])) json_out(["ok"=>false,"error"=>"Invalid JSON body"]);

$sessionId = session_id();
$stmt = $pdo->prepare("INSERT INTO template_page_json(session_id, template_id, page_file, page_json)
                       VALUES(?,?,?,?)
                       ON DUPLICATE KEY UPDATE page_json=VALUES(page_json), updated_at=CURRENT_TIMESTAMP");
$stmt->execute([$sessionId, $tid, $page, json_encode($payload['json'], JSON_UNESCAPED_SLASHES)]);

json_out(["ok"=>true]);
