<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

$category = strtolower(trim($_GET['category'] ?? 'all'));
$sort     = strtolower(trim($_GET['sort'] ?? 'recommended'));
$search   = trim($_GET['search'] ?? '');

$offset = max(0, (int)($_GET['offset'] ?? 0));
$limit  = clamp_int($_GET['limit'] ?? 9, 1, 30, 9);

$where = [];
$params = [];

if ($category !== 'all' && $category !== '') {
  $where[] = "category = ?";
  $params[] = $category;
}

if ($search !== '') {
  $where[] = "(title LIKE ? OR keywords LIKE ? OR slug LIKE ?)";
  $like = "%" . $search . "%";
  $params[] = $like; $params[] = $like; $params[] = $like;
}

$whereSql = $where ? ("WHERE " . implode(" AND ", $where)) : "";

$orderBy = "is_featured_home DESC, featured_order ASC, rating DESC, rating_count DESC, id DESC";
if ($sort === 'new') $orderBy = "created_at DESC, id DESC";
if ($sort === 'top') $orderBy = "rating DESC, rating_count DESC, id DESC";

$pdo = db();

$countStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM templates $whereSql");
$countStmt->execute($params);
$total = (int)($countStmt->fetch()['c'] ?? 0);

$dataStmt = $pdo->prepare("SELECT id, slug, title, category, folder_slug, entry_file, thumbnail_file, preview_label, rating, rating_count, is_free
                           FROM templates
                           $whereSql
                           ORDER BY $orderBy
                           LIMIT $offset, $limit");
$dataStmt->execute($params);
$rows = $dataStmt->fetchAll();

$out = [];
foreach ($rows as $t) {
  $folder = $t['folder_slug'];
  $entry  = $t['entry_file'] ?: 'index.html';
  $thumb  = $t['thumbnail_file'] ?: 'thumbnail.jpg';

  $t['file_url']  = APP_BASE . "/uploads/template/$folder/$entry";
  $t['image_url'] = APP_BASE . "/uploads/template/$folder/$thumb";
  $out[] = $t;
}

json_out([
  "ok" => true,
  "total" => $total,
  "templates" => $out
]);
