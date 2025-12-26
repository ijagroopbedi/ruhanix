<?php
require_once __DIR__ . '/../_bootstrap.php';

$pdo = rc_pdo();
$id = rc_int($_GET['id'] ?? 0, 1, 999999999, 0);
if (!$id) rc_fail('Missing id', 400);

$stmt = $pdo->prepare("SELECT * FROM templates WHERE id = :id LIMIT 1");
$stmt->execute([':id' => $id]);
$t = $stmt->fetch();
if (!$t) rc_fail('Template not found', 404);

$folder = trim($t['folder_slug']);
$entry  = trim($t['entry_file'] ?: 'index.html');
$thumb  = trim($t['thumbnail_file'] ?: 'thumbnail.jpg');

rc_ok([
  'template' => [
    'id' => (int)$t['id'],
    'slug' => $t['slug'],
    'title' => $t['title'],
    'category' => $t['category'],
    'keywords' => $t['keywords'],
    'rating' => (float)$t['rating'],
    'rating_count' => (int)$t['rating_count'],
    'is_free' => (int)$t['is_free'],
    'preview_label' => $t['preview_label'] ?: ($t['is_free'] ? 'Free' : 'Paid'),
    'file_url' => RC_TEMPLATES_URL . "/$folder/$entry",
    'image_url' => RC_TEMPLATES_URL . "/$folder/$thumb",
    'folder_url' => RC_TEMPLATES_URL . "/$folder/"
  ]
]);
