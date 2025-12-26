document.addEventListener("DOMContentLoaded", function () {
  function loadComponent(targetId, url) {
    var container = document.getElementById(targetId);
    if (!container) return;
    fetch(url)
      .then(function (res) { return res.text(); })
      .then(function (html) { container.innerHTML = html; })
      .catch(function () { /* silent fail */ });
  }

  loadComponent("header", "components/header.html");
  loadComponent("footer", "components/footer.html");
});
