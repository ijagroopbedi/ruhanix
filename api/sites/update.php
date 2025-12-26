<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') rc_fail('Method not allowed', 405);

$pdo = rc_pdo();
$body = rc_read_json();

$siteKey = trim((string)($body['site'] ?? ''));
if (!preg_match('/^[a-f0-9]{32}$/i', $siteKey)) rc_fail('Invalid site key', 400);

$title = isset($body['title']) ? trim((string)$body['title']) : null;
$brand = isset($body['brand']) && is_array($body['brand']) ? $body['brand'] : null;

$stmt = $pdo->prepare("SELECT id, site_json FROM sites WHERE site_key=:k LIMIT 1");
$stmt->execute([':k' => $siteKey]);
$site = $stmt->fetch();
if (!$site) rc_fail('Site not found', 404);

$siteJson = [];
if (!empty($site['site_json'])) {
  $decoded = json_decode($site['site_json'], true);
  if (is_array($decoded)) $siteJson = $decoded;
}

if (!isset($siteJson['settings']) || !is_array($siteJson['settings'])) {
  $siteJson['settings'] = [];
}

if ($brand) {
  $siteJson['settings']['brand'] = $brand;
  $siteJson['settings']['updated_at'] = gmdate('c');
}

$updates = [];
$params = [':id' => $site['id']];

if ($title !== null && $title !== '') {
  $updates[] = "title = :title";
  $params[':title'] = $title;
}

if ($brand) {
  $updates[] = "site_json = :json";
  $params[':json'] = json_encode($siteJson, JSON_UNESCAPED_SLASHES);
}

if (!$updates) rc_ok(['updated' => false]);

$sql = "UPDATE sites SET " . implode(", ", $updates) . " WHERE id=:id LIMIT 1";
$upd = $pdo->prepare($sql);
$upd->execute($params);

rc_ok(['updated' => true]);
