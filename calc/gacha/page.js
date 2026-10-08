(function () {
  var $ = function (id) { return document.getElementById(id); };
  var out = $('out');
  var yen = function (x) { return Math.round(x).toLocaleString('ja-JP') + ' 円'; };
  var pct = function (x) { return x * 100 >= 99.95 ? '99.9%以上' : (x * 100).toFixed(1) + '%'; };
  function num(id) { var v = $(id).value; return v === '' ? null : Number(v); }
  function render() {
    var n = num('n'), k = num('k') || 0, price = num('price'), set = num('set'), m = num('m');
    if (!n || n < 2 || n > 100 || n !== Math.floor(n)) { out.innerHTML = '<p class="note">種類の数は、2〜100 の整数で入れてください。</p>'; return; }
    if (k < 0 || k >= n || k !== Math.floor(k)) { out.innerHTML = '<p class="note">持っている種類は、0 以上で、種類の数より少ない整数で入れてください（全部持っていれば、もう揃っています）。</p>'; return; }
    var r = window.gachaCalc(n, k);
    var h = '<div class="calc-main"><p>平均で</p><p class="big">' + r.expected.toFixed(1) + ' 回</p>' +
      (price ? '<p>' + yen(r.expected * price) + '</p>' : '') + '</div><ul>' +
      '<li>そのうち、ダブり（持っている種類がもう一度出る）は、平均で約 ' + r.expectedDup.toFixed(1) + ' 回。</li>' +
      '<li>半分の人が揃うのは <strong>' + r.p50 + ' 回</strong>' + (price ? '（' + yen(r.p50 * price) + '）' : '') + '</li>' +
      '<li>9 割の人が揃うのは <strong>' + r.p90 + ' 回</strong>' + (price ? '（' + yen(r.p90 * price) + '）' : '') + '</li>' +
      '<li>99% の人が揃うのは <strong>' + r.p99 + ' 回</strong>' + (price ? '（' + yen(r.p99 * price) + '）' : '') + '</li>';
    if (m !== null && m >= 0) h += '<li>' + Math.floor(m) + ' 回回して、全種類が揃う確率は <strong>' + pct(r.within(Math.floor(m))) + '</strong></li>';
    if (set && price) {
      var cnt = Math.floor(set / price), p = r.within(cnt);
      h += '<li>セットの ' + yen(set) + ' は、' + cnt + ' 回ぶんです。同じ金額を回して全種類が揃う確率は <strong>' + pct(p) + '</strong>。平均の費用は ' + yen(r.expected * price) + ' なので、セットのほうが' +
        (set < r.expected * price ? '<strong>安い</strong>' : '高い') + 'です。</li>';
    }
    out.innerHTML = h + '</ul>';
  }
  ['n', 'k', 'price', 'set', 'm'].forEach(function (id) { $(id).addEventListener('input', render); });
  render();
})();
