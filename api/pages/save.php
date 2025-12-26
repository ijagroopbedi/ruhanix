<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') rc_fail('Method not allowed', 405);

$pdo = rc_pdo();
$body = rc_read_json();

$siteKey = trim((string)($body['site'] ?? ''));
$pageId  = (int)($body['page_id'] ?? 0);
$pageJson = $body['page_json'] ?? null;
$pageHtml = $body['page_html'] ?? null;

if (!preg_match('/^[a-f0-9]{32}$/i', $siteKey)) rc_fail('Invalid site key', 400);
if (!$pageId) rc_fail('page_id required', 400);
if (!is_string($pageHtml) || $pageHtml === '') rc_fail('page_html required', 400);

$stmt = $pdo->prepare("SELECT id FROM sites WHERE site_key=:k LIMIT 1");
$stmt->execute([':k' => $siteKey]);
$site = $stmt->fetch();
if (!$site) rc_fail('Site not found', 404);

$p = $pdo->prepare("SELECT id, page_json, page_html FROM pages WHERE id=:pid AND site_id=:sid LIMIT 1");
$p->execute([':pid' => $pageId, ':sid' => $site['id']]);
$existing = $p->fetch();
if (!$existing) rc_fail('Page not found', 404);

$pdo->beginTransaction();
try {
  $r = $pdo->prepare("SELECT COALESCE(MAX(revision_no),0) AS mx FROM page_revisions WHERE page_id=:pid");
  $r->execute([':pid' => $pageId]);
  $revNo = (int)($r->fetch()['mx'] ?? 0) + 1;

  $ins = $pdo->prepare("INSERT INTO page_revisions (page_id, revision_no, page_json, page_html)
                        VALUES (:pid, :no, :j, :h)");
  $ins->execute([
    ':pid' => $pageId,
    ':no'  => $revNo,
    ':j'   => $existing['page_json'],
    ':h'   => $existing['page_html']
  ]);

  $upd = $pdo->prepare("UPDATE pages SET page_json=:j, page_html=:h WHERE id=:pid LIMIT 1");
  $upd->execute([
    ':j' => $pageJson ? json_encode($pageJson, JSON_UNESCAPED_SLASHES) : $existing['page_json'],
    ':h' => $pageHtml,
    ':pid' => $pageId
  ]);

  $pdo->commit();
} catch (Throwable $e) {
  $pdo->rollBack();
  rc_fail('Save failed: ' . $e->getMessage(), 500);
}

rc_ok(['saved' => true]);
