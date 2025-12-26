<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

$limit = clamp_int($_GET['limit'] ?? 6, 1, 24, 6);

$sql = "SELECT id, slug, title, category, folder_slug, entry_file, thumbnail_file, preview_label, rating, rating_count, is_free
        FROM templates
        WHERE is_featured_home = 1
        ORDER BY featured_order ASC, rating DESC, rating_count DESC, id DESC
        LIMIT $limit";

$rows = db()->query($sql)->fetchAll();

$out = [];
foreach ($rows as $t) {
  $folder = $t['folder_slug'];
  $entry  = $t['entry_file'] ?: 'index.html';
  $thumb  = $t['thumbnail_file'] ?: 'thumbnail.jpg';

  $t['file_url']  = APP_BASE . "/uploads/template/$folder/$entry";
  $t['image_url'] = APP_BASE . "/uploads/template/$folder/$thumb";
  $out[] = $t;
}

json_out(["ok"=>true, "templates"=>$out]);
