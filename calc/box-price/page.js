(function () {
  var $ = function (id) { return document.getElementById(id); };
  var out = $('out');
  var yen = function (x) { return Math.round(x).toLocaleString('ja-JP') + ' 円'; };
  var PRESET = { '': null, pokemon: 30, mtg: 30, yugioh: 30, onepiece: 24, digimon: 24, gundam: 24, unionarena: 16, duelmasters: 16, weiss: 12, hololive: 12, vobaca: 18 };
  function num(id) { var v = $(id).value; return v === '' ? null : Number(v); }
  $('genre').addEventListener('change', function () {
    var n = PRESET[$('genre').value];
    if (n) $('packs').value = n;
    render();
  });
  function render() {
    var price = num('price'), packs = num('packs'), retail = num('retail'), ship = num('ship') || 0;
    if (!price || price <= 0) { out.innerHTML = '<p class="note">支払う金額（円）を入れてください。</p>'; return; }
    if (!packs || packs < 1 || packs > 200 || packs !== Math.floor(packs)) { out.innerHTML = '<p class="note">パック数は、1 から 200 までの整数で入れてください。</p>'; return; }
    var r = window.boxPriceCalc({ price: price, packs: packs, retailPack: retail, shipping: ship });
    var h = '<div class="calc-main"><p>1 パックあたり</p><p class="big">' + yen(r.perPack) + '</p><p>合計 ' + yen(r.total) + '（' + packs + ' パック）</p></div>';
    if (retail > 0) {
      var pct = (r.ratio * 100);
      h += '<ul><li>1 パックの定価 ' + yen(retail) + ' に対して、<strong>' + (Math.round(r.ratio * 100) / 100).toFixed(2) + ' 倍</strong>（' + pct.toFixed(0) + '%）</li>' +
        '<li>この数のパックの定価の合計は ' + yen(r.retailBox) + '。差は <strong>' + (r.diff >= 0 ? '+' : '−') + yen(Math.abs(r.diff)) + '</strong></li></ul>';
    } else {
      h += '<p class="note">1 パックの定価を入れると、定価との比べ方も出ます。</p>';
    }
    out.innerHTML = h;
  }
  ['price', 'packs', 'retail', 'ship'].forEach(function (id) { $(id).addEventListener('input', render); });
  render();
})();
