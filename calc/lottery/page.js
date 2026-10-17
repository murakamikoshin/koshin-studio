(function () {
  var $ = function (id) { return document.getElementById(id); };
  var out = $('out');
  var fmt = function (x) {
    var v = x * 100;
    if (v >= 99.995) return '99.99% 超';
    if (v < 0.05 && v > 0) return '0.1% 未満';
    return v.toFixed(1) + '%';
  };
  function num(id) { var v = $(id).value; return v === '' ? null : Number(v); }
  function listPs() {
    var raw = $('list').value.trim();
    if (!raw) return null;
    var parts = raw.split(/[,、，\s]+/).filter(Boolean).map(Number);
    return parts;
  }
  function render() {
    var ps, label;
    var list = listPs();
    if (list) {
      if (list.length > 200 || list.some(function (v) { return !(v > 0 && v <= 100); })) {
        out.innerHTML = '<p class="note">応募先ごとの当選確率は、0 より大きく 100 以下の数（％）を、カンマか空白で区切って入れてください。</p>';
        return;
      }
      ps = list.map(function (v) { return v / 100; });
      label = '応募先 ' + ps.length + ' 件（確率はそれぞれ別）';
    } else {
      var bairitsu = num('mult'), p = num('p'), n = num('n');
      if (bairitsu !== null && bairitsu > 0) p = 100 / bairitsu;
      if (!p || p <= 0 || p > 100) { out.innerHTML = '<p class="note">当選確率（％）か、倍率を入れてください。</p>'; return; }
      if (!n || n < 1 || n > 200 || n !== Math.floor(n)) { out.innerHTML = '<p class="note">応募する回数は、1 から 200 までの整数で入れてください。</p>'; return; }
      ps = new Array(n).fill(p / 100);
      label = '当選確率 ' + (Math.round(p * 100) / 100) + '% の抽選に ' + n + ' 回応募';
    }
    var r = window.lotteryCalc(ps);
    var k = Math.max(1, Math.min(num('k') || 1, ps.length));
    var h = '<div class="calc-main"><p>' + label + '</p><p>1 つ以上、当たる確率</p><p class="big">' + fmt(r.atLeast(1)) + '</p></div><ul>' +
      '<li>ひとつも当たらない確率：<strong>' + fmt(r.none) + '</strong></li>' +
      '<li>当たる数の平均：<strong>' + r.expected.toFixed(2) + ' 個</strong>（確率の合計）</li>';
    if (k >= 2) h += '<li>' + k + ' 個以上、当たる確率：<strong>' + fmt(r.atLeast(k)) + '</strong></li>';
    if (!list) {
      var pp = ps[0];
      h += '<li>半分の人が当たるまでの応募数：<strong>' + window.lotteryEntriesNeeded(pp, 0.5) + ' 回</strong>、' +
        '9 割の人が当たるまで：<strong>' + window.lotteryEntriesNeeded(pp, 0.9) + ' 回</strong>、' +
        '99% の人が当たるまで：<strong>' + window.lotteryEntriesNeeded(pp, 0.99) + ' 回</strong></li>';
    }
    h += '</ul><div class="scroll"><table><thead><tr><th>当たる数</th><th>ちょうどその数になる確率</th></tr></thead><tbody>';
    for (var j = 0; j < r.dist.length && j <= 6; j++) {
      h += '<tr><td>' + j + ' 個</td><td>' + fmt(r.dist[j]) + '</td></tr>';
    }
    out.innerHTML = h + '</tbody></table></div>';
  }
  ['mult', 'p', 'n', 'k', 'list'].forEach(function (id) { $(id).addEventListener('input', render); });
  render();
})();
