<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/helpers.php';

start_session();
$pdo = db();

$tid = get_tid();
if ($tid <= 0) json_out(["ok"=>false,"error"=>"No template selected"]);

$page = safe_html_file($_GET['page'] ?? 'index.html');
if (!$page) $page = 'index.html';

$t = template_row($pdo, $tid);
if (!$t) json_out(["ok"=>false,"error"=>"Template not found"]);

$sessionId = session_id();

// if already saved, return it
$stmt = $pdo->prepare("SELECT page_json FROM template_page_json
                       WHERE session_id=? AND template_id=? AND page_file=? LIMIT 1");
$stmt->execute([$sessionId, $tid, $page]);
$row = $stmt->fetch();
if ($row && $row['page_json']) {
  json_out(["ok"=>true, "page"=>$page, "json"=>json_decode($row['page_json'], true)]);
}

// else convert HTML -> JSON (template-specific mapper for fashion-minimal-light)
$folder = $t['folder_slug'];
$filePath = TEMPLATE_BASE_DIR . "/{$folder}/{$page}";
if (!is_file($filePath)) json_out(["ok"=>false,"error"=>"Page not found"]);

$html = file_get_contents($filePath);

// DOM parse
libxml_use_internal_errors(true);
$dom = new DOMDocument();
$dom->loadHTML($html);
$xp = new DOMXPath($dom);

function firstText(DOMXPath $xp, string $q): string {
  $n = $xp->query($q)->item(0);
  return $n ? trim($n->textContent) : "";
}
function firstAttr(DOMXPath $xp, string $q, string $attr): string {
  $n = $xp->query($q)->item(0);
  return ($n && $n->attributes && $n->attributes->getNamedItem($attr)) ? $n->attributes->getNamedItem($attr)->nodeValue : "";
}

// base fields
$title = "";
$tn = $dom->getElementsByTagName("title")->item(0);
if ($tn) $title = trim($tn->textContent);

// HERO
$heroPill = firstText($xp, "//section[".xpath_has_class("hero")."]//*[contains(@class,'pill')]//span[last()]");
$heroH1   = firstText($xp, "//section[".xpath_has_class("hero")."]//*[contains(@class,'h1')][1]");
$heroP    = firstText($xp, "//section[".xpath_has_class("hero")."]//*[contains(@class,'p')][1]");

$cta1Text = firstText($xp, "//section[".xpath_has_class("hero")."]//a[".xpath_has_class("btn")." and ".xpath_has_class("primary")."][1]");
$cta1Href = firstAttr($xp, "//section[".xpath_has_class("hero")."]//a[".xpath_has_class("btn")." and ".xpath_has_class("primary")."][1]", "href");

$cta2Text = firstText($xp, "//section[".xpath_has_class("hero")."]//a[".xpath_has_class("btn")." and not(".xpath_has_class("primary").")][1]");
$cta2Href = firstAttr($xp, "//section[".xpath_has_class("hero")."]//a[".xpath_has_class("btn")." and not(".xpath_has_class("primary").")][1]", "href");

$kpis = [];
$kpiNodes = $xp->query("//section[".xpath_has_class("hero")."]//*[contains(@class,'kpis')]//*[contains(@class,'kpi')]");
foreach ($kpiNodes as $k) {
  $b = "";
  $s = "";
  foreach ($k->childNodes as $ch) {
    if ($ch->nodeName === "b") $b = trim($ch->textContent);
    if ($ch->nodeName === "span") $s = trim($ch->textContent);
  }
  if ($b || $s) $kpis[] = ["value"=>$b, "label"=>$s];
}

// SHOP BY CATEGORY section (identified by #homeCats)
$shopH2 = firstText($xp, "//*[ @id='homeCats']/ancestor::section[1]//*[contains(@class,'h2')][1]");
$shopP  = firstText($xp, "//*[ @id='homeCats']/ancestor::section[1]//*[contains(@class,'p')][1]");
$shopLinkText = firstText($xp, "//*[ @id='homeCats']/ancestor::section[1]//a[".xpath_has_class("btn")."][1]");
$shopLinkHref = firstAttr($xp, "//*[ @id='homeCats']/ancestor::section[1]//a[".xpath_has_class("btn")."][1]", "href");

// FEATURED section (identified by #featuredGrid)
$featH2 = firstText($xp, "//*[ @id='featuredGrid']/ancestor::section[1]//*[contains(@class,'h2')][1]");
$featP  = firstText($xp, "//*[ @id='featuredGrid']/ancestor::section[1]//*[contains(@class,'p')][1]");
$featLinkText = firstText($xp, "//*[ @id='featuredGrid']/ancestor::section[1]//a[".xpath_has_class("btn")."][1]");
$featLinkHref = firstAttr($xp, "//*[ @id='featuredGrid']/ancestor::section[1]//a[".xpath_has_class("btn")."][1]", "href");

// NEWSLETTER section (find input.input)
$newsH2 = firstText($xp, "//*[contains(@class,'input')]/ancestor::section[1]//*[contains(@class,'h2')][1]");
$newsP  = firstText($xp, "//*[contains(@class,'input')]/ancestor::section[1]//*[contains(@class,'p')][1]");
$newsPlaceholder = firstAttr($xp, "//*[contains(@class,'input')][1]", "placeholder");
$newsBtnText = firstText($xp, "//*[contains(@class,'input')]/ancestor::section[1]//button[".xpath_has_class("btn")."][1]");

$json = [
  "meta" => ["title"=>$title, "page"=>$page],
  "hero" => [
    "pill"=>$heroPill, "h1"=>$heroH1, "p"=>$heroP,
    "ctaPrimary"=>["text"=>$cta1Text,"href"=>$cta1Href],
    "ctaSecondary"=>["text"=>$cta2Text,"href"=>$cta2Href],
    "kpis"=>$kpis
  ],
  "sections" => [
    "shopByCategory" => ["h2"=>$shopH2, "p"=>$shopP, "link"=>["text"=>$shopLinkText,"href"=>$shopLinkHref]],
    "featured" => ["h2"=>$featH2, "p"=>$featP, "link"=>["text"=>$featLinkText,"href"=>$featLinkHref]],
    "newsletter" => ["h2"=>$newsH2, "p"=>$newsP, "placeholder"=>$newsPlaceholder, "buttonText"=>$newsBtnText]
  ]
];

// save initial JSON so future loads are fast
$save = $pdo->prepare("INSERT INTO template_page_json(session_id, template_id, page_file, page_json)
                       VALUES(?,?,?,?)
                       ON DUPLICATE KEY UPDATE page_json=VALUES(page_json), updated_at=CURRENT_TIMESTAMP");
$save->execute([$sessionId, $tid, $page, json_encode($json, JSON_UNESCAPED_SLASHES)]);

json_out(["ok"=>true, "page"=>$page, "json"=>$json]);
