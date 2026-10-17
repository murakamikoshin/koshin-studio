(function () {
  var $ = function (id) { return document.getElementById(id); };
  var out = $('out');
  var EN = (document.documentElement.lang || 'ja').indexOf('en') === 0;
  var T = EN ? {
    over: '99.99%+', under: 'under 0.1%',
    errList: 'Enter each win chance as a number above 0 and up to 100 (%), separated by commas or spaces.',
    labelList: function (n) { return n + ' entries (each with its own chance)'; },
    errP: 'Enter a win chance (%) or odds.',
    errN: 'Enter a whole number of entries from 1 to 200.',
    labelSame: function (p, n) { return n + ' entries at a ' + p + '% win chance'; },
    atLeast1: 'Chance of at least 1 win',
    none: 'Chance of no win at all: ', avg: 'Average number of wins: ', unit: '', avgNote: ' (sum of the chances)',
    atLeastK: function (k) { return 'Chance of ' + k + ' or more wins: '; },
    need: function (a, b, c) { return 'Entries needed for half of people to win: <strong>' + a + '</strong>, for 90%: <strong>' + b + '</strong>, for 99%: <strong>' + c + '</strong>'; },
    thWins: 'Number of wins', thP: 'Chance of exactly that many', wins: function (j) { return j + (j === 1 ? ' win' : ' wins'); }
  } : {
    over: '99.99% 超', under: '0.1% 未満',
    errList: '応募先ごとの当選確率は、0 より大きく 100 以下の数（％）を、カンマか空白で区切って入れてください。',
    labelList: function (n) { return '応募先 ' + n + ' 件（確率はそれぞれ別）'; },
    errP: '当選確率（％）か、倍率を入れてください。',
    errN: '応募する回数は、1 から 200 までの整数で入れてください。',
    labelSame: function (p, n) { return '当選確率 ' + p + '% の抽選に ' + n + ' 回応募'; },
    atLeast1: '1 つ以上、当たる確率',
    none: 'ひとつも当たらない確率：', avg: '当たる数の平均：', unit: ' 個', avgNote: '（確率の合計）',
    atLeastK: function (k) { return k + ' 個以上、当たる確率：'; },
    need: function (a, b, c) { return '半分の人が当たるまでの応募数：<strong>' + a + ' 回</strong>、9 割の人が当たるまで：<strong>' + b + ' 回</strong>、99% の人が当たるまで：<strong>' + c + ' 回</strong>'; },
    thWins: '当たる数', thP: 'ちょうどその数になる確率', wins: function (j) { return j + ' 個'; }
  };
  var fmt = function (x) {
    var v = x * 100;
    if (v >= 99.995) return T.over;
    if (v < 0.05 && v > 0) return T.under;
    return v.toFixed(1) + '%';
  };
  function num(id) { var v = $(id).value; return v === '' ? null : Number(v); }
  function listPs() {
    var raw = $('list').value.trim();
    if (!raw) return null;
    return raw.split(/[,、，\s]+/).filter(Boolean).map(Number);
  }
  function render() {
    var ps, label;
    var list = listPs();
    if (list) {
      if (list.length > 200 || list.some(function (v) { return !(v > 0 && v <= 100); })) {
        out.innerHTML = '<p class="note">' + T.errList + '</p>';
        return;
      }
      ps = list.map(function (v) { return v / 100; });
      label = T.labelList(ps.length);
    } else {
      var odds = num('mult'), p = num('p'), n = num('n');
      if (odds !== null && odds > 0) p = 100 / odds;
      if (!p || p <= 0 || p > 100) { out.innerHTML = '<p class="note">' + T.errP + '</p>'; return; }
      if (!n || n < 1 || n > 200 || n !== Math.floor(n)) { out.innerHTML = '<p class="note">' + T.errN + '</p>'; return; }
      ps = new Array(n).fill(p / 100);
      label = T.labelSame(Math.round(p * 100) / 100, n);
    }
    var r = window.lotteryCalc(ps);
    var k = Math.max(1, Math.min(num('k') || 1, ps.length));
    var h = '<div class="calc-main"><p>' + label + '</p><p>' + T.atLeast1 + '</p><p class="big">' + fmt(r.atLeast(1)) + '</p></div><ul>' +
      '<li>' + T.none + '<strong>' + fmt(r.none) + '</strong></li>' +
      '<li>' + T.avg + '<strong>' + r.expected.toFixed(2) + T.unit + '</strong>' + T.avgNote + '</li>';
    if (k >= 2) h += '<li>' + T.atLeastK(k) + '<strong>' + fmt(r.atLeast(k)) + '</strong></li>';
    if (!list) {
      var pp = ps[0];
      h += '<li>' + T.need(window.lotteryEntriesNeeded(pp, 0.5), window.lotteryEntriesNeeded(pp, 0.9), window.lotteryEntriesNeeded(pp, 0.99)) + '</li>';
    }
    h += '</ul><div class="scroll"><table><thead><tr><th>' + T.thWins + '</th><th>' + T.thP + '</th></tr></thead><tbody>';
    for (var j = 0; j < r.dist.length && j <= 6; j++) {
      h += '<tr><td>' + T.wins(j) + '</td><td>' + fmt(r.dist[j]) + '</td></tr>';
    }
    out.innerHTML = h + '</tbody></table></div>';
  }
  ['mult', 'p', 'n', 'k', 'list'].forEach(function (id) { $(id).addEventListener('input', render); });
  render();
})();
