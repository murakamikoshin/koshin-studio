(function () {
  var $ = function (id) { return document.getElementById(id); };
  var out = $('out');
  var yen = function (x) { return Math.round(x).toLocaleString('ja-JP') + ' 円'; };
  var pct = function (x) { return x * 100 >= 99.95 ? '99.9%以上' : (x * 100).toFixed(1) + '%'; };
  function num(id) { var v = $(id).value; return v === '' ? null : Number(v); }
  function render() {
    var p = num('p'), k = num('k'), N = num('N'), price = num('price'), m = num('m');
    if (!p || p < 0.001 || p > 100) { out.innerHTML = '<p class="note">排出率は、0.001〜100（％）で入れてください。</p>'; return; }
    if (!k || k < 1 || k > 10 || k !== Math.floor(k)) { out.innerHTML = '<p class="note">欲しい個数は、1〜10 の整数で入れてください。</p>'; return; }
    if (N !== null && (N < 2 || N > 500 || N !== Math.floor(N))) { out.innerHTML = '<p class="note">天井は、2〜500 の整数で入れてください（無ければ空のままに）。</p>'; return; }
    if (!N && p < 0.05 && k > 3) { out.innerHTML = '<p class="note">排出率が低くて個数が多いと、計算が重くなります。個数を減らすか、天井を入れてください。</p>'; return; }
    var r = window.rateCalc(p / 100, k, N || 0);
    var cost = function (t) { return price ? '（' + yen(t * price) + '）' : ''; };
    var h = '<div class="calc-main"><p>平均で</p><p class="big">' + r.expected.toFixed(1) + ' 回</p>' +
      (price ? '<p>' + yen(r.expected * price) + '</p>' : '') + '</div><ul>' +
      '<li>半分の人が当たるのは <strong>' + r.p50 + ' 回</strong>' + cost(r.p50) + '</li>' +
      '<li>9 割の人が当たるのは <strong>' + r.p90 + ' 回</strong>' + cost(r.p90) + '</li>' +
      '<li>99% の人が当たるのは <strong>' + r.p99 + ' 回</strong>' + cost(r.p99) + '</li>';
    if (N) h += '<li>1 個目が、天井の手前（' + (N - 1) + ' 回）まで出ない確率は <strong>' + pct(r.reachPity) + '</strong></li>' +
      '<li>どんなに運が悪くても、最大で ' + (k * N) + ' 回' + cost(k * N) + ' で、' + k + ' 個そろいます。</li>';
    if (m !== null && m >= 0) h += '<li>' + Math.floor(m) + ' 回回して、' + k + ' 個以上そろう確率は <strong>' + pct(r.within(Math.floor(m))) + '</strong></li>';
    out.innerHTML = h + '</ul>';
  }
  ['p', 'k', 'N', 'price', 'm'].forEach(function (id) { $(id).addEventListener('input', render); });
  render();
})();
