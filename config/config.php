<?php
// ✅ DB creds
define('DB_HOST', 'localhost');
define('DB_NAME', 'ruhanixc_websitebuilder');
define('DB_USER', 'ruhanixc_ruhanixcreations_roop');
define('DB_PASS', '@jagroop1234');

// ✅ auto detect base path like /beta/ruhanix
$projectRoot = realpath(__DIR__ . '/..');
$docRoot     = realpath($_SERVER['DOCUMENT_ROOT'] ?? '');

$base = '';
if ($docRoot && $projectRoot && strpos($projectRoot, $docRoot) === 0) {
  $base = str_replace('\\', '/', substr($projectRoot, strlen($docRoot)));
}
$base = '/' . trim($base, '/');
if ($base === '/') $base = '';

define('APP_BASE', $base);

// filesystem path
define('TEMPLATE_BASE_DIR', $projectRoot . '/uploads/template');