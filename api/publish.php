<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/helpers.php';

start_session();
$pdo = db();

$tid = get_tid();
if ($tid <= 0) json_out(["ok"=>false,"error"=>"No template selected"]);

$t = template_row($pdo, $tid);
if (!$t) json_out(["ok"=>false,"error"=>"Template not found"]);

$folder = $t['folder_slug'];
$templateDir = TEMPLATE_BASE_DIR . "/{$folder}";
if (!is_dir($templateDir)) json_out(["ok"=>false,"error"=>"Template folder missing"]);

$sessionId = session_id();
$siteKey = substr(hash('sha256', $sessionId . '|' . $tid), 0, 18);

// publish dir
$publishDir = PUBLISH_BASE_DIR . "/{$siteKey}";
if (!is_dir($publishDir)) mkdir($publishDir, 0755, true);

// copy whole template folder to publish
function copy_dir($src, $dst) {
  if (!is_dir($dst)) mkdir($dst, 0755, true);
  foreach (scandir($src) as $f) {
    if ($f === '.' || $f === '..') continue;
    $s = $src . "/" . $f;
    $d = $dst . "/" . $f;
    if (is_dir($s)) copy_dir($s, $d);
    else copy($s, $d);
  }
}
copy_dir($templateDir, $publishDir);

// for each html file, apply stored JSON
$pages = [];
foreach (scandir($publishDir) as $f) if (preg_match('/\.html$/i', $f)) $pages[] = $f;

foreach ($pages as $pageFile) {
  // load stored json
  $stmt = $pdo->prepare("SELECT page_json FROM template_page_json
                         WHERE session_id=? AND template_id=? AND page_file=? LIMIT 1");
  $stmt->execute([$sessionId, $tid, $pageFile]);
  $row = $stmt->fetch();
  if (!$row || !$row['page_json']) continue;

  $json = json_decode($row['page_json'], true);
  if (!$json) continue;

  $path = $publishDir . "/" . $pageFile;
  $html = file_get_contents($path);

  libxml_use_internal_errors(true);
  $dom = new DOMDocument();
  $dom->loadHTML($html);
  $xp = new DOMXPath($dom);

  // helper setters
  $setText = function(string $q, string $text) use ($xp) {
    $n = $xp->query($q)->item(0);
    if ($n && $text !== "") $n->nodeValue = $text;
  };
  $setAttr = function(string $q, string $attr, string $val) use ($xp) {
    $n = $xp->query($q)->item(0);
    if ($n && $val !== "") $n->setAttribute($attr, $val);
  };

  // title
  if (!empty($json['meta']['title'])) {
    $tn = $dom->getElementsByTagName("title")->item(0);
    if ($tn) $tn->nodeValue = $json['meta']['title'];
  }

  // hero
  $setText("//section[".xpath_has_class("hero")."]//*[contains(@class,'pill')]//span[last()]", $json['hero']['pill'] ?? "");
  $setText("//section[".xpath_has_class("hero")."]//*[contains(@class,'h1')][1]", $json['hero']['h1'] ?? "");
  $setText("//section[".xpath_has_class("hero")."]//*[contains(@class,'p')][1]", $json['hero']['p'] ?? "");

  $setText("//section[".xpath_has_class("hero")."]//a[".xpath_has_class("btn")." and ".xpath_has_class("primary")."][1]", $json['hero']['ctaPrimary']['text'] ?? "");
  $setAttr("//section[".xpath_has_class("hero")."]//a[".xpath_has_class("btn")." and ".xpath_has_class("primary")."][1]", "href", $json['hero']['ctaPrimary']['href'] ?? "");

  $setText("//section[".xpath_has_class("hero")."]//a[".xpath_has_class("btn")." and not(".xpath_has_class("primary").")][1]", $json['hero']['ctaSecondary']['text'] ?? "");
  $setAttr("//section[".xpath_has_class("hero")."]//a[".xpath_has_class("btn")." and not(".xpath_has_class("primary").")][1]", "href", $json['hero']['ctaSecondary']['href'] ?? "");

  // shopByCategory
  $setText("//*[ @id='homeCats']/ancestor::section[1]//*[contains(@class,'h2')][1]", $json['sections']['shopByCategory']['h2'] ?? "");
  $setText("//*[ @id='homeCats']/ancestor::section[1]//*[contains(@class,'p')][1]", $json['sections']['shopByCategory']['p'] ?? "");
  $setText("//*[ @id='homeCats']/ancestor::section[1]//a[".xpath_has_class("btn")."][1]", $json['sections']['shopByCategory']['link']['text'] ?? "");
  $setAttr("//*[ @id='homeCats']/ancestor::section[1]//a[".xpath_has_class("btn")."][1]", "href", $json['sections']['shopByCategory']['link']['href'] ?? "");

  // featured
  $setText("//*[ @id='featuredGrid']/ancestor::section[1]//*[contains(@class,'h2')][1]", $json['sections']['featured']['h2'] ?? "");
  $setText("//*[ @id='featuredGrid']/ancestor::section[1]//*[contains(@class,'p')][1]", $json['sections']['featured']['p'] ?? "");
  $setText("//*[ @id='featuredGrid']/ancestor::section[1]//a[".xpath_has_class("btn")."][1]", $json['sections']['featured']['link']['text'] ?? "");
  $setAttr("//*[ @id='featuredGrid']/ancestor::section[1]//a[".xpath_has_class("btn")."][1]", "href", $json['sections']['featured']['link']['href'] ?? "");

  // newsletter
  $setText("//*[contains(@class,'input')]/ancestor::section[1]//*[contains(@class,'h2')][1]", $json['sections']['newsletter']['h2'] ?? "");
  $setText("//*[contains(@class,'input')]/ancestor::section[1]//*[contains(@class,'p')][1]", $json['sections']['newsletter']['p'] ?? "");
  $setAttr("//*[contains(@class,'input')][1]", "placeholder", $json['sections']['newsletter']['placeholder'] ?? "");
  $setText("//*[contains(@class,'input')]/ancestor::section[1]//button[".xpath_has_class("btn")."][1]", $json['sections']['newsletter']['buttonText'] ?? "");

  file_put_contents($path, $dom->saveHTML());
}

$publishUrl = APP_BASE . "/user_sites/{$siteKey}/" . ($t['entry_file'] ?: 'index.html');
json_out(["ok"=>true, "url"=>$publishUrl]);
