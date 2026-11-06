(function () {
  var $ = function (id) { return document.getElementById(id); };
  var out = $('out');
  /* 日本語と英語のページで同じ script を使う。言語は <html lang> で決める */
  var EN = /^en/.test(document.documentElement.lang || '');
  var T = EN ? {
    yen: function (x) { return '¥' + Math.round(x).toLocaleString('en-US'); },
    errPrice: 'Enter the amount you pay (yen).',
    errPacks: 'Enter the number of packs as a whole number from 1 to 200.',
    perPack: 'Per pack', total: function (t, n) { return 'Total ' + t + ' (' + n + ' packs)'; },
    ratio: function (retail, x, pct) { return 'Against the list price of ' + retail + ' per pack: <strong>' + x + '×</strong> (' + pct + '%)'; },
    diff: function (sum, d) { return 'List price for this many packs: ' + sum + '. Difference: <strong>' + d + '</strong>'; },
    noRetail: 'Enter the list price per pack to compare against it.'
  } : {
    yen: function (x) { return Math.round(x).toLocaleString('ja-JP') + ' 円'; },
    errPrice: '支払う金額（円）を入れてください。',
    errPacks: 'パック数は、1 から 200 までの整数で入れてください。',
    perPack: '1 パックあたり', total: function (t, n) { return '合計 ' + t + '（' + n + ' パック）'; },
    ratio: function (retail, x, pct) { return '1 パックの定価 ' + retail + ' に対して、<strong>' + x + ' 倍</strong>（' + pct + '%）'; },
    diff: function (sum, d) { return 'この数のパックの定価の合計は ' + sum + '。差は <strong>' + d + '</strong>'; },
    noRetail: '1 パックの定価を入れると、定価との比べ方も出ます。'
  };
  var PRESET = { '': null, pokemon: 30, mtg: 30, yugioh: 30, onepiece: 24, digimon: 24, gundam: 24, unionarena: 16, duelmasters: 16, weiss: 12, hololive: 12, vobaca: 18 };
  function num(id) { var v = $(id).value; return v === '' ? null : Number(v); }
  $('genre').addEventListener('change', function () {
    var n = PRESET[$('genre').value];
    if (n) $('packs').value = n;
    render();
  });
  function render() {
    var price = num('price'), packs = num('packs'), retail = num('retail'), ship = num('ship') || 0;
    if (!price || price <= 0) { out.innerHTML = '<p class="note">' + T.errPrice + '</p>'; return; }
    if (!packs || packs < 1 || packs > 200 || packs !== Math.floor(packs)) { out.innerHTML = '<p class="note">' + T.errPacks + '</p>'; return; }
    var r = window.boxPriceCalc({ price: price, packs: packs, retailPack: retail, shipping: ship });
    var h = '<div class="calc-main"><p>' + T.perPack + '</p><p class="big">' + T.yen(r.perPack) + '</p><p>' + T.total(T.yen(r.total), packs) + '</p></div>';
    if (retail > 0) {
      var pct = (r.ratio * 100);
      h += '<ul><li>' + T.ratio(T.yen(retail), (Math.round(r.ratio * 100) / 100).toFixed(2), pct.toFixed(0)) + '</li>' +
        '<li>' + T.diff(T.yen(r.retailBox), (r.diff >= 0 ? '+' : '−') + T.yen(Math.abs(r.diff))) + '</li></ul>';
    } else {
      h += '<p class="note">' + T.noRetail + '</p>';
    }
    out.innerHTML = h;
  }
  ['price', 'packs', 'retail', 'ship'].forEach(function (id) { $(id).addEventListener('input', render); });
  render();
})();
